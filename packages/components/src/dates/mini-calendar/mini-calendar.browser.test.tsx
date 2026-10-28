import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MiniCalendar, type MiniCalendarProps } from './mini-calendar';

const setup = (props: Partial<MiniCalendarProps> = {}) =>
  render(() => (
    <SlopkitUi>
      <MiniCalendar defaultDate={createDay(2026, 9, 12)} {...props} />
    </SlopkitUi>
  ));

describe('<MiniCalendar /> in a browser', () => {
  test('Tab goes previous, one day, next; arrows move and Enter chooses', async () => {
    const chosen: Date[] = [];
    const { getByRole } = setup({ defaultValue: createDay(2026, 9, 14), onChange: (date) => chosen.push(date) });

    await userEvent.tab();
    expect(getByRole('button', { name: 'Previous days' })).toHaveFocus();
    await userEvent.tab();
    expect(getByRole('option', { name: 'Wednesday, October 14, 2026' })).toHaveFocus();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Next days' })).toHaveFocus();

    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(getByRole('option', { name: 'Monday, October 19, 2026' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(chosen).toEqual([createDay(2026, 9, 19)]);
    await userEvent.keyboard(' ');
    expect(chosen).toHaveLength(1);
  });

  test('next keeps the focus when it turns disabled at maxDate', async () => {
    const { getByRole } = setup({ maxDate: createDay(2026, 9, 22) });
    const next = getByRole('button', { name: 'Next days' });

    next.focus();
    await userEvent.keyboard('{Enter}');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveFocus();
  });

  test('the days sit in one row, between the controls; the chosen day is filled', () => {
    const { getByRole, getAllByRole } = setup({ defaultValue: createDay(2026, 9, 14) });
    const days = getAllByRole('option').map((day) => day.getBoundingClientRect());
    const previous = getByRole('button', { name: 'Previous days' }).getBoundingClientRect();
    const next = getByRole('button', { name: 'Next days' }).getBoundingClientRect();

    for (const day of days) expect(Math.round(day.top)).toBe(Math.round(days[0].top));
    expect(previous.right).toBeLessThanOrEqual(days[0].left);
    expect(next.left).toBeGreaterThanOrEqual(days[6].right);
    expect(days[0].height).toBeGreaterThan(days[0].width);
    const chosen = getByRole('option', { name: 'Wednesday, October 14, 2026' });
    const other = getByRole('option', { name: 'Thursday, October 15, 2026' });
    expect(getComputedStyle(chosen).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
  });
});
