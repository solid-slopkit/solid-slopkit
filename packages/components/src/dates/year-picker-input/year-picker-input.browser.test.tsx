import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { YearPickerInput } from './year-picker-input';

describe('<YearPickerInput /> in a browser', () => {
  test('the keyboard opens it on the chosen year, chooses another, and returns to the field', async () => {
    const values: unknown[] = [];
    const { getByRole } = render(() => (
      <SlopkitUi>
        <div style={{ padding: '20px', width: '280px' }}>
          <button type="button">Before</button>
          <YearPickerInput label="Year" defaultValue={createDay(2024, 0, 1)} onChange={(value) => values.push(value)} />
        </div>
      </SlopkitUi>
    ));
    const field = getByRole('button', { name: 'Year' });
    const dropdown = () => document.querySelector('[data-slot="year-picker-input-dropdown"]');

    field.focus();
    await userEvent.keyboard('{Enter}');
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    expect(getByRole('button', { name: '2024' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(values).toEqual([createDay(2027, 0, 1)]);
    await expect.poll(() => dropdown()).toBeNull();
    expect(field).toHaveFocus();
    expect(field).toHaveTextContent('2027');

    await userEvent.click(field);
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dropdown()).toBeNull();
    expect(field).toHaveFocus();
    await userEvent.click(field);
    await userEvent.click(getByRole('button', { name: 'Before' }));
    await expect.poll(() => dropdown()).toBeNull();
  });
});
