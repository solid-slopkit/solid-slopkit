import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { createSignal, untrack } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { PinInput } from './pin-input';

describe('<PinInput /> in a browser', () => {
  test('typing a code with real keys fills the fields one by one; Backspace walks back', async () => {
    const [value, setValue] = createSignal('');
    const { getAllByRole } = render(() => <PinInput label="Code" onChange={setValue} />);
    const fields = getAllByRole('textbox') as HTMLInputElement[];

    await userEvent.click(fields[0]);
    await userEvent.keyboard('2468');
    expect(fields.map((field) => field.value)).toEqual(['2', '4', '6', '8']);
    expect(untrack(value)).toBe('2468');

    await userEvent.keyboard('{Backspace}');
    expect(fields[3].value).toBe('');
    await userEvent.keyboard('{Backspace}');
    expect(fields[2].value).toBe('');
    expect(fields[2]).toHaveFocus();
  });

  test('typing over a filled field replaces its character', async () => {
    const { getAllByRole } = render(() => <PinInput label="Code" defaultValue="1234" />);
    const fields = getAllByRole('textbox') as HTMLInputElement[];

    await userEvent.click(fields[1]);
    await userEvent.keyboard('9');

    expect(fields.map((field) => field.value)).toEqual(['1', '9', '3', '4']);
    expect(fields[2]).toHaveFocus();
  });

  test('square fields in a row, the character centered', () => {
    const { getAllByRole } = render(() => <PinInput label="Code" />);
    const boxes = getAllByRole('textbox').map((field) => field.getBoundingClientRect());

    expect(boxes[0].width).toBe(boxes[0].height);
    expect(boxes[1].top).toBe(boxes[0].top);
    expect(boxes[1].left).toBeGreaterThan(boxes[0].right);
    expect(getComputedStyle(getAllByRole('textbox')[0]).textAlign).toBe('center');
  });
});
