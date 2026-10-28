import { createStore, createRoot, flush } from 'solid-js';
import type { StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, validateStandardSchema, required, disabled, applyEach, type SignalForm, type StandardSchemaV1 } from './index';

/** Applies a store mutation and flushes it. */
function commit<T>(setModel: StoreSetter<T>, mutate: (draft: T) => void): void {
  setModel(mutate as never);
  flush();
}

/** Drains a macrotask so an async schema settles, then flushes. */
async function settle(): Promise<void> {
  flush();
  await new Promise((r) => setTimeout(r));
  flush();
}

/** Reads accessors (materializing nodes + scheduling effects), then flushes. */
function warm(...reads: Array<() => unknown>): void {
  for (const r of reads) r();
  flush();
}

/** Builds `form(...)` inside a live root so its owned effects/memos persist. */
function harness<T extends object>(
  model: T,
  setModel: StoreSetter<T>,
  def: Parameters<typeof form<T>>[2],
): { f: SignalForm<T>; dispose: () => void } {
  let f!: SignalForm<T>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    f = form(model, setModel, def);
  });
  return { f, dispose };
}

/** The `kind`s / messages reported at a field. */
const kinds = (errors: readonly { kind: string }[]) => errors.map((e) => e.kind);
const messages = (errors: readonly { message?: string }[]) => errors.map((e) => e.message);

// --- Standard Schema fixtures (spec-conforming, no external dependency) ------

/** A synchronous Standard Schema from a plain issue-producing function. */
function syncSchema<T>(validate: (v: T) => readonly StandardSchemaV1.Issue[]): StandardSchemaV1<T, T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) => {
        const issues = validate(value as T);
        return issues.length ? { issues } : { value: value as T };
      },
    },
  };
}

/** An asynchronous Standard Schema (validate resolves after a microtask). */
function asyncSchema<T>(validate: (v: T) => readonly StandardSchemaV1.Issue[]): StandardSchemaV1<T, T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: async (value) => {
        await Promise.resolve();
        const issues = validate(value as T);
        return issues.length ? { issues } : { value: value as T };
      },
    },
  };
}

type Person = { name: string; age: number };
const personSchema = syncSchema<Person>((v) => {
  const out: StandardSchemaV1.Issue[] = [];
  if (!v.name) out.push({ message: 'name required', path: ['name'] });
  if (v.age < 18) out.push({ message: 'too young', path: ['age'] });
  return out;
});

describe('validateStandardSchema (v2)', () => {
  test('an object schema distributes issues to the matching sub-fields', async () => {
    const [model, setModel] = createStore<Person>({ name: '', age: 12 });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateStandardSchema(p, personSchema);
    });

    warm(() => f.$errors());
    expect(kinds(f.name.$errors())).toEqual(['standard']);
    expect(messages(f.name.$errors())).toEqual(['name required']);
    expect(messages(f.age.$errors())).toEqual(['too young']);
    // Root rolls both up.
    expect(f.$errors().length).toBe(2);
    expect(f.$valid()).toBe(false);

    dispose();
  });

  test('issues clear and re-derive reactively as fields change', async () => {
    const [model, setModel] = createStore<Person>({ name: '', age: 12 });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateStandardSchema(p, personSchema);
    });

    warm(() => f.$errors());
    expect(f.$errors().length).toBe(2);

    commit(setModel, (d) => {
      d.name = 'Ada';
    });
    flush();
    expect(f.name.$errors()).toEqual([]);
    expect(f.age.$errors().length).toBe(1); // age still too young
    expect(f.$errors().length).toBe(1);

    commit(setModel, (d) => {
      d.age = 30;
    });
    flush();
    expect(f.$errors()).toEqual([]);
    expect(f.$valid()).toBe(true);

    dispose();
  });

  test('an empty issue path lands on the schema’s own (leaf) field', async () => {
    const emailSchema = syncSchema<string>((v) => (v.includes('@') ? [] : [{ message: 'bad email' }]));
    const [model, setModel] = createStore({ email: 'nope' });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateStandardSchema(p.email, emailSchema);
    });

    warm(() => f.email.$errors());
    expect(messages(f.email.$errors())).toEqual(['bad email']);

    commit(setModel, (d) => {
      d.email = 'a@b.com';
    });
    flush();
    expect(f.email.$errors()).toEqual([]);

    dispose();
  });

  test('composes with the built-in synchronous validators', async () => {
    const [model, setModel] = createStore<Person>({ name: '', age: 12 });
    const { f, dispose } = harness(model, setModel, (p) => {
      required(p.name, 'name is required');
      validateStandardSchema(p, personSchema);
    });

    warm(() => f.name.$errors());
    // Built-in `required` first, then the Standard Schema issue.
    expect(kinds(f.name.$errors())).toEqual(['required', 'standard']);

    dispose();
  });

  test('a nested schema resolves relative to its attach point', async () => {
    type Model = { address: { street: string; zip: string } };
    const addressSchema = syncSchema<Model['address']>((v) => {
      const out: StandardSchemaV1.Issue[] = [];
      if (!v.street) out.push({ message: 'street required', path: ['street'] });
      if (!/^\d{5}$/.test(v.zip)) out.push({ message: 'bad zip', path: ['zip'] });
      return out;
    });
    const [model, setModel] = createStore<Model>({
      address: { street: '', zip: 'x' },
    });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateStandardSchema(p.address, addressSchema);
    });

    warm(() => f.address.$errors());
    expect(messages(f.address.street.$errors())).toEqual(['street required']);
    expect(messages(f.address.zip.$errors())).toEqual(['bad zip']);
    expect(f.address.$errors().length).toBe(2);

    dispose();
  });

  test('per-item Standard Schema via applyEach', async () => {
    type Model = { items: { sku: string }[] };
    const itemSchema = syncSchema<{ sku: string }>((v) => (v.sku ? [] : [{ message: 'sku required', path: ['sku'] }]));
    const [model, setModel] = createStore<Model>({
      items: [{ sku: 'A' }, { sku: '' }],
    });
    const { f, dispose } = harness(model, setModel, (p) => {
      applyEach(p.items, (item) => {
        validateStandardSchema(item, itemSchema);
      });
    });

    warm(
      () => f.items[0]!.$errors(),
      () => f.items[1]!.$errors(),
    );
    expect(f.items[0]!.sku.$errors()).toEqual([]);
    expect(messages(f.items[1]!.sku.$errors())).toEqual(['sku required']);
    expect(f.items.$invalid()).toBe(true);

    dispose();
  });

  test('an async Standard Schema flips $pending, then surfaces its issues', async () => {
    const [model, setModel] = createStore<Person>({ name: '', age: 30 });
    const { f, dispose } = harness(model, setModel, (p) => {
      validateStandardSchema(
        p,
        asyncSchema<Person>((v) => (v.name ? [] : [{ message: 'name required', path: ['name'] }])),
      );
    });

    warm(() => f.$pending());
    expect(f.$pending()).toBe(true); // whole-object schema in flight
    await settle();
    expect(f.$pending()).toBe(false);
    expect(messages(f.name.$errors())).toEqual(['name required']);

    commit(setModel, (d) => {
      d.name = 'Ada';
    });
    await settle();
    expect(f.name.$errors()).toEqual([]);
    expect(f.$valid()).toBe(true);

    dispose();
  });

  test('a disabled subtree runs no Standard Schema and reports no errors', async () => {
    type Model = { group: Person; off: boolean };
    let ran = 0;
    const spySchema = syncSchema<Person>((v) => {
      ran++;
      return v.name ? [] : [{ message: 'name required', path: ['name'] }];
    });
    const [model, setModel] = createStore<Model>({
      group: { name: '', age: 12 },
      off: true,
    });
    const { f, dispose } = harness(model, setModel, (p) => {
      disabled(p.group, (c) => c.valueOf(p.off));
      validateStandardSchema(p.group, spySchema);
    });

    warm(() => f.group.$errors());
    expect(f.group.$errors()).toEqual([]);
    expect(ran).toBe(0);

    commit(setModel, (d) => {
      d.off = false;
    });
    flush();
    expect(f.group.name.$errors().length).toBe(1);
    expect(ran).toBeGreaterThan(0);

    dispose();
  });
});
