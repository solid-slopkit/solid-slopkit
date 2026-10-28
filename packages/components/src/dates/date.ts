// Calendar-day arithmetic on native `Date`, with no date library. A day is a `Date` at local midnight; every
// function here returns a new `Date` and never mutates its arguments. Times of day are dropped where a day is
// returned.

/** A day of the week as `Date.prototype.getDay()` numbers it: 0 is Sunday, 6 is Saturday. */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Local midnight of a year, month (0–11) and day. Years 0–99 stay as given, unlike the `Date` constructor. */
export function createDay(year: number, month: number, day: number): Date {
  const date = new Date(2000, 0, 1);
  date.setFullYear(year, month, day);
  return date;
}

/** Local midnight of the date's day. */
export function startOfDay(date: Date): Date {
  return createDay(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first day of the date's month. */
export function startOfMonth(date: Date): Date {
  return createDay(date.getFullYear(), date.getMonth(), 1);
}

/** The last day of the date's month. */
export function endOfMonth(date: Date): Date {
  return createDay(date.getFullYear(), date.getMonth() + 1, 0);
}

/** The first day of the date's year. */
export function startOfYear(date: Date): Date {
  return createDay(date.getFullYear(), 0, 1);
}

/** How many days the date's month has. */
export function daysInMonth(date: Date): number {
  return endOfMonth(date).getDate();
}

/** The day `amount` days later (earlier when negative). Counts calendar days, so a DST change doesn't shift it. */
export function addDays(date: Date, amount: number): Date {
  return createDay(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/**
 * The same day `amount` months later (earlier when negative). A day the target month doesn't have becomes its
 * last day: January 31 plus one month is February 28 (or 29).
 */
export function addMonths(date: Date, amount: number): Date {
  const first = createDay(date.getFullYear(), date.getMonth() + amount, 1);
  return createDay(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), daysInMonth(first)));
}

/** The same day `amount` years later (earlier when negative). February 29 becomes February 28 in a common year. */
export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/** Whether both dates fall on the same day. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && isSameMonth(a, b);
}

/** Whether both dates fall in the same month of the same year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && isSameYear(a, b);
}

/** Whether both dates fall in the same year. */
export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear();
}

/** Negative when `a` is a day before `b`, positive when after, 0 on the same day. Ignores the time of day. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

/** Whether the date's day lies between `min` and `max`, both included. A missing bound doesn't limit. */
export function isDayInRange(date: Date, min?: Date, max?: Date): boolean {
  return (!min || compareDays(date, min) >= 0) && (!max || compareDays(date, max) <= 0);
}

/** The date's day moved into `min`…`max`: the bound's day when it lies outside. A missing bound doesn't limit. */
export function clampDay(date: Date, min?: Date, max?: Date): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return startOfDay(date);
}

/** The first day of the week the date falls in, for weeks starting on `firstDayOfWeek`. */
export function startOfWeek(date: Date, firstDayOfWeek: DayOfWeek): Date {
  return addDays(date, -((date.getDay() - firstDayOfWeek + 7) % 7));
}

export interface MonthGridOptions {
  /** The day each week (row) starts on. Usually the locale's: `getWeekInfo(locale).firstDayOfWeek`. */
  firstDayOfWeek: DayOfWeek;
  /** Always six weeks, so a calendar keeps its height from month to month. Default `false`. */
  fixedWeeks?: boolean;
}

/**
 * The weeks of the date's month, each a row of seven days. The first and last weeks are filled with days of the
 * neighboring months; check them with `isSameMonth(day, month)`.
 */
export function getMonthGrid(month: Date, options: MonthGridOptions): Date[][] {
  const first = startOfWeek(startOfMonth(month), options.firstDayOfWeek);
  const last = endOfMonth(month);
  const weeks: Date[][] = [];
  for (let start = first; weeks.length < 6 && (options.fixedWeeks || compareDays(start, last) <= 0);) {
    const week = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    weeks.push(week);
    start = addDays(start, 7);
  }
  return weeks;
}
