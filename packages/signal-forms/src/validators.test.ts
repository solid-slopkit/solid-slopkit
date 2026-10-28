import { createStore, createMemo, createRoot, flush } from 'solid-js';
import type { Accessor, StoreSetter } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, required, min, max, email, pattern, minLength, maxLength, validate, error } from './index';

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

describe('built-in validators — pass/fail', () => {
  test('required: fails when empty, passes when filled', () => {
    const [model, setModel] = createStore({ name: '' });
    const f = form(model, setModel, (p) => required(p.name));

    expect(kinds(f.name.$errors())).toEqual(['required']);
    expect(f.name.$valid()).toBe(false);
    expect(f.name.$invalid()).toBe(true);

    commit(setModel, (d) => {
      d.name = 'Ada';
    });
    expect(f.name.$errors()).toEqual([]);
    expect(f.name.$valid()).toBe(true);
  });

  test('required: an empty array counts as empty', () => {
    const [model, setModel] = createStore<{ tags: string[] }>({ tags: [] });
    const f = form(model, setModel, (p) => required(p.tags));

    expect(kinds(f.tags.$errors())).toEqual(['required']);
    commit(setModel, (d) => {
      d.tags = ['x'];
    });
    expect(f.tags.$valid()).toBe(true);
  });

  test('min: fails below, passes at the bound', () => {
    const [model, setModel] = createStore<{ age: number }>({ age: 10 });
    const f = form(model, setModel, (p) => min(p.age, 18));

    expect(kinds(f.age.$errors())).toEqual(['min']);
    commit(setModel, (d) => {
      d.age = 18;
    });
    expect(f.age.$valid()).toBe(true);
  });

  test('max: fails above, passes at the bound', () => {
    const [model, setModel] = createStore<{ age: number }>({ age: 200 });
    const f = form(model, setModel, (p) => max(p.age, 120));

    expect(kinds(f.age.$errors())).toEqual(['max']);
    commit(setModel, (d) => {
      d.age = 120;
    });
    expect(f.age.$valid()).toBe(true);
  });

  test('email: fails on a bad address, passes on a good one and on empty', () => {
    const [model, setModel] = createStore({ email: 'nope' });
    const f = form(model, setModel, (p) => email(p.email));

    expect(kinds(f.email.$errors())).toEqual(['email']);
    commit(setModel, (d) => {
      d.email = 'ada@example.com';
    });
    expect(f.email.$valid()).toBe(true);
    commit(setModel, (d) => {
      d.email = '';
    });
    expect(f.email.$valid()).toBe(true); // empty is skipped (pair with required)
  });

  test('pattern: fails when a present value does not match', () => {
    const [model, setModel] = createStore({ code: 'abc' });
    const f = form(model, setModel, (p) => pattern(p.code, /^\d+$/));

    expect(kinds(f.code.$errors())).toEqual(['pattern']);
    commit(setModel, (d) => {
      d.code = '123';
    });
    expect(f.code.$valid()).toBe(true);
    commit(setModel, (d) => {
      d.code = '';
    });
    expect(f.code.$valid()).toBe(true); // empty skipped
  });

  test('minLength: fails when too short, skips empty', () => {
    const [model, setModel] = createStore({ bio: 'hi' });
    const f = form(model, setModel, (p) => minLength(p.bio, 3));

    expect(kinds(f.bio.$errors())).toEqual(['minLength']);
    commit(setModel, (d) => {
      d.bio = 'hey';
    });
    expect(f.bio.$valid()).toBe(true);
    commit(setModel, (d) => {
      d.bio = '';
    });
    expect(f.bio.$valid()).toBe(true); // empty skipped
  });

  test('maxLength: fails when too long', () => {
    const [model, setModel] = createStore({ bio: 'hello' });
    const f = form(model, setModel, (p) => maxLength(p.bio, 3));

    expect(kinds(f.bio.$errors())).toEqual(['maxLength']);
    commit(setModel, (d) => {
      d.bio = 'hi';
    });
    expect(f.bio.$valid()).toBe(true);
  });
});

describe('error model & composition', () => {
  test('a field with no rules is valid with no errors', () => {
    const [model, setModel] = createStore({ name: 'x' });
    const f = form(model, setModel);
    expect(f.name.$errors()).toEqual([]);
    expect(f.name.$valid()).toBe(true);
  });

  test('errors carry the field path', () => {
    const [model, setModel] = createStore({
      address: { street: '' },
    });
    const f = form(model, setModel, (p) => required(p.address.street));
    const [err] = f.address.street.$errors();
    expect(err!.field).toEqual(['address', 'street']);
    expect(err!.kind).toBe('required');
  });

  test('multiple rules compose; required owns emptiness', () => {
    const [model, setModel] = createStore({ name: '' });
    const f = form(model, setModel, (p) => {
      required(p.name);
      minLength(p.name, 3);
    });

    // Empty → only required fires (minLength skips empty).
    expect(kinds(f.name.$errors())).toEqual(['required']);
    // Present but short → only minLength fires.
    commit(setModel, (d) => {
      d.name = 'ab';
    });
    expect(kinds(f.name.$errors())).toEqual(['minLength']);
    // Long enough → clean.
    commit(setModel, (d) => {
      d.name = 'abc';
    });
    expect(f.name.$errors()).toEqual([]);
  });

  test('validate: general validator with error() and a cross-field read', () => {
    const [model, setModel] = createStore({ password: 'secret', confirm: '' });
    const f = form(model, setModel, (p) => {
      validate(p.confirm, (ctx) => (ctx.value() === ctx.valueOf(p.password) ? null : error('mismatch', 'Must match password')));
    });

    expect(kinds(f.confirm.$errors())).toEqual(['mismatch']);
    commit(setModel, (d) => {
      d.confirm = 'secret';
    });
    expect(f.confirm.$valid()).toBe(true);
    // Changing the other field re-derives validity (cross-field reactivity).
    commit(setModel, (d) => {
      d.password = 'changed';
    });
    expect(f.confirm.$invalid()).toBe(true);
  });
});

describe('reactivity', () => {
  test('$errors and $valid recompute when the value changes', () => {
    const [model, setModel] = createStore<{ age: number }>({ age: 10 });
    const f = form(model, setModel, (p) => min(p.age, 18));

    const [count, disposeA] = owned(() => f.age.$errors().length);
    const [ok, disposeB] = owned(() => f.age.$valid());

    expect(count()).toBe(1);
    expect(ok()).toBe(false);

    setModel((d) => {
      d.age = 20;
    });
    flush();

    expect(count()).toBe(0);
    expect(ok()).toBe(true);

    disposeA();
    disposeB();
  });
});
