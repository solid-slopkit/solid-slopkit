import { createStore, createRoot, createEffect, flush } from 'solid-js';
import type { StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, validateAsync, required, disabled, applyEach, error, type SignalForm } from './index';

/** Applies a store mutation and flushes it, so a following read sees it. */
function commit<T>(setModel: StoreSetter<T>, mutate: (draft: T) => void): void {
  setModel(mutate as never);
  flush();
}

/** Drains microtasks + a macrotask so in-flight async validators settle, then flushes. */
async function settle(): Promise<void> {
  flush();
  await new Promise((r) => setTimeout(r));
  flush();
}

/**
 * Reads the given accessors — materializing their Field nodes and scheduling the
 * async-validation effect — then flushes so that initial run actually fires. In a
 * real app, rendering reads these accessors; a test has to do it explicitly
 * before asserting on the in-flight state.
 */
function warm(...reads: Array<() => unknown>): void {
  for (const r of reads) r();
  flush();
}

/** Builds `form(...)` inside a live root so its owned effects/memos persist. */
function harness<T extends object>(
  model: T,
  setModel: StoreSetter<T>,
  def: Parameters<typeof form<T>>[2],
): { f: SignalForm<T>; dispose: () => void } {
  let f!: SignalForm<T>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    f = form(model, setModel, def);
  });
  return { f, dispose };
}

/** The `kind`s reported at a field, in order. */
function kinds(errors: readonly { kind: string }[]): string[] {
  return errors.map((e) => e.kind);
}

describe('validateAsync + $pending (v2)', () => {
  test('pending flips true while in flight, then reports the resolved error', async () => {
    const [model, setModel] = createStore({ username: 'taken' });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateAsync(p.username, async (ctx) => {
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken', 'Already taken') : null;
      });
    });

    // First run kicks off once the node is materialized and its effect flushed.
    warm(() => f.username.$pending());
    expect(f.username.$pending()).toBe(true);
    expect(f.username.$errors()).toEqual([]);

    await settle();
    expect(f.username.$pending()).toBe(false);
    expect(kinds(f.username.$errors())).toEqual(['taken']);
    expect(f.username.$valid()).toBe(false);

    dispose();
  });

  test('resolving to null leaves the field valid and not pending', async () => {
    const [model, setModel] = createStore({ username: 'free' });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateAsync(p.username, async (ctx) => {
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken') : null;
      });
    });

    warm(() => f.username.$pending());
    await settle();
    expect(f.username.$pending()).toBe(false);
    expect(f.username.$errors()).toEqual([]);
    expect(f.username.$valid()).toBe(true);

    dispose();
  });

  test('editing the value re-runs the check; the latest result wins', async () => {
    const [model, setModel] = createStore({ username: 'taken' });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateAsync(p.username, async (ctx) => {
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken') : null;
      });
    });

    warm(() => f.username.$errors());
    await settle();
    expect(kinds(f.username.$errors())).toEqual(['taken']);

    commit(setModel, (d) => {
      d.username = 'free';
    });
    expect(f.username.$pending()).toBe(true); // re-validating
    await settle();
    expect(f.username.$pending()).toBe(false);
    expect(f.username.$errors()).toEqual([]);

    dispose();
  });

  test('rapid edits drop the stale resolution (generation guard)', async () => {
    const [model, setModel] = createStore({ username: 'taken' });
    let order = 0;
    const { f, dispose } = harness(model, setModel, (p) => {
      validateAsync(p.username, async (ctx) => {
        const v = ctx.value();
        // Older values resolve *later* — so a naive impl would let the stale
        // "taken" land after the fresh "free". The generation guard must drop it.
        const delay = v === 'taken' ? 30 : 5;
        await new Promise((r) => setTimeout(r, delay));
        order++;
        return v === 'taken' ? error('taken') : null;
      });
    });

    warm(() => f.username.$pending()); // kick the slow "taken" run
    commit(setModel, (d) => {
      d.username = 'free';
    }); // supersede with the fast "free" run

    await new Promise((r) => setTimeout(r, 60));
    flush();
    expect(f.username.$pending()).toBe(false);
    expect(f.username.$errors()).toEqual([]); // fresh "free" wins, stale dropped
    expect(order).toBe(2); // both ran, but only the latest was applied

    dispose();
  });

  test('async errors compose after synchronous ones', async () => {
    const [model, setModel] = createStore({ username: 'taken' });
    const { f, dispose } = harness(model, setModel, (p) => {
      required(p.username);
      validateAsync(p.username, async (ctx) => {
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken') : null;
      });
    });

    warm(() => f.username.$errors());
    await settle();
    expect(kinds(f.username.$errors())).toEqual(['taken']); // filled → sync passes

    // Empty: sync `required` fires; the async check (guarding emptiness) yields none.
    commit(setModel, (d) => {
      d.username = '';
    });
    await settle();
    expect(kinds(f.username.$errors())).toEqual(['required']);

    dispose();
  });

  test('$pending rolls up to the Container/root', async () => {
    const [model, setModel] = createStore({ user: { name: 'taken' } });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateAsync(p.user.name, async (ctx) => {
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken') : null;
      });
    });

    warm(() => f.$pending()); // root rollup walk materializes the whole subtree
    expect(f.user.name.$pending()).toBe(true);
    expect(f.user.$pending()).toBe(true); // container rollup
    expect(f.$pending()).toBe(true); // root rollup

    await settle();
    expect(f.$pending()).toBe(false);
    expect(f.user.$pending()).toBe(false);

    dispose();
  });

  test('a disabled field runs no async validator — never pending, no error', async () => {
    const [model, setModel] = createStore({ username: 'taken', off: true });
    let ran = 0;
    const { f, dispose } = harness(model, setModel, (p) => {
      disabled(p.username, (c) => c.valueOf(p.off));
      validateAsync(p.username, async (ctx) => {
        ran++;
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken') : null;
      });
    });

    warm(() => f.username.$pending());
    await settle();
    expect(f.username.$pending()).toBe(false);
    expect(f.username.$errors()).toEqual([]);
    expect(ran).toBe(0);

    // Re-enabling runs the check.
    commit(setModel, (d) => {
      d.off = false;
    });
    expect(f.username.$pending()).toBe(true);
    await settle();
    expect(kinds(f.username.$errors())).toEqual(['taken']);
    expect(ran).toBe(1);

    dispose();
  });

  test('per-item async validation via applyEach', async () => {
    const [model, setModel] = createStore<{ tags: string[] }>({
      tags: ['taken', 'free'],
    });
    const { f, dispose } = harness(model, setModel, (p) => {
      applyEach(p.tags, (tag) => {
        validateAsync(tag, async (ctx) => {
          const v = ctx.value();
          await Promise.resolve();
          return v === 'taken' ? error('taken') : null;
        });
      });
    });

    // Materialize both items and let them settle.
    warm(
      () => f.tags[0]!.$pending(),
      () => f.tags[1]!.$pending(),
    );
    await settle();
    expect(kinds(f.tags[0]!.$errors())).toEqual(['taken']);
    expect(f.tags[1]!.$errors()).toEqual([]);
    expect(f.tags.$invalid()).toBe(true);

    dispose();
  });

  test('pending is observable through an effect', async () => {
    const [model, setModel] = createStore({ username: 'taken' });
    const seen: boolean[] = [];
    const { f, dispose } = harness(model, setModel, (p) => {
      validateAsync(p.username, async (ctx) => {
        const v = ctx.value();
        await Promise.resolve();
        return v === 'taken' ? error('taken') : null;
      });
    });
    createRoot(() => {
      createEffect(
        () => f.username.$pending(),
        (p) => {
          seen.push(p);
        },
      );
    });

    await settle();
    // Saw at least the true→false transition.
    expect(seen).toContain(true);
    expect(seen[seen.length - 1]).toBe(false);

    dispose();
  });
});
