import { afterEach, describe, expect, test } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  clampDay,
  compareDays,
  createDay,
  daysInMonth,
  endOfMonth,
  getMonthGrid,
  isDayInRange,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from '.';

const day = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

describe('date arithmetic', () => {
  const originalTimeZone = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTimeZone;
  });

  test('createDay keeps years 0–99 and rolls over out-of-range days', () => {
    expect(createDay(42, 0, 1).getFullYear()).toBe(42);
    expect(day(createDay(2026, 0, 32))).toBe('2026-02-01');
    expect(day(createDay(2026, 2, 0))).toBe('2026-02-28');
  });

  test('start and end of a day, month and year', () => {
    const date = new Date(2024, 1, 15, 13, 45, 10);
    expect(startOfDay(date)).toEqual(new Date(2024, 1, 15));
    expect(day(startOfMonth(date))).toBe('2024-02-01');
    expect(day(endOfMonth(date))).toBe('2024-02-29');
    expect(day(startOfYear(date))).toBe('2024-01-01');
    expect(daysInMonth(date)).toBe(29);
    expect(daysInMonth(createDay(2025, 1, 1))).toBe(28);
  });

  test('never mutates its argument', () => {
    const date = new Date(2026, 9, 15, 9);
    const time = date.getTime();
    addDays(date, 3);
    addMonths(date, 1);
    startOfWeek(date, 1);
    expect(date.getTime()).toBe(time);
  });

  test('addDays crosses months, years and both ways', () => {
    expect(day(addDays(createDay(2026, 11, 30), 3))).toBe('2027-01-02');
    expect(day(addDays(createDay(2026, 0, 1), -1))).toBe('2025-12-31');
  });

  test.each(['Europe/Berlin', 'America/New_York', 'America/Santiago', 'Australia/Lord_Howe'])(
    'addDays counts calendar days across DST changes in %s',
    (timeZone) => {
      process.env.TZ = timeZone;
      let date = createDay(2026, 0, 1);
      for (let i = 0; i < 365; i++) {
        const next = addDays(date, 1);
        expect(compareDays(next, date), day(date)).toBeGreaterThan(0);
        expect(next.getDate() === 1 || next.getDate() === date.getDate() + 1, day(date)).toBe(true);
        date = next;
      }
      expect(day(date)).toBe('2027-01-01');
    },
  );

  test('addMonths and addYears keep the day, or take the last day of a shorter month', () => {
    expect(day(addMonths(createDay(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(day(addMonths(createDay(2024, 0, 31), 1))).toBe('2024-02-29');
    expect(day(addMonths(createDay(2026, 2, 31), -1))).toBe('2026-02-28');
    expect(day(addMonths(createDay(2026, 10, 15), 3))).toBe('2027-02-15');
    expect(day(addMonths(createDay(2026, 0, 15), -13))).toBe('2024-12-15');
    expect(day(addYears(createDay(2024, 1, 29), 1))).toBe('2025-02-28');
    expect(day(addYears(createDay(2024, 1, 29), 4))).toBe('2028-02-29');
  });

  test('compares days, ignoring the time of day', () => {
    const morning = new Date(2026, 9, 15, 8);
    const evening = new Date(2026, 9, 15, 20);
    expect(isSameDay(morning, evening)).toBe(true);
    expect(compareDays(morning, evening)).toBe(0);
    expect(compareDays(morning, createDay(2026, 9, 16))).toBeLessThan(0);
    expect(isSameDay(createDay(2026, 9, 15), createDay(2025, 9, 15))).toBe(false);
    expect(isSameMonth(createDay(2026, 9, 1), createDay(2026, 9, 31))).toBe(true);
    expect(isSameMonth(createDay(2026, 9, 1), createDay(2025, 9, 1))).toBe(false);
  });

  test('range checks include both bounds, and a missing bound does not limit', () => {
    const min = createDay(2026, 9, 10);
    const max = new Date(2026, 9, 20, 12);
    expect(isDayInRange(new Date(2026, 9, 10, 23), min, max)).toBe(true);
    expect(isDayInRange(new Date(2026, 9, 20, 23), min, max)).toBe(true);
    expect(isDayInRange(createDay(2026, 9, 9), min, max)).toBe(false);
    expect(isDayInRange(createDay(2026, 9, 21), min, max)).toBe(false);
    expect(isDayInRange(createDay(1900, 0, 1), undefined, max)).toBe(true);
    expect(isDayInRange(createDay(2100, 0, 1))).toBe(true);
    expect(day(clampDay(createDay(2026, 0, 1), min, max))).toBe('2026-10-10');
    expect(clampDay(createDay(2027, 0, 1), min, max)).toEqual(createDay(2026, 9, 20));
    expect(day(clampDay(new Date(2026, 9, 15, 9), min, max))).toBe('2026-10-15');
  });

  test('startOfWeek for each first day', () => {
    // Thursday, October 15, 2026.
    const thursday = createDay(2026, 9, 15);
    expect(day(startOfWeek(thursday, 1))).toBe('2026-10-12');
    expect(day(startOfWeek(thursday, 0))).toBe('2026-10-11');
    expect(day(startOfWeek(thursday, 6))).toBe('2026-10-10');
    expect(day(startOfWeek(thursday, 4))).toBe('2026-10-15');
  });
});

describe('getMonthGrid', () => {
  const grid = (month: Date, firstDayOfWeek: 0 | 1 | 6, fixedWeeks?: boolean) =>
    getMonthGrid(month, { firstDayOfWeek, fixedWeeks }).map((week) => week.map(day));

  test('weeks of seven days starting on the first day, padded with the neighboring months', () => {
    const weeks = grid(createDay(2026, 9, 15), 1);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual(['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(weeks[4].at(-1)).toBe('2026-11-01');
    for (const week of getMonthGrid(createDay(2026, 9, 1), { firstDayOfWeek: 1 }))
      expect(week.map((date) => date.getDay())).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  test('a month starting on the first day has no leading days, and the week count varies', () => {
    // February 2026 starts on a Sunday and has 28 days: four full weeks from Sunday.
    expect(grid(createDay(2026, 1, 1), 0)).toHaveLength(4);
    expect(grid(createDay(2026, 1, 1), 0)[0][0]).toBe('2026-02-01');
    // Six weeks: August 2026 starts on a Saturday.
    expect(grid(createDay(2026, 7, 1), 1)).toHaveLength(6);
    expect(grid(createDay(2026, 7, 1), 6)[0][0]).toBe('2026-08-01');
  });

  test('fixedWeeks always gives six weeks', () => {
    const weeks = grid(createDay(2026, 1, 1), 0, true);
    expect(weeks).toHaveLength(6);
    expect(weeks[5].at(-1)).toBe('2026-03-14');
  });

  test('every day of the month appears once, in order', () => {
    for (let month = 0; month < 24; month++) {
      const date = createDay(2026, month, 1);
      const days = getMonthGrid(date, { firstDayOfWeek: 0 })
        .flat()
        .filter((d) => isSameMonth(d, date));
      expect(days.map((d) => d.getDate())).toEqual(Array.from({ length: daysInMonth(date) }, (_, i) => i + 1));
    }
  });
});
