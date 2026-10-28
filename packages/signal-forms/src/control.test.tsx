import { render, fireEvent } from '@solidjs/testing-library';
import { createSignal, createStore, flush, For } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { form, control, disabled, readonly } from './index';
import type { SignalForm } from './index';

type Model = {
  name: string;
  age: number;
  agree: boolean;
  color: string;
};

function setup() {
  const [model, setModel] = createStore<Model>({
    name: 'Ada',
    age: 36,
    agree: false,
    color: 'red',
  });
  let f!: SignalForm<Model>;
  const utils = render(() => {
    f = form(model, setModel);
    return (
      <form>
        <input aria-label="name" {...control(f.name)} />
        <input aria-label="age" type="number" {...control.number(f.age)} />
        <input aria-label="agree" type="checkbox" {...control.checkbox(f.agree)} />
        <select aria-label="color" {...control.select(f.color)}>
          <option value="red">red</option>
          <option value="green">green</option>
        </select>
      </form>
    );
  });
  return { model, f: f!, ...utils };
}

describe('control() text binding', () => {
  test('typing writes to the store and marks dirty; blur marks touched', () => {
    const { model, f, getByLabelText } = setup();
    const input = getByLabelText('name') as HTMLInputElement;

    expect(input.value).toBe('Ada');

    fireEvent.input(input, { target: { value: 'Grace' } });
    flush();
    expect(model.name).toBe('Grace');
    expect(f.name.$dirty()).toBe(true);
    expect(f.name.$touched()).toBe(false);

    fireEvent.blur(input);
    flush();
    expect(f.name.$touched()).toBe(true);
  });

  test('an external $set updates the input (getter tracked through spread)', () => {
    const { f, getByLabelText } = setup();
    const input = getByLabelText('name') as HTMLInputElement;

    // Outside the render owner (event-phase-like), like a real handler.
    f.name.$set('Lin');
    flush();
    expect(input.value).toBe('Lin');
  });
});

describe('control.number binding', () => {
  test('numeric input parses to a number in the store', () => {
    const { model, getByLabelText } = setup();
    const input = getByLabelText('age') as HTMLInputElement;

    expect(input.value).toBe('36');
    fireEvent.input(input, { target: { value: '42' } });
    flush();
    expect(model.age).toBe(42);
  });
});

describe('control.checkbox binding', () => {
  test('toggling the checkbox writes a boolean', () => {
    const { model, getByLabelText } = setup();
    const box = getByLabelText('agree') as HTMLInputElement;

    expect(box.checked).toBe(false);
    fireEvent.click(box);
    flush();
    expect(model.agree).toBe(true);
  });
});

describe('control.select binding', () => {
  test('changing the select writes the option value', () => {
    const { model, getByLabelText } = setup();
    const select = getByLabelText('color') as HTMLSelectElement;

    expect(select.value).toBe('red');
    fireEvent.change(select, { target: { value: 'green' } });
    flush();
    expect(model.color).toBe('green');
  });

  test('options that arrive after the value still select it', () => {
    const [model, setModel] = createStore({ color: 'green' });
    const [colors, setColors] = createSignal<string[]>([]);
    const { getByLabelText } = render(() => {
      const f = form(model, setModel);
      return (
        <select aria-label="color" {...control.select(f.color)}>
          <For each={colors()}>{(c) => <option value={c}>{c}</option>}</For>
        </select>
      );
    });
    const select = getByLabelText('color') as HTMLSelectElement;

    setColors(['red', 'green']);
    flush();
    expect(select.value).toBe('green');
  });
});

/** Renders the same form but with a condition schema, toggled by `locked`. */
function setupConditions() {
  const [model, setModel] = createStore<Model & { locked: boolean }>({
    name: 'Ada',
    age: 36,
    agree: false,
    color: 'red',
    locked: true,
  });
  let f!: SignalForm<Model & { locked: boolean }>;
  const utils = render(() => {
    f = form(model, setModel, (p) => {
      disabled(p.name, (c) => c.valueOf(p.locked));
      readonly(p.age, (c) => c.valueOf(p.locked));
      readonly(p.agree, (c) => c.valueOf(p.locked));
      readonly(p.color, (c) => c.valueOf(p.locked));
    });
    return (
      <form>
        <input aria-label="name" {...control(f.name)} />
        <input aria-label="age" type="number" {...control.number(f.age)} />
        <input aria-label="agree" type="checkbox" {...control.checkbox(f.agree)} />
        <select aria-label="color" {...control.select(f.color)}>
          <option value="red">red</option>
          <option value="green">green</option>
        </select>
      </form>
    );
  });
  return { model, setModel, f: f!, ...utils };
}

describe('control reflects conditions', () => {
  test('$disabled drives the native disabled attribute, reactively', () => {
    const { setModel, getByLabelText } = setupConditions();
    const input = getByLabelText('name') as HTMLInputElement;

    expect(input.disabled).toBe(true);

    setModel((d) => {
      d.locked = false;
    });
    flush();
    expect(input.disabled).toBe(false);
  });

  test('$readonly drives the native readonly attribute on text/number inputs', () => {
    const { setModel, getByLabelText } = setupConditions();
    const age = getByLabelText('age') as HTMLInputElement;

    expect(age.readOnly).toBe(true);
    // A readonly numeric input keeps its store value on attempted input.
    fireEvent.input(age, { target: { value: '99' } });
    flush();
    expect(age.readOnly).toBe(true);

    setModel((d) => {
      d.locked = false;
    });
    flush();
    expect(age.readOnly).toBe(false);
  });

  test('readonly checkbox blocks the toggle and snaps back', () => {
    const { model, getByLabelText } = setupConditions();
    const box = getByLabelText('agree') as HTMLInputElement;

    expect(box.checked).toBe(false);
    fireEvent.click(box);
    flush();
    expect(model.agree).toBe(false); // write blocked
    expect(box.checked).toBe(false); // DOM snapped back
  });

  test('readonly select blocks the change and snaps back', () => {
    const { model, getByLabelText } = setupConditions();
    const select = getByLabelText('color') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: 'green' } });
    flush();
    expect(model.color).toBe('red'); // write blocked
    expect(select.value).toBe('red'); // DOM snapped back
  });
});
