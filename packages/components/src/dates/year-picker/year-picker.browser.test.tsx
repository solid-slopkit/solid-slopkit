import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { YearPicker } from './year-picker';

describe('<YearPicker /> in a browser', () => {
  test('a range chosen with the keyboard, previewed as the focus moves', async () => {
    const values: unknown[] = [];
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <YearPicker type="range" defaultDate={createDay(2020, 0, 1)} onChange={(value) => values.push(value)} />
      </SlopkitUi>
    ));
    const inRange = () => [...container.querySelectorAll('[data-in-range]')].map((cell) => cell.getAttribute('data-date'));

    getByRole('button', { name: '2021' }).focus();
    await userEvent.keyboard('{Enter}{ArrowDown}{ArrowRight}');
    expect(inRange()).toEqual(['2021', '2022', '2023', '2024', '2025']);
    await userEvent.keyboard('{Enter}');
    expect(values).toEqual([
      [createDay(2021, 0, 1), null],
      [createDay(2021, 0, 1), createDay(2025, 0, 1)],
    ]);
    expect(getByRole('button', { name: '2025' })).toHaveFocus();
    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-level', 'decade');
  });

  test('the chosen year takes Tab in the grid; the keyboard crosses into the next decade', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <YearPicker defaultValue={createDay(2028, 0, 1)} />
      </SlopkitUi>
    ));

    getByRole('button', { name: 'Next decade' }).focus();
    await userEvent.keyboard('{Tab}');
    expect(getByRole('button', { name: '2028' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(getByRole('grid', { name: '2030 – 2039' })).toBeInTheDocument();
    expect(getByRole('button', { name: '2031' })).toHaveAttribute('data-selected');
    expect(getByRole('button', { name: '2031' })).toHaveFocus();
  });

  test('the pointer previews a range; the ends are filled, the years between tinted', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <YearPicker type="range" defaultDate={createDay(2020, 0, 1)} defaultValue={[createDay(2021, 0, 1), null]} />
      </SlopkitUi>
    ));
    const end = getByRole('button', { name: '2027' });

    await userEvent.hover(end);
    const start = getByRole('button', { name: '2021' });
    const middle = getByRole('button', { name: '2024' });
    const outside = getByRole('button', { name: '2029' });
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
