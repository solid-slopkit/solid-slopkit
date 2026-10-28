import { fireEvent, render as renderBare } from '@solidjs/testing-library';
import type { JSX } from '@solidjs/web';
import { createStore, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { Checkbox, NativeSelect, NumberInput, Select, Switch, TextInput, SlopkitUi } from '@solid-slopkit/components';

// The ui inputs must render inside the provider.
const render = (ui: () => JSX.Element) => renderBare(ui, { wrapper: (props) => <SlopkitUi>{props.children}</SlopkitUi> });

import { bind, disabled, form, readonly, required, submit, validate, error, type SignalForm } from './index';

type Model = {
  name: string;
  agree: boolean;
  age: number | undefined;
  fruit: string | null;
};

function setup(def?: Parameters<typeof form<Model>>[2]) {
  const [model, setModel] = createStore<Model>({ name: 'Ada', agree: false, age: 36, fruit: 'Pear' });
  let f!: SignalForm<Model>;
  const utils = render(() => {
    f = form(model, setModel, def);
    return (
      <form>
        <TextInput id="name" label="Name" {...bind.text(f.name)} />
        <Checkbox id="agree" label="Agree" {...bind.checked(f.agree)} />
        <NumberInput id="age" label="Age" {...bind(f.age)} />
        <Select id="fruit" label="Fruit" data={['Apple', 'Pear']} {...bind(f.fruit)} />
      </form>
    );
  });
  return { model, f: f!, ...utils };
}

const type = async (input: HTMLInputElement, value: string) => {
  input.value = value;
  fireEvent.input(input);
  flush();
  await Promise.resolve(); // the controlled reconcile runs in a microtask
};

const input = (container: HTMLElement, id: string) => container.querySelector<HTMLInputElement>(`#${id}`)!;

describe('bind() types', () => {
  test('a Field must carry the type the component reports', () => {
    const [model, setModel] = createStore({ age: 1, label: 'x' });
    render(() => {
      const f = form(model, setModel);
      return (
        <>
          {/* NumberInput reports `number | undefined`; a `number` field cannot take that. */}
          {/* @ts-expect-error */}
          <NumberInput {...bind(f.age)} />
          {/* A string field fits a text input. */}
          <TextInput {...bind.text(f.label)} />
        </>
      );
    });
  });
});

describe('bind() with slopkit inputs', () => {
  test('a text input shows the value and writes the typed value back', async () => {
    const { model, f, container } = setup();
    expect(input(container, 'name').value).toBe('Ada');

    await type(input(container, 'name'), 'Grace');
    expect(model.name).toBe('Grace');
    expect(f.name.$value()).toBe('Grace');

    f.name.$set('Hopper');
    flush();
    expect(input(container, 'name').value).toBe('Hopper');
  });

  test('a checkbox is bound by `checked`', () => {
    const { model, container } = setup();
    expect(input(container, 'agree').checked).toBe(false);

    fireEvent.click(input(container, 'agree'));
    flush();
    expect(model.agree).toBe(true);
    expect(input(container, 'agree').checked).toBe(true);
  });

  test('a number input takes `number | undefined`, the type it reports', async () => {
    const { model, container } = setup();
    expect(input(container, 'age').value).toBe('36');

    await type(input(container, 'age'), '41');
    expect(model.age).toBe(41);
  });

  test('a select takes `string | null` and shows the selected label', () => {
    const { container } = setup();
    expect(container.querySelector('#fruit')).toHaveTextContent('Pear');
  });

  test('the error shows once the field is touched, not while it is pristine', async () => {
    const { f, container } = setup((p) => required(p.name, 'Name is required'));
    await type(input(container, 'name'), '');
    expect(f.name.$invalid()).toBe(true);
    expect(container.querySelector('[data-slot="input-wrapper-error"]')).toBeNull();

    fireEvent.blur(input(container, 'name'));
    flush();
    expect(container.querySelector('[data-slot="input-wrapper-error"]')).toHaveTextContent('Name is required');
    expect(input(container, 'name')).toHaveAttribute('aria-invalid', 'true');

    await type(input(container, 'name'), 'Ada');
    expect(container.querySelector('[data-slot="input-wrapper-error"]')).toBeNull();
  });

  test('an error without a message still marks the input invalid', () => {
    const { f, container } = setup((p) => validate(p.name, () => error('custom')));
    f.name.$markTouched();
    flush();
    expect(bind(f.name).error).toBe(true);
    expect(input(container, 'name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('submit surfaces every error, because it touches every field', async () => {
    const { f, container } = setup((p) => {
      required(p.name, 'Name is required');
      validate(p.age, (ctx) => (Number(ctx.value()) < 18 ? error('min', 'Too young') : null));
    });
    await type(input(container, 'name'), '');
    expect(container.querySelector('[data-slot="input-wrapper-error"]')).toBeNull();

    await submit(f, () => {});
    flush();
    expect(container.querySelector('[data-slot="input-wrapper-error"]')).toHaveTextContent('Name is required');
  });

  test('`required` follows the required() rule', () => {
    const { container } = setup((p) => required(p.name));
    expect(container.querySelector('label[for="name"] [data-slot="input-wrapper-required"]')).not.toBeNull();
    expect(container.querySelector('label[for="agree"] [data-slot="input-wrapper-required"]')).toBeNull();
  });

  test('conditions reach the input: disabled and readonly', () => {
    const { f, container } = setup((p) => {
      disabled(p.age, (ctx) => ctx.valueOf(p.agree) === false);
      readonly(p.name, (ctx) => ctx.valueOf(p.agree) === false);
    });
    expect(input(container, 'age')).toBeDisabled();
    expect(input(container, 'name')).toHaveAttribute('readonly');

    f.agree.$set(true);
    flush();
    expect(input(container, 'age')).not.toBeDisabled();
    expect(input(container, 'name')).not.toHaveAttribute('readonly');
  });

  test('a switch is bound like a checkbox', () => {
    const [model, setModel] = createStore({ on: false });
    const { container } = render(() => {
      const f = form(model, setModel);
      return <Switch id="on" label="On" {...bind.checked(f.on)} />;
    });
    fireEvent.click(input(container, 'on'));
    flush();
    expect(model.on).toBe(true);
  });

  test('a native select takes `string`, writes the chosen option back and refuses edits while readonly', () => {
    const [model, setModel] = createStore({ plan: 'team', locked: false });
    const { container } = render(() => {
      const f = form(model, setModel, (p) => {
        required(p.plan);
        readonly(p.plan, ({ valueOf }) => valueOf(p.locked));
      });
      return <NativeSelect id="plan" label="Plan" data={['solo', 'team', 'company']} {...bind.nativeSelect(f.plan)} />;
    });
    const select = container.querySelector<HTMLSelectElement>('#plan')!;
    expect(select.value).toBe('team');
    expect(select).toBeRequired();

    select.value = 'company';
    fireEvent.change(select);
    flush();
    expect(model.plan).toBe('company');

    setModel((draft) => {
      draft.locked = true;
    });
    flush();
    select.value = 'solo';
    fireEvent.change(select);
    flush();
    expect(model.plan).toBe('company');
    expect(select.value).toBe('company');
  });

  test('the binding reads the field through getters, so a spread tracks it', () => {
    const [model, setModel] = createStore({ name: 'a' });
    let f!: SignalForm<{ name: string }>;
    render(() => {
      f = form(model, setModel);
      return null;
    });
    const b = bind(f.name);
    expect(b.value).toBe('a');
    f.name.$set('b');
    flush();
    expect(b.value).toBe('b');
    expect(Object.keys(b).sort()).toEqual(['disabled', 'error', 'onBlur', 'onChange', 'readOnly', 'required', 'value']);
    expect(Object.keys(bind.text(f.name)).sort()).toEqual([
      'disabled',
      'error',
      'onBlur',
      'onInput',
      'readOnly',
      'required',
      'value',
    ]);
    expect(Object.keys(bind.nativeSelect(f.name)).sort()).toEqual(Object.keys(b).sort());
  });
});
