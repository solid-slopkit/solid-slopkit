import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DateInput } from './date-input';

function setup(props: Parameters<typeof DateInput>[0] = {}) {
  const values: unknown[] = [];
  const result = render(() => (
    <SlopkitUi>
      <div style={{ padding: '20px', width: '280px' }}>
        <button type="button">Before</button>
        <DateInput label="Day" onChange={(value) => values.push(value)} {...props} />
        <button type="button">After</button>
      </div>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('combobox', { name: 'Day' });
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="date-input-dropdown"]');
  return { ...result, field, dropdown, values };
}

describe('<DateInput /> in a browser', () => {
  test('typed keys set the day; leaving writes it in the format', async () => {
    const { field, values, getByRole } = setup({ valueFormat: { dateStyle: 'medium' } });

    await userEvent.click(field());
    await userEvent.keyboard('10/20/2026');
    expect(values).toEqual([createDay(2026, 9, 20)]);
    expect(getByRole('button', { name: 'Tuesday, October 20, 2026' })).toHaveAttribute('data-selected');
    await userEvent.click(getByRole('button', { name: 'Before' }));
    expect(field()).toHaveValue('Oct 20, 2026');
  });

  test('the calendar opens under the field and keeps the focus in it; Tab moves into the calendar', async () => {
    const { field, dropdown, getByRole } = setup({ defaultValue: createDay(2026, 9, 15) });

    await userEvent.click(field());
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    expect(field()).toHaveFocus();
    const box = field().parentElement!.getBoundingClientRect();
    await expect.poll(() => Math.round(dropdown()!.getBoundingClientRect().top - box.bottom)).toBe(4);
    await userEvent.tab();
    expect(getByRole('button', { name: 'Previous month' })).toHaveFocus();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('a chosen day closes it and returns the focus to the field; Escape closes it', async () => {
    const { field, dropdown, values, getByRole } = setup({ defaultValue: createDay(2026, 9, 15) });

    await userEvent.click(field());
    await userEvent.click(getByRole('button', { name: 'Thursday, October 22, 2026' }));
    await expect.poll(() => dropdown()).toBeNull();
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('10/22/2026');
    expect(values).toEqual([createDay(2026, 9, 22)]);

    await userEvent.keyboard('{ArrowDown}');
    expect(dropdown()).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dropdown()).toBeNull();
    expect(field()).toHaveFocus();
  });
});
