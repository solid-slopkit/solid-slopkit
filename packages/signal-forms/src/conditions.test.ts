import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor, StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, disabled, hidden, readonly } from './index';
import { formInternals } from './form';

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

describe('conditions — disabled / hidden / readonly', () => {
  test('unconditional disabled marks the field, default false elsewhere', () => {
    const [model, setModel] = createStore({ name: '', coupon: '' });
    const f = form(model, setModel, (p) => disabled(p.coupon));

    expect(f.coupon.$disabled()).toBe(true);
    expect(f.name.$disabled()).toBe(false);
    expect(f.coupon.$hidden()).toBe(false);
    expect(f.coupon.$readonly()).toBe(false);
  });

  test('conditional disabled reacts to another field', () => {
    const [model, setModel] = createStore({ hasCoupon: false, coupon: '' });
    const f = form(model, setModel, (p) => disabled(p.coupon, (c) => !c.valueOf(p.hasCoupon)));

    const [d, dispose] = owned(() => f.coupon.$disabled());
    expect(d()).toBe(true);

    commit(setModel, (m) => {
      m.hasCoupon = true;
    });
    expect(d()).toBe(false);
    dispose();
  });

  test('hidden reacts and is independent of disabled/readonly', () => {
    const [model, setModel] = createStore({ advanced: false, note: '' });
    const f = form(model, setModel, (p) => hidden(p.note, (c) => !c.valueOf(p.advanced)));

    const [h, dispose] = owned(() => f.note.$hidden());
    expect(h()).toBe(true);
    expect(f.note.$disabled()).toBe(false);
    expect(f.note.$readonly()).toBe(false);

    commit(setModel, (m) => {
      m.advanced = true;
    });
    expect(h()).toBe(false);
    dispose();
  });

  test('readonly can be unconditional', () => {
    const [model, setModel] = createStore({ id: 'x' });
    const f = form(model, setModel, (p) => readonly(p.id));
    expect(f.id.$readonly()).toBe(true);
    expect(f.id.$disabled()).toBe(false);
  });
});

describe('condition propagation to a subtree', () => {
  type Model = {
    enabled: boolean;
    address: { street: string; city: string };
  };
  const initial = (): Model => ({
    enabled: false,
    address: { street: 'Main', city: 'Turin' },
  });

  test('a disabled Container disables its descendants', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => disabled(p.address));

    expect(f.address.$disabled()).toBe(true);
    expect(f.address.street.$disabled()).toBe(true);
    expect(f.address.city.$disabled()).toBe(true);
  });

  test('inherited disabled tracks the ancestor condition reactively', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => disabled(p.address, (c) => !c.valueOf(p.enabled)));

    const [street, dispose] = owned(() => f.address.street.$disabled());
    expect(street()).toBe(true);

    commit(setModel, (m) => {
      m.enabled = true;
    });
    expect(street()).toBe(false);
    dispose();
  });

  test('a child stays disabled even when the ancestor is not', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => disabled(p.address.city));

    expect(f.address.$disabled()).toBe(false);
    expect(f.address.street.$disabled()).toBe(false);
    expect(f.address.city.$disabled()).toBe(true);
  });

  test('hidden propagates the same way', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => hidden(p.address));
    expect(f.address.street.$hidden()).toBe(true);
    expect(f.address.city.$hidden()).toBe(true);
  });
});

describe('effective value — disabled fields pruned', () => {
  type Model = {
    name: string;
    coupon: string;
    address: { street: string; city: string };
    tags: string[];
  };
  const initial = (): Model => ({
    name: 'Ada',
    coupon: 'SECRET',
    address: { street: 'Main', city: 'Turin' },
    tags: ['a', 'b', 'c'],
  });

  test('a disabled leaf is omitted from the effective value', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => disabled(p.coupon));

    const eff = formInternals(f).effectiveValue();
    expect(eff).not.toHaveProperty('coupon');
    expect(eff).toMatchObject({ name: 'Ada' });
  });

  test('a disabled Container prunes its whole subtree', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => disabled(p.address));

    expect(formInternals(f).effectiveValue()).not.toHaveProperty('address');
  });

  test('hidden and readonly fields are kept in the effective value', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => {
      hidden(p.name);
      readonly(p.address.city);
    });

    const eff = formInternals(f).effectiveValue() as Model;
    expect(eff.name).toBe('Ada');
    expect(eff.address.city).toBe('Turin');
  });

  test('disabled array items are dropped', () => {
    const [model, setModel] = createStore<Model>(initial());
    const f = form(model, setModel, (p) => disabled(p.tags[1]!));

    const eff = formInternals(f).effectiveValue() as Model;
    expect(eff.tags).toEqual(['a', 'c']);
  });

  test('toggling a condition changes the effective value reactively', () => {
    const [model, setModel] = createStore<Model & { locked: boolean }>({
      ...initial(),
      locked: true,
    });
    const f = form(model, setModel, (p) => disabled(p.coupon, (c) => c.valueOf(p.locked)));

    const [hasCoupon, dispose] = owned(() => 'coupon' in (formInternals(f).effectiveValue() as object));
    expect(hasCoupon()).toBe(false);

    commit(setModel, (m) => {
      m.locked = false;
    });
    expect(hasCoupon()).toBe(true);
    dispose();
  });
});
