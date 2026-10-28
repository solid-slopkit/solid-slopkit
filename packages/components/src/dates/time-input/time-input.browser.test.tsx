import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { TimeInput } from './time-input';

describe('<TimeInput /> in a browser', () => {
  test('typed keys fill the segments; the value is HH:mm', async () => {
    const values: string[] = [];
    const { getByLabelText } = render(() => (
      <SlopkitUi>
        <TimeInput label="Time" onChange={(value) => values.push(value)} />
      </SlopkitUi>
    ));
    const field = getByLabelText('Time') as HTMLInputElement;

    await userEvent.click(field);
    // Chromium's en-US segments: hours, minutes, then AM/PM. AM/PM starts empty on Linux, and the
    // value stays empty until every segment is filled, so it is typed too.
    await userEvent.keyboard('0945a');
    expect(field.value).toBe('09:45');
    expect(values.at(-1)).toBe('09:45');
  });

  test('outside minTime and maxTime the input is invalid', async () => {
    const { getByLabelText } = render(() => (
      <SlopkitUi>
        <TimeInput label="Time" minTime="08:00" maxTime="18:00" defaultValue="19:00" />
      </SlopkitUi>
    ));
    const field = getByLabelText('Time') as HTMLInputElement;
    expect(field.validity.rangeOverflow).toBe(true);
  });
});
