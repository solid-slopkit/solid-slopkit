import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor, StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, submit, required, minLength, min, validate, error, disabled, hidden, readonly, applyEach } from './index';

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

/** The `kind`s reported at a field, in order. */
function kinds(errors: readonly { kind: string }[]): string[] {
  return errors.map((e) => e.kind);
}

describe('Container validity rollup', () => {
  type Address = { street: string; city: string };
  type Model = { name: string; address: Address };

  function setup(model: Model) {
    const [store, setStore] = createStore<Model>(model);
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        required(p.name);
        required(p.address.street);
        minLength(p.address.city, 2);
      });
    });
    return { setStore, f };
  }

  test('a Container is invalid while any enabled descendant is invalid', () => {
    const { f } = setup({ name: 'Ada', address: { street: '', city: 'Turin' } });

    expect(f.address.street.$invalid()).toBe(true);
    expect(f.address.$valid()).toBe(false); // street is empty
    expect(f.$valid()).toBe(false); // root rolls up too
  });

  test('a Container is valid once every descendant is valid', () => {
    const { setStore, f } = setup({
      name: 'Ada',
      address: { street: '', city: 'Turin' },
    });
    const [valid, dispose] = owned(() => f.$valid());
    expect(valid()).toBe(false);

    commit(setStore, (d) => {
      d.address.street = 'Main';
    });
    expect(valid()).toBe(true);
    dispose();
  });

  test('$errors on a Container summarizes its subtree in tree order', () => {
    const { f } = setup({ name: '', address: { street: '', city: 'x' } });

    // root: name (required), then address subtree: street (required), city (minLength)
    expect(kinds(f.$errors())).toEqual(['required', 'required', 'minLength']);
    // a sub-container summarizes only its own subtree
    expect(kinds(f.address.$errors())).toEqual(['required', 'minLength']);
  });

  test('an own Container validator composes with descendant errors', () => {
    const [store, setStore] = createStore<Model>({
      name: 'Ada',
      address: { street: '', city: 'Turin' },
    });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        // A validator on the Container value itself.
        validate(p.address, (c) => (c.value().street === c.value().city ? error('sameStreetCity') : null));
        required(p.address.street);
      });
    });

    // own container error is not triggered; only the descendant's required.
    expect(kinds(f.address.$errors())).toEqual(['required']);

    commit(setStore, (d) => {
      d.address.street = 'Turin'; // now street === city → own error, street valid
    });
    expect(kinds(f.address.$errors())).toEqual(['sameStreetCity']);
  });
});

describe('disabled descendants are excluded from validity', () => {
  type Model = { useCoupon: boolean; coupon: string; email: string };

  test('a disabled invalid field does not make its Container invalid', () => {
    const [store, setStore] = createStore<Model>({
      useCoupon: false,
      coupon: '',
      email: 'a@b.co',
    });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        required(p.coupon);
        disabled(p.coupon, (c) => !c.valueOf(p.useCoupon));
      });
    });

    // coupon is required-but-empty, but disabled → excluded from the rollup.
    expect(f.coupon.$errors()).toEqual([]);
    expect(f.$valid()).toBe(true);
  });

  test('enabling the field brings its error back into the rollup', () => {
    const [store, setStore] = createStore<Model>({
      useCoupon: false,
      coupon: '',
      email: 'a@b.co',
    });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        required(p.coupon);
        disabled(p.coupon, (c) => !c.valueOf(p.useCoupon));
      });
    });
    const [valid, dispose] = owned(() => f.$valid());
    expect(valid()).toBe(true);

    commit(setStore, (d) => {
      d.useCoupon = true; // coupon now enabled and empty
    });
    expect(valid()).toBe(false);
    expect(kinds(f.$errors())).toEqual(['required']);
    dispose();
  });
});

describe('touched rollup', () => {
  type Model = { address: { street: string; city: string } };

  function setup() {
    const [store, setStore] = createStore<Model>({
      address: { street: 'Main', city: 'Turin' },
    });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore);
    });
    return { f };
  }

  test('a Container is touched once any descendant is touched', () => {
    const { f } = setup();
    const [touched, dispose] = owned(() => f.address.$touched());
    expect(touched()).toBe(false);
    expect(f.$touched()).toBe(false);

    f.address.city.$markTouched();
    flush();

    expect(touched()).toBe(true);
    expect(f.$touched()).toBe(true); // root rolls up too
    dispose();
  });

  test('$reset clears the touched rollup', () => {
    const { f } = setup();
    f.address.city.$markTouched();
    flush();
    expect(f.$touched()).toBe(true);

    f.$reset();
    flush();
    expect(f.$touched()).toBe(false);
  });
});

describe('array Container rollup', () => {
  type Item = { sku: string; qty: number };
  type Model = { items: Item[] };

  function setup(items: Item[]) {
    const [store, setStore] = createStore<Model>({ items });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) =>
        applyEach(p.items, (item) => {
          required(item.sku);
          min(item.qty, 1);
        }),
      );
    });
    return { setStore, f };
  }

  test('an array Container aggregates every item and reacts to removal', () => {
    const { setStore, f } = setup([
      { sku: 'A', qty: 2 }, // valid
      { sku: '', qty: 0 }, // required + min
    ]);
    const [errs, dispose] = owned(() => kinds(f.items.$errors()));
    expect(errs()).toEqual(['required', 'min']);
    expect(f.items.$valid()).toBe(false);

    // Drop the invalid item; the rollup clears with no stale errors.
    commit(setStore, (d) => {
      d.items.splice(1, 1);
    });
    expect(errs()).toEqual([]);
    expect(f.items.$valid()).toBe(true);
    dispose();
  });

  test('appending an invalid item invalidates the Container', () => {
    const { setStore, f } = setup([{ sku: 'A', qty: 1 }]);
    const [valid, dispose] = owned(() => f.$valid());
    expect(valid()).toBe(true);

    commit(setStore, (d) => {
      d.items.push({ sku: '', qty: 1 });
    });
    expect(valid()).toBe(false);
    dispose();
  });
});

describe('hidden and readonly fields still take part in validation', () => {
  // Only `disabled` prunes a field. Hidden changes the view and readonly the editing; both keep
  // the field in the value, so both keep its errors in the rollup and in `submit`.
  type Model = { code: string; note: string };

  function setup(def: Parameters<typeof form<Model>>[2]) {
    const [store, setStore] = createStore<Model>({ code: '', note: 'x' });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, def);
    });
    return f;
  }

  test('a hidden invalid field makes its Container invalid and blocks submit', async () => {
    const f = setup((p) => {
      required(p.code);
      hidden(p.code, () => true);
    });
    expect(f.code.$hidden()).toBe(true);
    expect(kinds(f.code.$errors())).toEqual(['required']);
    expect(f.$valid()).toBe(false);

    let ran = false;
    await submit(f, () => {
      ran = true;
    });
    expect(ran).toBe(false);
  });

  test('a readonly invalid field makes its Container invalid and blocks submit', async () => {
    const f = setup((p) => {
      required(p.code);
      readonly(p.code, () => true);
    });
    expect(f.code.$readonly()).toBe(true);
    expect(kinds(f.code.$errors())).toEqual(['required']);
    expect(f.$valid()).toBe(false);

    let ran = false;
    await submit(f, () => {
      ran = true;
    });
    expect(ran).toBe(false);
  });

  test('hidden and readonly fields are submitted, unlike disabled ones', async () => {
    const [store, setStore] = createStore<Model>({ code: 'c', note: 'n' });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(store, setStore, (p) => {
        hidden(p.code, () => true);
        readonly(p.note, () => true);
      });
    });
    let received: Model | undefined;
    await submit(f, (v) => {
      received = v;
    });
    expect(received).toEqual({ code: 'c', note: 'n' });
  });
});
