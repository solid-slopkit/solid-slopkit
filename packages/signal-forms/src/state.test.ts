import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form } from './index';
import type { SignalForm } from './index';

type Model = {
  name: string;
  address: { street: string; city: string };
  tags: string[];
};

/**
 * Creates the form inside an owned root (like a component mounting), then hands
 * back the tree so the test can interact *outside* the owned scope — Solid 2.0
 * forbids state writes during owned execution (REACTIVE_WRITE_IN_OWNED_SCOPE),
 * exactly as `$set`/`$markTouched`/`$reset` would be called from real handlers.
 */
function setup() {
  const [model, setModel] = createStore<Model>({
    name: 'Ada',
    address: { street: 'Main', city: 'Turin' },
    tags: ['a', 'b'],
  });
  let f!: SignalForm<Model>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    f = form(model, setModel);
  });
  return { model, f, dispose };
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

describe('leaf writes via $set', () => {
  test('$set writes back to the store and $value reflects it', () => {
    const { model, f, dispose } = setup();

    f.name.$set('Grace');
    flush();
    expect(f.name.$value()).toBe('Grace');
    expect(model.name).toBe('Grace');

    f.address.street.$set('Broadway');
    flush();
    expect(model.address.street).toBe('Broadway');

    f.tags[1]!.$set('z');
    flush();
    expect(model.tags[1]).toBe('z');

    dispose();
  });

  test('$set on a container replaces the subtree', () => {
    const { model, f, dispose } = setup();

    f.address.$set({ street: 'Elm', city: 'Rome' });
    flush();
    expect(model.address).toEqual({ street: 'Elm', city: 'Rome' });

    dispose();
  });
});

describe('$dirty', () => {
  test('leaf dirty tracks divergence from the initial value', () => {
    const { f, dispose } = setup();
    const [dirty, disposeMemo] = owned(() => f.name.$dirty());

    expect(dirty()).toBe(false);

    f.name.$set('Grace');
    flush();
    expect(dirty()).toBe(true);

    // Returning to the initial value clears dirty.
    f.name.$set('Ada');
    flush();
    expect(dirty()).toBe(false);

    disposeMemo();
    dispose();
  });

  test('container dirty is true when any descendant changed', () => {
    const { f, dispose } = setup();

    expect(f.address.$dirty()).toBe(false);
    f.address.city.$set('Rome');
    flush();
    expect(f.address.$dirty()).toBe(true);
    expect(f.$dirty()).toBe(true); // root too

    f.address.city.$set('Turin');
    flush();
    expect(f.address.$dirty()).toBe(false);

    dispose();
  });
});

describe('$touched / $markTouched', () => {
  test('touched defaults false and flips on markTouched', () => {
    const { f, dispose } = setup();

    expect(f.name.$touched()).toBe(false);
    f.name.$markTouched();
    flush();
    expect(f.name.$touched()).toBe(true);
    // Independent of dirty.
    expect(f.name.$dirty()).toBe(false);

    dispose();
  });

  test('$markTouched keeps one identity per field, so it is safe as a handler prop', () => {
    const { f, dispose } = setup();
    expect(f.name.$markTouched).toBe(f.name.$markTouched);
    dispose();
  });
});

describe('$reset', () => {
  test('reset restores value and clears touched across a subtree', () => {
    const { model, f, dispose } = setup();

    f.address.street.$set('Broadway');
    f.address.city.$set('Rome');
    f.address.street.$markTouched();
    flush();
    expect(f.address.$dirty()).toBe(true);
    expect(f.address.street.$touched()).toBe(true);

    f.address.$reset();
    flush();
    expect(model.address).toEqual({ street: 'Main', city: 'Turin' });
    expect(f.address.$dirty()).toBe(false);
    expect(f.address.street.$touched()).toBe(false);

    dispose();
  });

  test('root reset restores the whole model', () => {
    const { model, f, dispose } = setup();

    f.name.$set('Grace');
    f.tags[0]!.$set('x');
    flush();
    expect(f.$dirty()).toBe(true);

    f.$reset();
    flush();
    expect(model).toEqual({
      name: 'Ada',
      address: { street: 'Main', city: 'Turin' },
      tags: ['a', 'b'],
    });
    expect(f.$dirty()).toBe(false);

    dispose();
  });
});
