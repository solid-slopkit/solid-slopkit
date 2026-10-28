import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { createSignal, untrack } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { TextInput } from './text-input';

describe('<TextInput /> in a browser', () => {
  test('a click on the label focuses the input; typing updates a controlled value', async () => {
    const [value, setValue] = createSignal('');
    const { getByRole, getByText } = render(() => (
      <TextInput label="Name" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
    ));

    await userEvent.click(getByText('Name'));
    expect(getByRole('textbox')).toHaveFocus();

    await userEvent.keyboard('Ada');
    expect(untrack(value)).toBe('Ada');
  });

  test('the label sits above the box, the error below it', () => {
    const { getByRole, getByText } = render(() => <TextInput label="Email" error="Enter a valid email." />);
    const box = getByRole('textbox').closest('.slp-input')!.getBoundingClientRect();

    expect(getByText('Email').getBoundingClientRect().bottom).toBeLessThanOrEqual(box.top);
    expect(getByText('Enter a valid email.').getBoundingClientRect().top).toBeGreaterThanOrEqual(box.bottom);
  });
});
