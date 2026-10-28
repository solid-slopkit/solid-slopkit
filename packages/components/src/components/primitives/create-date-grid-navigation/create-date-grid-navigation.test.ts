import { describe, expect, test, vi } from 'vitest';
import { createDay } from '../../../dates/date';
import { createDateGridNavigation, type DateGridLevel } from './create-date-grid-navigation';

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

interface SetupOptions {
  level?: DateGridLevel;
  columns?: number;
  gridStart?: Date;
  min?: Date;
  max?: Date;
  disabled?: (date: Date) => boolean;
}

// The current date follows each move, as a component's focused date would.
function setup(start: Date, options: SetupOptions = {}) {
  let current = start;
  const onMove = vi.fn((date: Date) => {
    current = date;
  });
  const { onKeyDown } = createDateGridNavigation({
    level: () => options.level ?? 'day',
    current: () => current,
    firstDayOfWeek: () => 1,
    columns: options.columns === undefined ? undefined : () => options.columns!,
    gridStart: options.gridStart && (() => options.gridStart!),
    min: () => options.min,
    max: () => options.max,
    isDisabled: options.disabled,
    onMove,
  });
  const press = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
    onKeyDown(event);
    return iso(current);
  };
  return { onMove, press, current: () => iso(current) };
}

// Thursday, October 15, 2026; weeks start on Monday.
const october15 = createDay(2026, 9, 15);

describe('createDateGridNavigation: days', () => {
  test('arrows move a day or a week, crossing into the neighboring months', () => {
    const { press } = setup(october15);
    expect(press('ArrowRight')).toBe('2026-10-16');
    expect(press('ArrowLeft')).toBe('2026-10-15');
    expect(press('ArrowDown')).toBe('2026-10-22');
    expect(press('ArrowDown')).toBe('2026-10-29');
    expect(press('ArrowDown')).toBe('2026-11-05');
    expect(press('ArrowUp')).toBe('2026-10-29');

    const start = setup(createDay(2026, 9, 1));
    expect(start.press('ArrowLeft')).toBe('2026-09-30');
    expect(start.press('ArrowUp')).toBe('2026-09-23');
  });

  test('Home and End go to the start and end of the week', () => {
    const { press } = setup(october15);
    expect(press('Home')).toBe('2026-10-12');
    expect(press('End')).toBe('2026-10-18');
    // Already at the end: no move.
    const { onMove, press: pressAgain } = setup(createDay(2026, 9, 18));
    pressAgain('End');
    expect(onMove).not.toHaveBeenCalled();
  });

  test('Page Up and Page Down move a month, with Shift a year, keeping the day where it fits', () => {
    const { press } = setup(createDay(2026, 0, 31));
    expect(press('PageDown')).toBe('2026-02-28');
    expect(press('PageUp')).toBe('2026-01-28');
    expect(press('PageDown', { shiftKey: true })).toBe('2027-01-28');
    expect(press('PageUp', { shiftKey: true })).toBe('2026-01-28');
  });

  test('a move skips disabled days, repeating its step', () => {
    const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    // Friday, October 16.
    const { press } = setup(createDay(2026, 9, 16), { disabled: weekend });
    expect(press('ArrowRight')).toBe('2026-10-19');
    expect(press('ArrowLeft')).toBe('2026-10-16');
    // End lands on Sunday, the nearest enabled day toward the current one is Friday itself: no move.
    expect(press('End')).toBe('2026-10-16');

    const holidays = (date: Date) => [22, 29].includes(date.getDate()) && date.getMonth() === 9;
    const down = setup(october15, { disabled: holidays });
    expect(down.press('ArrowDown')).toBe('2026-11-05');
  });

  test('a move past min or max goes to the bound', () => {
    const min = createDay(2026, 9, 10);
    const max = new Date(2026, 9, 20, 15, 30);
    const { press } = setup(october15, { min, max });
    expect(press('PageDown')).toBe('2026-10-20');
    expect(press('ArrowRight')).toBe('2026-10-20');
    expect(press('PageUp', { shiftKey: true })).toBe('2026-10-10');
    expect(press('ArrowUp')).toBe('2026-10-10');
  });

  test('at a disabled bound, the nearest enabled day before it', () => {
    const max = createDay(2026, 9, 20);
    const { press } = setup(october15, { max, disabled: (date) => date.getDate() >= 18 });
    expect(press('ArrowDown')).toBe('2026-10-17');
    // Everything ahead is disabled: no move.
    const { onMove, press: pressAgain } = setup(createDay(2026, 9, 17), { max, disabled: (date) => date.getDate() >= 18 });
    pressAgain('ArrowRight');
    pressAgain('PageDown');
    expect(onMove).not.toHaveBeenCalled();
  });

  test('gives up without bounds when every day is disabled', () => {
    const { onMove, press } = setup(october15, { disabled: () => true });
    press('ArrowRight');
    press('PageDown');
    expect(onMove).not.toHaveBeenCalled();
  });

  test('moves return local midnight, whatever the time of the current date', () => {
    const { onMove, press } = setup(new Date(2026, 9, 15, 18, 45));
    press('ArrowRight');
    expect(onMove.mock.calls[0][0]).toEqual(createDay(2026, 9, 16));
  });
});

describe('createDateGridNavigation: months', () => {
  test('arrows move a month or a row of three, crossing into the neighboring years', () => {
    const { press } = setup(createDay(2026, 4, 15), { level: 'month' });
    expect(press('ArrowRight')).toBe('2026-06-15');
    expect(press('ArrowDown')).toBe('2026-09-15');
    expect(press('ArrowDown')).toBe('2026-12-15');
    expect(press('ArrowDown')).toBe('2027-03-15');
    expect(press('ArrowLeft')).toBe('2027-02-15');
  });

  test('the row width follows columns', () => {
    const { press } = setup(createDay(2026, 0, 1), { level: 'month', columns: 4 });
    expect(press('ArrowDown')).toBe('2026-05-01');
    expect(press('End')).toBe('2026-08-01');
    expect(press('Home')).toBe('2026-05-01');
  });

  test('Home and End go to the ends of the row, keeping the day where it fits', () => {
    const { press } = setup(createDay(2026, 4, 31), { level: 'month' });
    expect(press('Home')).toBe('2026-04-30');
    expect(press('End')).toBe('2026-06-30');
  });

  test('Page Up and Page Down move a year', () => {
    const { press } = setup(createDay(2024, 1, 29), { level: 'month' });
    expect(press('PageDown')).toBe('2025-02-28');
    expect(press('PageUp', { shiftKey: true })).toBe('2024-02-28');
  });

  test('a month reaches min or max when it contains it, and disabled months are skipped', () => {
    const min = createDay(2026, 2, 20);
    const max = createDay(2026, 10, 5);
    const { press } = setup(createDay(2026, 4, 15), { level: 'month', min, max, disabled: (date) => date.getMonth() === 5 });
    expect(press('ArrowRight')).toBe('2026-07-15');
    expect(press('PageDown')).toBe('2026-11-05');
    expect(press('PageUp')).toBe('2026-03-20');
    expect(press('ArrowLeft')).toBe('2026-03-20');
  });
});

describe('createDateGridNavigation: years', () => {
  test('arrows move a year or a row; Page Up and Page Down a decade', () => {
    const { press } = setup(createDay(2026, 9, 15), { level: 'year' });
    expect(press('ArrowRight')).toBe('2027-10-15');
    expect(press('ArrowUp')).toBe('2024-10-15');
    expect(press('PageDown')).toBe('2034-10-15');
    expect(press('PageUp')).toBe('2024-10-15');
  });

  test('rows count from the start of the decade, or from gridStart', () => {
    // 2020 2021 2022 / 2023 2024 2025 / 2026 2027 2028 / 2029
    const decade = setup(createDay(2027, 0, 1), { level: 'year' });
    expect(decade.press('Home')).toBe('2026-01-01');
    expect(decade.press('End')).toBe('2028-01-01');

    // A grid of twelve years from 2019, four to a row: 2019–2022, 2023–2026, 2027–2030.
    const custom = setup(createDay(2027, 0, 1), { level: 'year', columns: 4, gridStart: createDay(2019, 0, 1) });
    expect(custom.press('Home')).toBe('2027-01-01');
    expect(custom.press('End')).toBe('2030-01-01');
  });
});

describe('createDateGridNavigation: keys', () => {
  test('a handled key is prevented even with nowhere to go; onMove gets the event', () => {
    const onMove = vi.fn();
    const { onKeyDown } = createDateGridNavigation({
      level: () => 'day',
      current: () => october15,
      firstDayOfWeek: () => 1,
      min: () => october15,
      max: () => october15,
      onMove,
    });
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    onKeyDown(right);
    expect(right.defaultPrevented).toBe(true);
    expect(onMove).not.toHaveBeenCalled();

    const free = createDateGridNavigation({ level: () => 'day', current: () => october15, firstDayOfWeek: () => 1, onMove });
    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    free.onKeyDown(left);
    expect(onMove).toHaveBeenCalledWith(createDay(2026, 9, 14), left);
  });

  test('ignores other keys, keys with Alt, Ctrl or Meta, and events already prevented', () => {
    const onMove = vi.fn();
    const { onKeyDown } = createDateGridNavigation({
      level: () => 'day',
      current: () => october15,
      firstDayOfWeek: () => 1,
      onMove,
    });
    const press = (key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
      onKeyDown(event);
      return event;
    };

    const enter = press('Enter');
    const space = press(' ');
    press('ArrowRight', { ctrlKey: true });
    press('ArrowRight', { altKey: true });
    press('PageDown', { metaKey: true });
    const prevented = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    prevented.preventDefault();
    onKeyDown(prevented);

    expect(enter.defaultPrevented).toBe(false);
    expect(space.defaultPrevented).toBe(false);
    expect(onMove).not.toHaveBeenCalled();
  });
});
