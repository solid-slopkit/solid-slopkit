import { createStore, createEffect, createRoot, flush } from 'solid-js';
import type { StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { captureArtifact } from '@solidjs/diagnostics';
import type { DiagnosticsArtifact } from '@solidjs/diagnostics';
import '@solidjs/diagnostics/vitest';

import { form, required, minLength, min, applyEach } from './index';

/**
 * v1 exit-gate reactive-diagnostics check (AGENTS.md). Aggregate Field State is
 * memoized, so a Container's rollup fans out to a form-level consumer
 * only when the rolled-up value actually changes. These scenarios assert that as
 * machine-checkable budgets: an edit that doesn't change validity stays contained
 * to the edited field, and one that does propagates exactly once.
 */

type Item = { sku: string; qty: number };
type Model = {
  name: string;
  address: { street: string; city: string };
  items: Item[];
};

function seed(): Model {
  return {
    name: 'Ada',
    address: { street: 'Main', city: 'Turin' },
    items: [
      { sku: 'A-1', qty: 2 },
      { sku: 'B-2', qty: 5 },
    ],
  };
}

/**
 * Mounts a valid form under an owner with typical UI subscriptions — a
 * form-level validity/error readout plus two per-field error readouts — then
 * applies one edit and returns the captured artifact. The edit runs *after* the
 * owned setup returns, so its store write isn't a REACTIVE_WRITE_IN_OWNED_SCOPE.
 */
async function capture(scenario: string, edit: (set: StoreSetter<Model>) => void): Promise<DiagnosticsArtifact> {
  const { artifact } = await captureArtifact(
    () => {
      const [store, setStore] = createStore<Model>(seed());
      createRoot(() => {
        const f = form(store, setStore, (p) => {
          required(p.name);
          minLength(p.name, 2);
          required(p.address.street);
          required(p.address.city);
          applyEach(p.items, (item) => {
            required(item.sku);
            min(item.qty, 1);
          });
        });
        createEffect(
          () => f.$valid(),
          () => {},
          { name: 'obs:rootValid' },
        );
        createEffect(
          () => f.$errors().length,
          () => {},
          { name: 'obs:rootErrors' },
        );
        createEffect(
          () => f.name.$errors(),
          () => {},
          { name: 'obs:name' },
        );
        createEffect(
          () => f.address.street.$errors(),
          () => {},
          { name: 'obs:street' },
        );
      });
      flush(); // settle the initial run before the interaction under test
      edit(setStore);
    },
    { scenario },
  );
  return artifact;
}

describe('reactive diagnostics — aggregate rollups (v1 exit gate)', () => {
  test('a valid-staying leaf edit does not fan out to the form rollups', async () => {
    // city has a `required` rule; 'Turin' → 'Rome' is valid both ways.
    const artifact = await capture('leaf-edit-stays-valid', (set) =>
      set((d) => {
        d.address.city = 'Rome';
      }),
    );

    // No anti-pattern diagnostics (wide reads, untracked reads, …).
    expect(artifact).toHaveNoDiagnostics();
    // The edit re-checks only the edited field's own validation — the form-level
    // `valid`/`errors` rollups (and sibling fields) never recompute.
    expect(artifact).toStayWithinRerunBudget(0, { scope: /@root$/ });
    expect(artifact).toStayWithinRerunBudget(0, {
      scope: /@(name|address\.street)$/,
    });
    // Whole scenario: one recompute (the edited leaf's errors), no fan-out.
    expect(artifact).toStayWithinRerunBudget(1);
  });

  test('an edit that flips validity propagates to the root exactly once', async () => {
    // Clearing a required field turns the form invalid.
    const artifact = await capture('leaf-edit-flips-valid', (set) =>
      set((d) => {
        d.name = '';
      }),
    );

    expect(artifact).toHaveNoDiagnostics();
    // Validity genuinely changed, so the root validity + error rollups update —
    // but each only once (memoization must not amplify the single write).
    expect(artifact).toStayWithinRerunBudget(1, { scope: /^valid@root$/ });
    expect(artifact).toStayWithinRerunBudget(1, { scope: /^errors@root$/ });
  });
});
