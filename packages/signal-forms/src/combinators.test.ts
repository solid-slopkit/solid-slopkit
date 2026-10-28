import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor, StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, schema, required, min, disabled, apply, applyWhen, applyWhenValue, applyEach } from './index';

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

describe('apply — rebasing a sub-schema', () => {
  type Address = { street: string; city: string };
  type Model = { name: string; shipping: Address };

  const address = schema<Address>((p) => {
    required(p.street);
    required(p.city);
  });

  test('a sub-schema attaches at the target path', () => {
    const [model, setModel] = createStore<Model>({
      name: 'Ada',
      shipping: { street: '', city: 'Turin' },
    });
    const f = form(model, setModel, (p) => apply(p.shipping, address));

    expect(kinds(f.shipping.street.$errors())).toEqual(['required']);
    expect(f.shipping.city.$valid()).toBe(true);

    commit(setModel, (d) => {
      d.shipping.street = 'Main';
    });
    expect(f.shipping.street.$valid()).toBe(true);
  });

  test('an inline schema function works too', () => {
    const [model, setModel] = createStore<Model>({
      name: 'Ada',
      shipping: { street: '', city: '' },
    });
    const f = form(model, setModel, (p) => apply(p.shipping, (s) => required(s.city)));
    expect(kinds(f.shipping.city.$errors())).toEqual(['required']);
    expect(f.shipping.street.$valid()).toBe(true); // street not targeted
  });
});

describe('applyWhen / applyWhenValue', () => {
  type Model = { needsGift: boolean; giftNote: string; tier: string };

  test('applyWhen gates the sub-schema on a condition', () => {
    const [model, setModel] = createStore<Model>({
      needsGift: false,
      giftNote: '',
      tier: 'std',
    });
    const f = form(model, setModel, (p) =>
      applyWhen(
        p.giftNote,
        (c) => c.valueOf(p.needsGift),
        (g) => required(g),
      ),
    );

    const [errs, dispose] = owned(() => kinds(f.giftNote.$errors()));
    expect(errs()).toEqual([]); // inactive: needsGift is false

    commit(setModel, (d) => {
      d.needsGift = true;
    });
    expect(errs()).toEqual(['required']); // now active and empty
    dispose();
  });

  test('applyWhenValue gates a subtree on a predicate over its value', () => {
    type Payment = { method: string; card: string };
    const [model, setModel] = createStore<{ pay: Payment }>({
      pay: { method: 'card', card: '' },
    });
    const f = form(model, setModel, (p) =>
      // Predicate reads the value at `pay`; sub-schema targets `pay.card`.
      applyWhenValue(
        p.pay,
        (v) => v.method === 'card',
        (pay) => required(pay.card),
      ),
    );

    expect(kinds(f.pay.card.$errors())).toEqual(['required']);
    commit(setModel, (d) => {
      d.pay.method = 'cash';
    });
    expect(f.pay.card.$valid()).toBe(true);
  });
});

describe('applyEach — per-item schema over an array', () => {
  type Item = { sku: string; qty: number };
  type Model = { items: Item[] };

  function setup(items: Item[]) {
    const [model, setModel] = createStore<Model>({ items });
    let f!: ReturnType<typeof form<Model>>;
    createRoot(() => {
      f = form(model, setModel, (p) =>
        applyEach(p.items, (item) => {
          required(item.sku);
          min(item.qty, 1);
        }),
      );
    });
    return { model, setModel, f };
  }

  test('the item schema resolves for every index', () => {
    const { f } = setup([
      { sku: 'A', qty: 2 },
      { sku: '', qty: 0 },
    ]);

    expect(f.items[0]!.sku.$valid()).toBe(true);
    expect(f.items[0]!.qty.$valid()).toBe(true);
    expect(kinds(f.items[1]!.sku.$errors())).toEqual(['required']);
    expect(kinds(f.items[1]!.qty.$errors())).toEqual(['min']);
  });

  test('per-item validity reacts to edits', () => {
    const { setModel, f } = setup([{ sku: '', qty: 0 }]);
    const [valid, dispose] = owned(() => f.items[0]!.sku.$valid());
    expect(valid()).toBe(false);

    commit(setModel, (d) => {
      d.items[0]!.sku = 'X';
    });
    expect(valid()).toBe(true);
    dispose();
  });

  test('an appended item is validated (index appears after insert)', () => {
    const { setModel, f } = setup([{ sku: 'A', qty: 1 }]);

    commit(setModel, (d) => {
      d.items.push({ sku: '', qty: 5 });
    });
    expect(kinds(f.items[1]!.sku.$errors())).toEqual(['required']);
    expect(f.items[1]!.qty.$valid()).toBe(true);
  });

  test('removing an item leaves no stale errors; positions revalidate', () => {
    const { setModel, f } = setup([
      { sku: 'A', qty: 1 }, // valid
      { sku: '', qty: 1 }, // invalid sku
    ]);
    expect(f.items[1]!.sku.$invalid()).toBe(true);

    // Drop the invalid item; index 1 no longer exists, index 0 stays valid.
    commit(setModel, (d) => {
      d.items.splice(1, 1);
    });
    expect(f.items[0]!.sku.$valid()).toBe(true);
    expect(f.items[1]!.sku.$errors()).toEqual([]); // gone, not stale
  });

  test('reorder: each position validates by its current value', () => {
    const { setModel, f } = setup([
      { sku: 'A', qty: 1 }, // valid
      { sku: '', qty: 1 }, // invalid
    ]);
    const [pos0, d0] = owned(() => f.items[0]!.sku.$valid());
    const [pos1, d1] = owned(() => f.items[1]!.sku.$valid());
    expect(pos0()).toBe(true);
    expect(pos1()).toBe(false);

    // Swap the two items; validity follows the value now at each position.
    commit(setModel, (d) => {
      d.items = [d.items[1]!, d.items[0]!];
    });
    expect(pos0()).toBe(false);
    expect(pos1()).toBe(true);
    d0();
    d1();
  });

  test('conditions compose inside applyEach (sibling ref via valueOf)', () => {
    type M = { rows: { locked: boolean; value: string }[] };
    const [model, setModel] = createStore<M>({
      rows: [
        { locked: true, value: 'x' },
        { locked: false, value: 'y' },
      ],
    });
    let f!: ReturnType<typeof form<M>>;
    createRoot(() => {
      f = form(model, setModel, (p) => applyEach(p.rows, (row) => disabled(row.value, (c) => c.valueOf(row.locked))));
    });
    expect(f.rows[0]!.value.$disabled()).toBe(true);
    expect(f.rows[1]!.value.$disabled()).toBe(false);
  });

  test('applyWhen nests inside applyEach — cond reads the item sibling', () => {
    type Row = { needsNote: boolean; note: string };
    type M = { rows: Row[] };
    const [model, setModel] = createStore<M>({
      rows: [
        { needsNote: true, note: '' }, // active + empty → required
        { needsNote: false, note: '' }, // inactive → ok
      ],
    });
    let f!: ReturnType<typeof form<M>>;
    createRoot(() => {
      f = form(model, setModel, (p) =>
        applyEach(p.rows, (row) =>
          applyWhen(
            row.note,
            (c) => c.valueOf(row.needsNote),
            (note) => required(note),
          ),
        ),
      );
    });
    expect(kinds(f.rows[0]!.note.$errors())).toEqual(['required']);
    expect(f.rows[1]!.note.$valid()).toBe(true);
  });

  test('applyEach nests inside applyEach — array of arrays', () => {
    type M = { grid: { cells: { name: string }[] }[] };
    const [model, setModel] = createStore<M>({
      grid: [{ cells: [{ name: 'a' }, { name: '' }] }, { cells: [{ name: '' }] }],
    });
    let f!: ReturnType<typeof form<M>>;
    createRoot(() => {
      f = form(model, setModel, (p) => applyEach(p.grid, (row) => applyEach(row.cells, (cell) => required(cell.name))));
    });
    expect(f.grid[0]!.cells[0]!.name.$valid()).toBe(true);
    expect(kinds(f.grid[0]!.cells[1]!.name.$errors())).toEqual(['required']);
    expect(kinds(f.grid[1]!.cells[0]!.name.$errors())).toEqual(['required']);
  });
});
