import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { DateTimePicker } from './date-time-picker';

describe('<DateTimePicker /> in a browser', () => {
  test('the keyboard: open on the day, choose another, Tab to the time, type it, Done returns to the field', async () => {
    const values: (Date | null)[] = [];
    const { getByRole } = render(() => (
      <SlopkitUi>
        <div style={{ padding: '20px', width: '320px' }}>
          <button type="button">Before</button>
          <DateTimePicker
            label="When"
            defaultValue={new Date(2026, 9, 15, 9, 30)}
            timePickerProps={{ format: '24h' }}
            onChange={(value) => values.push(value)}
          />
        </div>
      </SlopkitUi>
    ));
    const field = getByRole('button', { name: 'When' });
    const dropdown = () => document.querySelector<HTMLElement>('[data-slot="date-time-picker-dropdown"]');

    field.focus();
    await userEvent.keyboard('{Enter}');
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    expect(getByRole('button', { name: 'Thursday, October 15, 2026' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(values.at(-1)).toEqual(new Date(2026, 9, 16, 9, 30));
    expect(dropdown()).not.toBeNull();

    await userEvent.tab();
    expect(getByRole('spinbutton', { name: 'Hours' })).toHaveFocus();
    await userEvent.keyboard('1745');
    expect(values.at(-1)).toEqual(new Date(2026, 9, 16, 17, 45));
    await userEvent.tab();
    expect(getByRole('button', { name: 'Done' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => dropdown()).toBeNull();
    expect(field).toHaveFocus();
    expect(field).toHaveTextContent('Oct 16, 2026, 5:45 PM');
  });

  test('Escape and a press outside close it', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <div style={{ padding: '20px', width: '320px' }}>
          <button type="button">Before</button>
          <DateTimePicker label="When" />
        </div>
      </SlopkitUi>
    ));
    const field = getByRole('button', { name: 'When' });
    const dropdown = () => document.querySelector('[data-slot="date-time-picker-dropdown"]');

    await userEvent.click(field);
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dropdown()).toBeNull();
    expect(field).toHaveFocus();
    await userEvent.click(field);
    await userEvent.click(getByRole('button', { name: 'Before' }));
    await expect.poll(() => dropdown()).toBeNull();
  });
});
