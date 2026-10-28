import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DatePicker } from './date-picker';

describe('<DatePicker /> in a browser', () => {
  test('a range chosen with the keyboard, previewed as the focus moves', async () => {
    const values: unknown[] = [];
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <DatePicker type="range" defaultDate={createDay(2026, 9, 1)} onChange={(value) => values.push(value)} />
      </SlopkitUi>
    ));
    const inRange = () => [...container.querySelectorAll('[data-in-range]')].map((cell) => cell.textContent);

    getByRole('button', { name: 'Monday, October 12, 2026' }).focus();
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}');
    expect(inRange()).toEqual(['12', '13', '14']);
    await userEvent.keyboard('{Enter}');
    expect(values).toEqual([
      [createDay(2026, 9, 12), null],
      [createDay(2026, 9, 12), createDay(2026, 9, 14)],
    ]);
    expect(getByRole('button', { name: 'Wednesday, October 14, 2026' })).toHaveFocus();
  });

  test('the pointer previews a range; the ends are filled, the days between tinted', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <DatePicker type="range" defaultDate={createDay(2026, 9, 1)} defaultValue={[createDay(2026, 9, 12), null]} />
      </SlopkitUi>
    ));
    const end = getByRole('button', { name: 'Friday, October 16, 2026' });

    await userEvent.hover(end);
    const start = getByRole('button', { name: 'Monday, October 12, 2026' });
    const middle = getByRole('button', { name: 'Wednesday, October 14, 2026' });
    const outside = getByRole('button', { name: 'Tuesday, October 20, 2026' });
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
