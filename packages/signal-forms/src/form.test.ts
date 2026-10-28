import { createStore, createMemo, createRoot, flush, runWithOwner } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form } from './index';

type Model = {
  name: string;
  address: { street: string; city: string };
  tags: string[];
  nickname?: string;
};

function makeModel() {
  return createStore<Model>({
    name: 'Ada',
    address: { street: 'Main', city: 'Turin' },
    tags: ['a', 'b'],
  });
}

describe('form() — field tree navigation & $value', () => {
  test('reads leaf and nested values via $value', () => {
    createRoot((dispose) => {
      const [model, setModel] = makeModel();
      const f = form(model, setModel);

      expect(f.name.$value()).toBe('Ada');
      expect(f.address.street.$value()).toBe('Main');
      expect(f.address.city.$value()).toBe('Turin');
      // A container node's $value is the whole sub-object.
      expect(f.address.$value()).toEqual({ street: 'Main', city: 'Turin' });
      // Root $value is the whole model.
      expect(f.$value()).toEqual(model);

      dispose();
    });
  });

  test('$value is reactive and fine-grained', () => {
    createRoot((dispose) => {
      const [model, setModel] = makeModel();
      const f = form(model, setModel);

      let streetRuns = 0;
      const street = createMemo(() => {
        streetRuns++;
        return f.address.street.$value();
      });

      expect(street()).toBe('Main');
      expect(streetRuns).toBe(1);

      // Writes belong outside the owned scope (REACTIVE_WRITE_IN_OWNED_SCOPE).

      runWithOwner(null, () =>
        setModel((d) => {
          d.address.street = 'Broadway';
        }),
      );
      flush();
      expect(street()).toBe('Broadway');
      expect(streetRuns).toBe(2);

      // An unrelated leaf write does not recompute the street memo.
      const before = streetRuns;
      // Writes belong outside the owned scope (REACTIVE_WRITE_IN_OWNED_SCOPE).
      runWithOwner(null, () =>
        setModel((d) => {
          d.name = 'Grace';
        }),
      );
      flush();
      expect(streetRuns).toBe(before);

      dispose();
    });
  });

  test('array items navigate by numeric index and stay reactive', () => {
    createRoot((dispose) => {
      const [model, setModel] = makeModel();
      const f = form(model, setModel);

      expect(f.tags[0]!.$value()).toBe('a');
      expect(f.tags[1]!.$value()).toBe('b');
      expect(f.tags.$value()).toEqual(['a', 'b']);

      // Writes belong outside the owned scope (REACTIVE_WRITE_IN_OWNED_SCOPE).

      runWithOwner(null, () =>
        setModel((d) => {
          d.tags[0] = 'z';
        }),
      );
      flush();
      expect(f.tags[0]!.$value()).toBe('z');

      dispose();
    });
  });

  test('node identity is stable for the same path', () => {
    createRoot((dispose) => {
      const [model, setModel] = makeModel();
      const f = form(model, setModel);

      expect(f.address).toBe(f.address);
      expect(f.address.street).toBe(f.address.street);
      expect(f.tags[0]).toBe(f.tags[0]);
      // '0' and 0 normalize to the same node.
      expect((f.tags as Record<string, unknown>)['0']).toBe(f.tags[0]);

      dispose();
    });
  });

  test('navigation to a missing/undefined key is predictable', () => {
    createRoot((dispose) => {
      const [model, setModel] = makeModel();
      const f = form(model, setModel);

      // Optional-but-absent leaf reads as undefined.
      expect(f.nickname.$value()).toBeUndefined();

      // Navigating *through* a nullish hole does not throw; it reads undefined.
      const ghost = (f as Record<string, any>).missing.deeper.$value;
      expect(ghost()).toBeUndefined();

      dispose();
    });
  });
});
