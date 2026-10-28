import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, schema } from './index';
import { formInternals } from './form';
import { addRule } from './schema';

type Model = {
  name: string;
  address: { street: string; city: string };
  tags: string[];
};

function makeModel() {
  return createStore<Model>({
    name: 'Ada',
    address: { street: 'Main', city: 'Turin' },
    tags: ['a', 'b'],
  });
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

describe('schema authoring — path & registration', () => {
  test('rules attach at the navigated path, including array indices', () => {
    const [model, setModel] = makeModel();
    const f = form(model, setModel, (path) => {
      addRule(path.name, 'noop', () => null);
      addRule(path.address.street, 'noop', () => null);
      addRule(path.tags[0]!, 'noop', () => null);
    });

    const inspect = formInternals(f);
    expect(inspect.rulesAt(['name'])).toHaveLength(1);
    expect(inspect.rulesAt(['address', 'street'])).toHaveLength(1);
    expect(inspect.rulesAt(['tags', 0])).toHaveLength(1);
    // A path with no rule returns an empty list, not undefined.
    expect(inspect.rulesAt(['address', 'city'])).toEqual([]);
  });

  test('addRule outside a schema function throws', () => {
    expect(() =>
      // A validator-like call with no active schema.
      (addRule as unknown as (p: unknown, k: string, r: () => null) => void)({}, 'noop', () => null),
    ).toThrow(/outside a schema function/);
  });

  test('schema() produces a reusable bundle applied by form()', () => {
    const reusable = schema<Model>((path) => {
      addRule(path.name, 'noop', () => null);
    });
    const [model, setModel] = makeModel();
    const f = form(model, setModel, reusable);
    expect(formInternals(f).rulesAt(['name'])).toHaveLength(1);
  });
});

describe('logic context — value & valueOf', () => {
  test('ctx reads the target and cross-field values, reactively', () => {
    const [model, setModel] = makeModel();
    const f = form(model, setModel, (path) => {
      addRule(path.address.street, 'probe', (ctx) => ({
        self: ctx.value(),
        name: ctx.valueOf(path.name),
      }));
    });

    const [rule] = formInternals(f).rulesAt(['address', 'street']);
    const ctx = formInternals(f).contextAt(['address', 'street']);

    const [out, dispose] = owned(() => rule!.run(ctx) as { self: string; name: string });
    expect(out()).toEqual({ self: 'Main', name: 'Ada' });

    // Target field change is observed reactively.
    setModel((d) => {
      d.address.street = 'Broadway';
    });
    flush();
    expect(out().self).toBe('Broadway');

    // Cross-field (valueOf) change is observed reactively.
    setModel((d) => {
      d.name = 'Grace';
    });
    flush();
    expect(out().name).toBe('Grace');

    dispose();
  });
});
