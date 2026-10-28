import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay, isSameDay } from '../date';
import { Calendar, type CalendarProps } from './calendar';

const october15 = createDay(2026, 9, 15);

const setup = (props: Partial<CalendarProps> = {}) =>
  render(() => (
    <SlopkitUi>
      <Calendar defaultDate={october15} {...props} />
    </SlopkitUi>
  ));

describe('<Calendar /> in a browser', () => {
  test('Tab goes previous, the header, next, then one day; arrows and Enter work from there', async () => {
    const selected: Date[] = [];
    const { getByRole } = setup({
      getDayProps: (date) => ({ selected: isSameDay(date, october15) }),
      onDayClick: (date) => selected.push(date),
    });

    await userEvent.tab();
    expect(getByRole('button', { name: 'Previous month' })).toHaveFocus();
    await userEvent.tab();
    expect(getByRole('button', { name: 'October 2026' })).toHaveFocus();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Next month' })).toHaveFocus();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Thursday, October 15, 2026' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Thursday, November 5, 2026' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(selected).toEqual([createDay(2026, 10, 5)]);

    // Tab leaves the grid, and Shift+Tab comes back to the day it left.
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
    await userEvent.tab({ shift: true });
    expect(getByRole('button', { name: 'Thursday, November 5, 2026' })).toHaveFocus();
  });

  test('a month chosen with the keyboard shows its days and keeps the focus in the grid', async () => {
    const { getByRole } = setup({ defaultLevel: 'year' });

    getByRole('button', { name: 'October 2026' }).focus();
    await userEvent.keyboard('{ArrowLeft}{Enter}');
    expect(getByRole('grid', { name: 'September 2026' })).toBeInTheDocument();
    expect(document.activeElement?.closest('[role="grid"]')).not.toBeNull();
  });

  test('next keeps the focus when it turns disabled at maxDate', async () => {
    const { getByRole } = setup({ maxDate: createDay(2026, 10, 20) });
    const next = getByRole('button', { name: 'Next month' });

    next.focus();
    await userEvent.keyboard('{Enter}{Enter}');
    expect(getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveFocus();
  });

  test('days are squares in seven columns; selected ones are filled', () => {
    const { getByRole, container } = setup({ getDayProps: (date) => ({ selected: isSameDay(date, october15) }) });
    const day = getByRole('button', { name: 'Friday, October 16, 2026' }).getBoundingClientRect();
    const selected = getByRole('button', { name: 'Thursday, October 15, 2026' });
    const grid = container.querySelector('[data-slot="calendar-grid"]')!.getBoundingClientRect();

    expect(Math.round(day.width)).toBe(Math.round(day.height));
    expect(Math.round(grid.width)).toBe(Math.round(day.width * 7));
    expect(getComputedStyle(selected).backgroundColor).not.toBe(
      getComputedStyle(getByRole('button', { name: 'Friday, October 16, 2026' })).backgroundColor,
    );
  });

  test('columns sit side by side and keep their width at every level; they wrap when narrow', async () => {
    const { getAllByRole } = render(() => (
      <SlopkitUi>
        <div style={{ width: '800px' }}>
          <Calendar defaultDate={october15} numberOfColumns={2} />
        </div>
        <div style={{ width: '300px' }}>
          <Calendar defaultDate={october15} numberOfColumns={2} />
        </div>
      </SlopkitUi>
    ));
    const [first, second] = getAllByRole('grid').map((grid) => grid.getBoundingClientRect());

    expect(Math.round(second.top)).toBe(Math.round(first.top));
    expect(second.left).toBeGreaterThan(first.right);
    const [, , narrowFirst, narrowSecond] = getAllByRole('grid').map((grid) => grid.getBoundingClientRect());
    expect(narrowSecond.top).toBeGreaterThan(narrowFirst.bottom);
    await userEvent.click(getAllByRole('button', { name: 'October 2026' })[0]);
    expect(Math.round(getAllByRole('grid')[0].getBoundingClientRect().width)).toBe(Math.round(first.width));
  });
});
