import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor, StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, submit, required, min, disabled, applyEach, validateAsync, error } from './index';

/** Applies a store mutation and flushes it, so a following direct read sees it. */
function commit<T>(setModel: StoreSetter<T>, mutate: (draft: T) => void): void {
  setModel(mutate as never);
  flush();
}

/** Builds an owned memo over `fn` and returns [accessor, dispose]. */
function owned<T>(fn: () => T): [Accessor<T>, () => void] {
  let acc!: Accessor<T>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    acc = createMemo(fn);
  });
  return [acc, dispose];
}

/** A promise plus its resolver, for driving an async handler by hand. */
function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

describe('submit gates on validity', () => {
  type Model = { name: string; age: number };

  function setup(model: Model) {
    const [store, setStore] = createStore<Model>(model);
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        required(p.name);
        min(p.age, 18);
      });
    });
    return { setStore, f };
  }

  test('an invalid form does not call the handler', async () => {
    const { f } = setup({ name: '', age: 10 });
    let called = false;

    await submit(f, () => {
      called = true;
    });

    expect(called).toBe(false);
  });

  test('submit marks every field touched so errors surface', async () => {
    const { f } = setup({ name: '', age: 10 });
    expect(f.name.$touched()).toBe(false);

    await submit(f, () => {});

    // Even though nothing was blurred, the whole tree is now touched.
    expect(f.name.$touched()).toBe(true);
    expect(f.age.$touched()).toBe(true);
    expect(f.$touched()).toBe(true); // root rolls up
  });

  test('a valid form calls the handler with the effective value', async () => {
    const { f } = setup({ name: 'Ada', age: 36 });
    let received: Model | undefined;

    await submit(f, (value) => {
      received = value;
    });

    expect(received).toEqual({ name: 'Ada', age: 36 });
  });

  test('becoming valid unblocks a later submit', async () => {
    const { setStore, f } = setup({ name: '', age: 36 });
    let calls = 0;

    await submit(f, () => {
      calls += 1;
    });
    expect(calls).toBe(0); // name still required

    commit(setStore, (d) => {
      d.name = 'Ada';
    });
    await submit(f, () => {
      calls += 1;
    });
    expect(calls).toBe(1);
  });
});

describe('submit excludes disabled fields', () => {
  type Model = { useCoupon: boolean; coupon: string; email: string };

  test('a disabled invalid field neither blocks submit nor appears in the value', async () => {
    const [store, setStore] = createStore<Model>({
      useCoupon: false,
      coupon: '', // required-but-empty, but disabled
      email: 'a@b.co',
    });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        required(p.coupon);
        disabled(p.coupon, (c) => !c.valueOf(p.useCoupon));
      });
    });
    let received: Model | undefined;

    await submit(f, (value) => {
      received = value as Model;
    });

    // Submitted (not blocked) and the disabled key is pruned from the value.
    expect(received).toEqual({ useCoupon: false, email: 'a@b.co' });
  });
});

describe('$submitting reflects an in-flight handler', () => {
  type Model = { name: string };

  function setup() {
    const [store, setStore] = createStore<Model>({ name: 'Ada' });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => required(p.name));
    });
    return { f };
  }

  test('$submitting is true while an async handler runs, then false', async () => {
    const { f } = setup();
    const [submitting, dispose] = owned(() => f.$submitting());
    expect(submitting()).toBe(false);

    const gate = deferred();
    const done = submit(f, () => gate.promise);
    flush();
    expect(submitting()).toBe(true); // handler in flight

    gate.resolve();
    await done;
    flush();
    expect(submitting()).toBe(false);
    dispose();
  });

  test('$submitting is the same shared fact on every node', async () => {
    const { f } = setup();
    const [rootS, disposeRoot] = owned(() => f.$submitting());
    const [leafS, disposeLeaf] = owned(() => f.name.$submitting());

    const gate = deferred();
    const done = submit(f, () => gate.promise);
    flush();
    expect(rootS()).toBe(true);
    expect(leafS()).toBe(true); // descendant reflects the one submit

    gate.resolve();
    await done;
    flush();
    expect(rootS()).toBe(false);
    expect(leafS()).toBe(false);
    disposeRoot();
    disposeLeaf();
  });

  test('$submitting stays false when submit is blocked as invalid', async () => {
    const [store, setStore] = createStore<Model>({ name: '' });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => required(p.name));
    });

    await submit(f, () => deferred().promise); // handler never even runs
    flush();
    expect(f.$submitting()).toBe(false);
  });

  test('$submitting clears even when the handler rejects', async () => {
    const { f } = setup();
    await expect(submit(f, () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    flush();
    expect(f.$submitting()).toBe(false);
  });
});

describe('submit over an array form', () => {
  type Item = { sku: string; qty: number };
  type Model = { items: Item[] };

  test('blocks while any item is invalid, submits once fixed', async () => {
    const [store, setStore] = createStore<Model>({
      items: [
        { sku: 'A', qty: 2 },
        { sku: '', qty: 0 }, // required + min
      ],
    });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) =>
        applyEach(p.items, (item) => {
          required(item.sku);
          min(item.qty, 1);
        }),
      );
    });
    let received: Model | undefined;

    await submit(f, (v) => {
      received = v as Model;
    });
    expect(received).toBeUndefined(); // blocked

    commit(setStore, (d) => {
      d.items[1] = { sku: 'B', qty: 3 };
    });
    await submit(f, (v) => {
      received = v as Model;
    });
    expect(received).toEqual({
      items: [
        { sku: 'A', qty: 2 },
        { sku: 'B', qty: 3 },
      ],
    });
  });
});

describe('submit and asynchronous validation', () => {
  type Model = { username: string };

  function setup(gate: { promise: Promise<void> }, taken: string) {
    const [store, setStore] = createStore<Model>({ username: taken });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        validateAsync(p.username, async (ctx) => {
          const v = ctx.value();
          await gate.promise;
          return v === 'taken' ? error('taken', 'Already taken') : null;
        });
      });
    });
    return { f };
  }

  test('waits for in-flight validation, then blocks when it reports an error', async () => {
    const gate = deferred();
    const { f } = setup(gate, 'taken');
    const received: Model[] = [];

    const done = submit(f, (v) => {
      received.push(v);
    });
    await Promise.resolve();
    expect(received).toEqual([]); // still validating: the handler has not run

    gate.resolve();
    await done;
    flush();
    expect(received).toEqual([]); // the settled error blocked it
    expect(f.username.$errors().map((e) => e.kind)).toEqual(['taken']);
  });

  test('waits for in-flight validation, then runs the handler when it passes', async () => {
    const gate = deferred();
    const { f } = setup(gate, 'free');
    const received: Model[] = [];

    const done = submit(f, (v) => {
      received.push(v);
    });
    await Promise.resolve();
    expect(received).toEqual([]);

    gate.resolve();
    await done;
    expect(received).toEqual([{ username: 'free' }]);
  });
});

describe('submit while a submit is in flight', () => {
  test('a second call is ignored until the handler settles', async () => {
    const [store, setStore] = createStore({ name: 'Ada' });
    let f!: ReturnType<typeof form<{ name: string }>>;
    createRoot(() => {
      f = form(store, setStore, (p) => required(p.name));
    });

    let calls = 0;
    const gate = deferred();
    const first = submit(f, () => {
      calls++;
      return gate.promise;
    });
    flush();
    await submit(f, () => {
      calls++;
    });
    expect(calls).toBe(1);

    gate.resolve();
    await first;
    await submit(f, () => {
      calls++;
    });
    expect(calls).toBe(2); // submitting again after it settled works
  });
});

describe('submit handler types', () => {
  test('a handler may return any value, such as a response promise', async () => {
    const [store, setStore] = createStore({ name: 'Ada' });
    let f!: ReturnType<typeof form<{ name: string }>>;
    createRoot(() => {
      f = form(store, setStore);
    });
    await submit(f, (value) => Promise.resolve(value.name.length));
    await submit(f, (value) => value.name);
  });
});
