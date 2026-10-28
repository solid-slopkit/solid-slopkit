// Formatting dates with `Intl.DateTimeFormat` in a locale, usually the provider's. `Intl` covers locale
// formatting without shipping per-locale data.

import { useLocale } from '../components/provider';
import { addDays, createDay, type DayOfWeek } from './date';

// A formatter is costly to build and a calendar formats dozens of dates, so they are kept per locale and options.
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale} ${JSON.stringify(options)}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, cached);
  }
  return cached;
}

/** The date as text in the locale, with `Intl.DateTimeFormat` options. Formats in the runtime's time zone. */
export function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions = {}): string {
  return formatter(locale, options).format(date);
}

/** A function that formats dates in the locale of the nearest `<SlopkitUi>`. Reactive: it reads the locale. */
export type FormatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => string;

/**
 * `formatDate` bound to the locale of the nearest `<SlopkitUi>`. Call the result where the text is rendered, so a
 * change of the locale formats again. Throws outside `<SlopkitUi>`.
 */
export function useFormatDate(): FormatDate {
  const locale = useLocale();
  return (date, options) => formatDate(date, locale(), options);
}

/** The names of the seven weekdays in the locale, starting on `firstDayOfWeek`. */
export function getWeekdayNames(
  locale: string,
  firstDayOfWeek: DayOfWeek,
  format: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  // January 4, 1970 was a Sunday.
  const sunday = createDay(1970, 0, 4);
  return Array.from({ length: 7 }, (_, index) =>
    formatDate(addDays(sunday, firstDayOfWeek + index), locale, { weekday: format }),
  );
}

/** The names of the twelve months in the locale, January first, in the form a month shows on its own. */
export function getMonthNames(locale: string, format: 'narrow' | 'short' | 'long' = 'long'): string[] {
  return Array.from({ length: 12 }, (_, month) => formatDate(createDay(2000, month, 1), locale, { month: format }));
}

// The order of year, month and day in the locale's numeric dates, kept per locale.
const orders = new Map<string, ('year' | 'month' | 'day')[]>();

function numericOrder(locale: string): ('year' | 'month' | 'day')[] {
  let order = orders.get(locale);
  if (!order) {
    order = formatter(locale, { year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(createDay(2026, 10, 22))
      .map((part) => part.type)
      .filter((type): type is 'year' | 'month' | 'day' => type === 'year' || type === 'month' || type === 'day');
    orders.set(locale, order);
  }
  return order;
}

/**
 * The day a text names, or `null` when it names none: an ISO day (`2026-10-15`), or three numbers in the locale's
 * order, with any separators (`10/15/2026` in `en-US`, `15.10.2026` in `de-DE`). A year of one or two digits is in
 * 2000–2099. Days that don't exist, such as February 30, are `null`.
 */
export function parseDate(text: string, locale: string): Date | null {
  const trimmed = text.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  let parts: Record<'year' | 'month' | 'day', string>;
  if (iso) parts = { year: iso[1], month: iso[2], day: iso[3] };
  else {
    const numbers = trimmed.split(/\D+/).filter(Boolean);
    const order = numericOrder(locale);
    if (numbers.length !== 3 || order.length !== 3) return null;
    parts = Object.fromEntries(order.map((type, index) => [type, numbers[index]])) as typeof parts;
  }
  if (parts.year.length === 3 || parts.year.length > 4) return null;
  const year = Number(parts.year) + (parts.year.length <= 2 ? 2000 : 0);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const date = createDay(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
