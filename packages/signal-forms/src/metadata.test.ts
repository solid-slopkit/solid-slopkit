import { createStore, flush } from 'solid-js';
import type { StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import {
  form,
  metadata,
  createMetadataKey,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  required,
  applyEach,
  apply,
  schema,
  MIN,
  MAX,
  MIN_LENGTH,
  MAX_LENGTH,
  PATTERN,
  REQUIRED,
} from './index';

/** Applies a store mutation and flushes it, so a following read sees it. */
function commit<T>(setModel: StoreSetter<T>, mutate: (draft: T) => void): void {
  setModel(mutate as never);
  flush();
}

describe('metadata (v2)', () => {
  test('a static metadata value reads back through $metadata', () => {
    const HINT = createMetadataKey<string>('hint');
    const [model, setModel] = createStore({ name: '' });
    const f = form(model, setModel, (p) => metadata(p.name, HINT, 'Legal name'));

    expect(f.name.$metadata(HINT)).toBe('Legal name');
  });

  test('$metadata is undefined when no metadata is declared for a key', () => {
    const HINT = createMetadataKey<string>('hint');
    const [model, setModel] = createStore({ name: '' });
    const f = form(model, setModel, () => {});

    expect(f.name.$metadata(HINT)).toBeUndefined();
  });

  test('distinct keys do not collide', () => {
    const A = createMetadataKey<string>('a');
    const B = createMetadataKey<string>('b');
    const [model, setModel] = createStore({ name: '' });
    const f = form(model, setModel, (p) => {
      metadata(p.name, A, 'alpha');
      metadata(p.name, B, 'beta');
    });

    expect(f.name.$metadata(A)).toBe('alpha');
    expect(f.name.$metadata(B)).toBe('beta');
  });

  test('a reactive metadata value re-derives from the model', () => {
    const LABEL = createMetadataKey<string>('label');
    const [model, setModel] = createStore({ name: 'Ada', upper: false });
    const f = form(model, setModel, (p) => {
      metadata(p.name, LABEL, (ctx) => (ctx.valueOf(p.upper) ? ctx.value().toUpperCase() : ctx.value()));
    });

    expect(f.name.$metadata(LABEL)).toBe('Ada');
    commit(setModel, (d) => {
      d.upper = true;
    });
    expect(f.name.$metadata(LABEL)).toBe('ADA');
    commit(setModel, (d) => {
      d.name = 'Alan';
    });
    expect(f.name.$metadata(LABEL)).toBe('ALAN');
  });

  test('multiple values at one field reduce per the key', () => {
    const SUM = createMetadataKey<number>('sum', (vs) => vs.reduce((a, b) => a + b, 0));
    const [model, setModel] = createStore({ n: 0 });
    const f = form(model, setModel, (p) => {
      metadata(p.n, SUM, 1);
      metadata(p.n, SUM, 2);
      metadata(p.n, SUM, 3);
    });

    expect(f.n.$metadata(SUM)).toBe(6);
  });

  test('without a reducer, the last-declared value wins', () => {
    const K = createMetadataKey<string>('k');
    const [model, setModel] = createStore({ name: '' });
    const f = form(model, setModel, (p) => {
      metadata(p.name, K, 'first');
      metadata(p.name, K, 'last');
    });

    expect(f.name.$metadata(K)).toBe('last');
  });

  describe('built-in validators publish limit keys', () => {
    test('min / max', () => {
      const [model, setModel] = createStore({ age: 0 });
      const f = form(model, setModel, (p) => {
        min(p.age, 18);
        max(p.age, 120);
      });

      expect(f.age.$metadata(MIN)).toBe(18);
      expect(f.age.$metadata(MAX)).toBe(120);
    });

    test('minLength / maxLength', () => {
      const [model, setModel] = createStore({ name: '' });
      const f = form(model, setModel, (p) => {
        minLength(p.name, 2);
        maxLength(p.name, 20);
      });

      expect(f.name.$metadata(MIN_LENGTH)).toBe(2);
      expect(f.name.$metadata(MAX_LENGTH)).toBe(20);
    });

    test('pattern / required', () => {
      const re = /^\d{5}$/;
      const [model, setModel] = createStore({ zip: '' });
      const f = form(model, setModel, (p) => {
        required(p.zip);
        pattern(p.zip, re);
      });

      expect(f.zip.$metadata(PATTERN)).toBe(re);
      expect(f.zip.$metadata(REQUIRED)).toBe(true);
    });

    test('two mins keep the most restrictive (max) bound', () => {
      const [model, setModel] = createStore({ age: 0 });
      const f = form(model, setModel, (p) => {
        min(p.age, 18);
        min(p.age, 21);
      });

      expect(f.age.$metadata(MIN)).toBe(21);
    });

    test('two maxes keep the most restrictive (min) bound', () => {
      const [model, setModel] = createStore({ age: 0 });
      const f = form(model, setModel, (p) => {
        max(p.age, 100);
        max(p.age, 65);
      });

      expect(f.age.$metadata(MAX)).toBe(65);
    });
  });

  test('metadata resolves per-item under applyEach', () => {
    type Model = { items: { qty: number }[] };
    const [model, setModel] = createStore<Model>({
      items: [{ qty: 0 }, { qty: 0 }],
    });
    const f = form(model, setModel, (p) => {
      applyEach(p.items, (item) => min(item.qty, 1));
    });

    expect(f.items[0]!.qty.$metadata(MIN)).toBe(1);
    expect(f.items[1]!.qty.$metadata(MIN)).toBe(1);
  });

  test('metadata resolves relative to an apply attach point', () => {
    type Address = { zip: string };
    const addressRules = schema<Address>((a) => pattern(a.zip, /^\d{5}$/));
    type Model = { shipping: Address };
    const [model, setModel] = createStore<Model>({ shipping: { zip: '' } });
    const f = form(model, setModel, (p) => apply(p.shipping, addressRules));

    expect(f.shipping.zip.$metadata(PATTERN)).toBeInstanceOf(RegExp);
  });
});
