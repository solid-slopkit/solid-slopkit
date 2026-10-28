import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MonthPicker } from './month-picker';

describe('<MonthPicker /> in a browser', () => {
  test('a range chosen with the keyboard, previewed as the focus moves', async () => {
    const values: unknown[] = [];
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <MonthPicker type="range" defaultDate={createDay(2026, 0, 1)} onChange={(value) => values.push(value)} />
      </SlopkitUi>
    ));
    const inRange = () => [...container.querySelectorAll('[data-in-range]')].map((cell) => cell.getAttribute('data-date'));

    getByRole('button', { name: 'February 2026' }).focus();
    await userEvent.keyboard('{Enter}{ArrowDown}{ArrowRight}');
    expect(inRange()).toEqual(['2026-02', '2026-03', '2026-04', '2026-05', '2026-06']);
    await userEvent.keyboard('{Enter}');
    expect(values).toEqual([
      [createDay(2026, 1, 1), null],
      [createDay(2026, 1, 1), createDay(2026, 5, 1)],
    ]);
    expect(getByRole('button', { name: 'June 2026' })).toHaveFocus();
    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-level', 'year');
  });

  test('the chosen month takes Tab in the grid; the keyboard crosses into the next year', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <MonthPicker defaultValue={createDay(2026, 10, 1)} />
      </SlopkitUi>
    ));

    getByRole('button', { name: 'Next year' }).focus();
    await userEvent.keyboard('{Tab}');
    expect(getByRole('button', { name: 'November 2026' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(getByRole('grid', { name: '2027' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'February 2027' })).toHaveAttribute('data-selected');
    expect(getByRole('button', { name: 'February 2027' })).toHaveFocus();
  });

  test('the pointer previews a range; the ends are filled, the months between tinted', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <MonthPicker type="range" defaultDate={createDay(2026, 0, 1)} defaultValue={[createDay(2026, 1, 1), null]} />
      </SlopkitUi>
    ));
    const end = getByRole('button', { name: 'August 2026' });

    await userEvent.hover(end);
    const start = getByRole('button', { name: 'February 2026' });
    const middle = getByRole('button', { name: 'May 2026' });
    const outside = getByRole('button', { name: 'November 2026' });
    expect(middle).toHaveAttribute('data-in-range');
    expect(end).toHaveAttribute('data-last-in-range');
    // The cells fade between colors.
    await expect.poll(() => getComputedStyle(end).backgroundColor).toBe(getComputedStyle(start).backgroundColor);
    expect(getComputedStyle(middle).backgroundColor).not.toBe(getComputedStyle(start).backgroundColor);
    expect(getComputedStyle(middle).backgroundColor).not.toBe(getComputedStyle(outside).backgroundColor);

    await userEvent.unhover(end);
    await userEvent.hover(document.body);
    expect(middle).not.toHaveAttribute('data-in-range');
  });
});
