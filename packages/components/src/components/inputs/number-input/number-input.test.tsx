import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { NumberInput } from './number-input';

const renderIn = (ui: () => JSX.Element, locale?: string) => render(() => <SlopkitUi locale={locale}>{ui()}</SlopkitUi>);
const type = (control: HTMLElement, text: string) => {
  (control as HTMLInputElement).value = text;
  fireEvent.input(control);
  flush();
};
const key = (control: HTMLElement, key: string) => {
  fireEvent.keyDown(control, { key });
  flush();
};

describe('<NumberInput />', () => {
  test('a labelled spinbutton with its value, bounds and controls', () => {
    const { getByRole, container } = renderIn(() => (
      <NumberInput label="Quantity" defaultValue={3} min={0} max={10} class="mine" />
    ));
    const control = getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement;

    expect(control.value).toBe('3');
    expect(control).toHaveAttribute('type', 'text');
    expect(control).toHaveAttribute('aria-valuenow', '3');
    expect(control).toHaveAttribute('aria-valuemin', '0');
    expect(control).toHaveAttribute('aria-valuemax', '10');
    expect(control).toHaveAttribute('inputmode', 'decimal');
    expect(container.querySelector('.slp-number-input')).toHaveClass('slp-input-wrapper', 'mine');
    expect(getByRole('button', { name: 'Increase' })).toHaveAttribute('tabindex', '-1');
    expect(getByRole('button', { name: 'Decrease' })).toHaveAttribute('data-slot', 'number-input-decrement');
  });

  test('grouped in the locale while not focused; ungrouped while editing', () => {
    const { getByRole } = renderIn(() => <NumberInput label="Amount" defaultValue={1234567.5} />, 'de-DE');
    const control = getByRole('spinbutton') as HTMLInputElement;

    expect(control.value).toBe('1.234.567,5');
    expect(control).toHaveAttribute('aria-valuetext', '1.234.567,5');

    fireEvent.focus(control);
    flush();
    expect(control.value).toBe('1234567,5');

    fireEvent.blur(control);
    flush();
    expect(control.value).toBe('1.234.567,5');
  });

  test('typing keeps only what makes a number and reports it; emptying reports undefined', () => {
    const onChange = vi.fn();
    const { getByRole } = renderIn(() => <NumberInput label="Amount" onChange={onChange} />);
    const control = getByRole('spinbutton') as HTMLInputElement;
    fireEvent.focus(control);

    type(control, '12a.5');
    expect(control.value).toBe('12.5');
    expect(onChange).toHaveBeenLastCalledWith(12.5);
    expect(control).toHaveAttribute('aria-valuenow', '12.5');

    type(control, '');
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(control).not.toHaveAttribute('aria-valuenow');
  });

  test('a lone minus stays while typing, as an empty value', () => {
    const onChange = vi.fn();
    const { getByRole } = renderIn(() => <NumberInput label="Offset" defaultValue={5} onChange={onChange} />);
    const control = getByRole('spinbutton') as HTMLInputElement;
    fireEvent.focus(control);

    type(control, '-');
    expect(control.value).toBe('-');
    expect(onChange).toHaveBeenLastCalledWith(undefined);

    type(control, '-3');
    expect(onChange).toHaveBeenLastCalledWith(-3);
  });

  test('no minus when min is zero or more; no decimals with decimalScale 0', () => {
    const { getAllByRole } = renderIn(() => (
      <>
        <NumberInput label="Count" min={0} />
        <NumberInput label="Whole" decimalScale={0} allowNegative={false} />
      </>
    ));
    const [count, whole] = getAllByRole('spinbutton') as HTMLInputElement[];
    fireEvent.focus(count);
    type(count, '-4');
    fireEvent.focus(whole);
    type(whole, '4.5');

    expect(count.value).toBe('4');
    expect(count).toHaveAttribute('inputmode', 'decimal');
    expect(whole.value).toBe('45');
    expect(whole).toHaveAttribute('inputmode', 'numeric');
  });

  test('leaving the field clamps to min and max and rounds to decimalScale', () => {
    const onChange = vi.fn();
    const { getByRole } = renderIn(() => <NumberInput label="Rate" min={0} max={10} decimalScale={1} onChange={onChange} />);
    const control = getByRole('spinbutton') as HTMLInputElement;

    fireEvent.focus(control);
    type(control, '25');
    fireEvent.blur(control);
    flush();
    expect(control.value).toBe('10');
    expect(onChange).toHaveBeenLastCalledWith(10);

    fireEvent.focus(control);
    type(control, '3.4');
    expect(onChange).toHaveBeenLastCalledWith(3.4);
  });

  test('arrows step by step, Page Up and Page Down by ten steps, stopping at the bounds', () => {
    const { getByRole } = renderIn(() => <NumberInput label="Volume" defaultValue={5} min={0} max={20} step={0.5} />);
    const control = getByRole('spinbutton') as HTMLInputElement;

    key(control, 'ArrowUp');
    expect(control.value).toBe('5.5');
    key(control, 'ArrowDown');
    key(control, 'ArrowDown');
    expect(control.value).toBe('4.5');
    key(control, 'PageUp');
    expect(control.value).toBe('9.5');
    key(control, 'PageUp');
    key(control, 'PageUp');
    expect(control.value).toBe('19.5');
    key(control, 'PageUp');
    expect(control.value).toBe('20');
    key(control, 'Home');
    expect(control.value).toBe('20');
  });

  test('from empty, a step goes to 0, or the bound nearest it', () => {
    const { getAllByRole } = renderIn(() => (
      <>
        <NumberInput label="A" />
        <NumberInput label="B" min={5} />
      </>
    ));
    const [a, b] = getAllByRole('spinbutton') as HTMLInputElement[];

    key(a, 'ArrowDown');
    key(b, 'ArrowUp');

    expect(a.value).toBe('0');
    expect(b.value).toBe('5');
  });

  test('the controls step, and are disabled at the bounds', () => {
    const { getByRole } = renderIn(() => <NumberInput label="Seats" defaultValue={1} min={0} max={2} />);
    const control = getByRole('spinbutton') as HTMLInputElement;
    const increase = getByRole('button', { name: 'Increase' });
    const decrease = getByRole('button', { name: 'Decrease' });

    fireEvent.pointerDown(increase, { button: 0 });
    fireEvent.pointerUp(increase);
    flush();
    expect(control.value).toBe('2');
    expect(increase).toBeDisabled();

    // A click from a keyboard or screen reader, without a pointer, steps too.
    fireEvent.click(decrease, { detail: 0 });
    fireEvent.click(decrease, { detail: 0 });
    flush();
    expect(control.value).toBe('0');
    expect(decrease).toBeDisabled();
  });

  test('controlled: follows value, and only reports changes', () => {
    const [value, setValue] = createSignal<number | undefined>(4);
    const onChange = vi.fn();
    const { getByRole } = renderIn(() => <NumberInput label="Age" value={value()} onChange={onChange} />);
    const control = getByRole('spinbutton') as HTMLInputElement;

    key(control, 'ArrowUp');
    expect(onChange).toHaveBeenCalledWith(5);
    expect(control.value).toBe('4');

    setValue(undefined);
    flush();
    expect(control.value).toBe('');
    expect(untrack(value)).toBeUndefined();
  });

  test('a new controlled value while editing replaces the typed text', () => {
    const [value, setValue] = createSignal<number | undefined>(1);
    const { getByRole } = renderIn(() => <NumberInput label="Age" value={value()} onChange={setValue} />);
    const control = getByRole('spinbutton') as HTMLInputElement;
    fireEvent.focus(control);

    type(control, '12');
    expect(control.value).toBe('12');
    setValue(40);
    flush();
    expect(control.value).toBe('40');
  });

  test('fixedDecimalScale pads while not focused; hideControls hides the buttons and keeps rightSection', () => {
    const { getByRole, queryByRole, getByText } = renderIn(() => (
      <NumberInput
        label="Price"
        defaultValue={2}
        decimalScale={2}
        fixedDecimalScale
        hideControls
        rightSection={<span>USD</span>}
      />
    ));

    expect((getByRole('spinbutton') as HTMLInputElement).value).toBe('2.00');
    expect(queryByRole('button')).toBeNull();
    expect(getByText('USD')).toBeInTheDocument();
  });

  test('disabled and readOnly do not step', () => {
    const { getAllByRole } = renderIn(() => (
      <>
        <NumberInput label="A" defaultValue={1} disabled />
        <NumberInput label="B" defaultValue={1} readOnly />
      </>
    ));
    const [a, b] = getAllByRole('spinbutton') as HTMLInputElement[];

    key(a, 'ArrowUp');
    key(b, 'ArrowUp');

    expect([a.value, b.value]).toEqual(['1', '1']);
    expect(getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });

  test('an arrow key updates it without diagnostics or waste', async () => {
    const { getByRole } = renderIn(() => <NumberInput label="Count" defaultValue={1} />);
    flush();
    const control = getByRole('spinbutton') as HTMLInputElement;

    const { artifact } = await captureArtifact(() => key(control, 'ArrowUp'), { scenario: 'number-input-step' });

    expect(control.value).toBe('2');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = renderIn(() => (
      <>
        <NumberInput label="Quantity" defaultValue={3} min={0} max={10} />
        <NumberInput label="Price" defaultValue={2} decimalScale={2} fixedDecimalScale rightSection={<span>USD</span>} />
        <NumberInput label="Offset" hideControls error="Out of range." />
        <NumberInput label="Locked" defaultValue={1} disabled />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./number-input.fixtures.tsx', 'numberInputs');
  });
});
