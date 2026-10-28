import { createStore, createMemo, createRoot, flush, runWithOwner } from 'solid-js';
import { describe, expect, test } from 'vitest';

import * as forms from './index';

// The public runtime surface, pinned: adding or removing an export is a deliberate change.
const PUBLIC_API = [
  'MAX',
  'MAX_LENGTH',
  'MIN',
  'MIN_LENGTH',
  'PATTERN',
  'REQUIRED',
  'apply',
  'applyEach',
  'applyWhen',
  'applyWhenValue',
  'bind',
  'control',
  'createMetadataKey',
  'disabled',
  'email',
  'error',
  'form',
  'hidden',
  'max',
  'maxLength',
  'metadata',
  'min',
  'minLength',
  'pattern',
  'readonly',
  'required',
  'schema',
  'submit',
  'validate',
  'validateAsync',
  'validateStandardSchema',
];

describe('forms entry', () => {
  test('exports the public API', () => {
    expect(Object.keys(forms).sort()).toEqual(PUBLIC_API);
  });
});

// Characterization test for the substrate the whole library sits on:
// a Solid store with a draft-mutation setter, giving fine-grained per-property
// reactivity. If any of these assumptions ever break, the field tree breaks with
// them — so we pin them here before building on top.
describe('Solid store substrate', () => {
  test('reads are fine-grained and writes go through a draft mutation', () => {
    createRoot((dispose) => {
      const [model, setModel] = createStore({
        user: { name: 'a', age: 1 },
        tags: ['x'],
      });

      let nameRuns = 0;
      const name = createMemo(() => {
        nameRuns++;
        return model.user.name;
      });

      expect(name()).toBe('a');
      expect(nameRuns).toBe(1);

      // Draft-mutation setter: mutate the draft at a path, not setStore(path, v).
      // Writes belong outside the owned scope (REACTIVE_WRITE_IN_OWNED_SCOPE).
      runWithOwner(null, () =>
        setModel((d) => {
          d.user.name = 'b';
        }),
      );
      flush();
      expect(name()).toBe('b');
      expect(nameRuns).toBe(2);

      // An unrelated write must NOT recompute the name memo (fine-grained).
      const runsBefore = nameRuns;
      // Writes belong outside the owned scope (REACTIVE_WRITE_IN_OWNED_SCOPE).
      runWithOwner(null, () =>
        setModel((d) => {
          d.user.age = 99;
        }),
      );
      flush();
      expect(model.user.age).toBe(99);
      expect(nameRuns).toBe(runsBefore);

      // Arrays are reactive through the same draft mutation.
      // Writes belong outside the owned scope (REACTIVE_WRITE_IN_OWNED_SCOPE).
      runWithOwner(null, () =>
        setModel((d) => {
          d.tags.push('y');
        }),
      );
      flush();
      expect([...model.tags]).toEqual(['x', 'y']);

      dispose();
    });
  });
});
