import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DatePickerInput } from './date-picker-input';

const day = (date: number) => createDay(2026, 9, date);

function setup(props: Parameters<typeof DatePickerInput>[0] = {}) {
  const result = render(() => (
    <SlopkitUi>
      <div style={{ padding: '20px', width: '280px' }}>
        <button type="button">Before</button>
        <DatePickerInput label="Day" defaultDate={day(1)} {...props} />
        <button type="button">After</button>
      </div>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('button', { name: 'Day' });
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="date-picker-input-dropdown"]');
  return { ...result, field, dropdown };
}

describe('<DatePickerInput /> in a browser', () => {
  test('a click opens the calendar under the field box, in the top layer, focused on the chosen day', async () => {
    const { field, dropdown, getByRole } = setup({ defaultValue: day(15), defaultDate: undefined });

    await userEvent.click(field());
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    expect(getByRole('button', { name: 'Thursday, October 15, 2026' })).toHaveFocus();
    const box = field().parentElement!.getBoundingClientRect();
    await expect.poll(() => Math.round(dropdown()!.getBoundingClientRect().top - box.bottom)).toBe(4);
    expect(Math.round(dropdown()!.getBoundingClientRect().left)).toBe(Math.round(box.left));
  });

  test('the keyboard: Enter opens, arrows move, Enter chooses, closes and returns to the field', async () => {
    const values: unknown[] = [];
    const { field, dropdown, getByRole } = setup({
      defaultValue: day(12),
      defaultDate: undefined,
      onChange: (value) => values.push(value),
    });

    field().focus();
    await userEvent.keyboard('{Enter}');
    expect(dropdown()).not.toBeNull();
    expect(getByRole('button', { name: 'Monday, October 12, 2026' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}');
    expect(values).toEqual([day(20)]);
    await expect.poll(() => dropdown()).toBeNull();
    expect(field()).toHaveFocus();
    expect(field()).toHaveTextContent('Oct 20, 2026');
  });

  test('Escape closes it and returns focus to the field; a press outside closes it', async () => {
    const { field, dropdown, getByRole } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dropdown()).toBeNull();
    expect(field()).toHaveFocus();

    await userEvent.click(field());
    expect(dropdown()).not.toBeNull();
    await userEvent.click(getByRole('button', { name: 'Before' }));
    await expect.poll(() => dropdown()).toBeNull();
  });

  test('a range previews under the pointer and closes on its end', async () => {
    const { field, dropdown, getByRole } = setup({ type: 'range' } as Parameters<typeof DatePickerInput>[0]);

    await userEvent.click(field());
    await userEvent.click(getByRole('button', { name: 'Monday, October 12, 2026' }));
    await userEvent.hover(getByRole('button', { name: 'Thursday, October 15, 2026' }));
    expect(getByRole('button', { name: 'Tuesday, October 13, 2026' })).toHaveAttribute('data-in-range');
    expect(dropdown()).not.toBeNull();
    await userEvent.click(getByRole('button', { name: 'Thursday, October 15, 2026' }));
    await expect.poll(() => dropdown()).toBeNull();
    expect(field()).toHaveTextContent('Oct 12, 2026 – Oct 15, 2026');
  });
});
