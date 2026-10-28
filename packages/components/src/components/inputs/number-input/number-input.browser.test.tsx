import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { createSignal, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { NumberInput } from './number-input';

const renderIn = (ui: () => JSX.Element) => render(() => <SlopkitUi>{ui()}</SlopkitUi>);

describe('<NumberInput /> in a browser', () => {
  test('typing a number, then leaving, groups it; letters never appear', async () => {
    const [value, setValue] = createSignal<number | undefined>(undefined);
    const { getByRole } = renderIn(() => <NumberInput label="Amount" onChange={setValue} />);
    const control = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.click(control);
    await userEvent.keyboard('12x345.6');
    expect(control.value).toBe('12345.6');
    expect(untrack(value)).toBe(12345.6);

    await userEvent.tab();
    expect(control.value).toBe('12,345.6');
  });

  test('an invalid character typed mid-text keeps the caret where it was', async () => {
    const { getByRole } = renderIn(() => <NumberInput label="Amount" />);
    const control = getByRole('spinbutton') as HTMLInputElement;

    await userEvent.click(control);
    await userEvent.keyboard('1234');
    control.setSelectionRange(2, 2);
    await userEvent.keyboard('x');

    expect(control.value).toBe('1234');
    expect(control.selectionStart).toBe(2);
  });

  test('holding a control steps once, then keeps stepping until released', async () => {
    const { getByRole } = renderIn(() => <NumberInput label="Count" defaultValue={0} hideControls={false} />);
    const control = getByRole('spinbutton') as HTMLInputElement;
    const increase = getByRole('button', { name: 'Increase' });

    increase.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    expect(control.value).toBe('1');
    await new Promise((resolve) => setTimeout(resolve, 700));
    increase.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    const held = Number(control.value);
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(held).toBeGreaterThan(3);
    expect(Number(control.value)).toBe(held);
  });

  test('a press on a control keeps the focus in the field', async () => {
    const { getByRole } = renderIn(() => <NumberInput label="Count" defaultValue={0} />);
    const control = getByRole('spinbutton');

    await userEvent.click(control);
    await userEvent.click(getByRole('button', { name: 'Increase' }));

    expect(control).toHaveFocus();
    expect((control as HTMLInputElement).value).toBe('1');
  });

  test('the controls fill the right of the box, one above the other', () => {
    const { getByRole } = renderIn(() => <NumberInput label="Count" />);
    const box = getByRole('spinbutton').closest('.slp-input')!.getBoundingClientRect();
    const up = getByRole('button', { name: 'Increase' }).getBoundingClientRect();
    const down = getByRole('button', { name: 'Decrease' }).getBoundingClientRect();

    expect(up.right).toBe(box.right - 1);
    expect(up.top).toBe(box.top + 1);
    expect(down.bottom).toBe(box.bottom - 1);
    expect(down.top).toBeGreaterThanOrEqual(up.bottom);
  });
});
