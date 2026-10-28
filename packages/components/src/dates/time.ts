// Times of day as `HH:mm` / `HH:mm:ss` strings in 24 hours, the value of the time components, and how a locale
// writes them with `Intl`.
import { formatDate } from './format';

/** A time of day, in 24 hours. */
export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

/** The time a `HH:mm` or `HH:mm:ss` string names, or `null`. */
export function parseTime(value: string | null | undefined): TimeParts | null {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value?.trim() ?? '');
  if (!match) return null;
  const [hours, minutes, seconds] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  return hours < 24 && minutes < 60 && seconds < 60 ? { hours, minutes, seconds } : null;
}

const pad = (number: number) => String(number).padStart(2, '0');

/** The time as `HH:mm`, or `HH:mm:ss` with seconds. */
export function timeToString(time: TimeParts, withSeconds = false): string {
  return `${pad(time.hours)}:${pad(time.minutes)}${withSeconds ? `:${pad(time.seconds)}` : ''}`;
}

/** Seconds since midnight, to compare times. */
export function timeToSeconds(time: TimeParts): number {
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

/** Whether a locale writes times in 12 hours (with AM and PM) or 24. */
export function getHourCycle(locale: string): '12h' | '24h' {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12' ? '12h' : '24h';
}

/** The locale's names for the morning and the afternoon in 12-hour times: `['AM', 'PM']` in English. */
export function getDayPeriodLabels(locale: string): [string, string] {
  const period = (hour: number) =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
      .formatToParts(new Date(2000, 0, 1, hour))
      .find((part) => part.type === 'dayPeriod')?.value ?? (hour < 12 ? 'AM' : 'PM');
  return [period(9), period(21)];
}

/** The time as the locale writes it, in 12 or 24 hours: `9:30 AM`, `09:30`. */
export function formatTime(time: TimeParts, locale: string, format: '12h' | '24h', withSeconds = false): string {
  return formatDate(new Date(2000, 0, 1, time.hours, time.minutes, time.seconds), locale, {
    hour: format === '12h' ? 'numeric' : '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hourCycle: format === '12h' ? 'h12' : 'h23',
  });
}

/** The options of `getTimeRange`. */
export interface TimeRangeOptions {
  /** The first time, `HH:mm` or `HH:mm:ss`. */
  start: string;
  /** The last time; it's included when the steps land on it. */
  end: string;
  /** Minutes between times. */
  interval: number;
  /** Writes `HH:mm:ss` instead of `HH:mm`. */
  withSeconds?: boolean;
}

/** The times from `start` to `end`, `interval` minutes apart: `getTimeRange({ start: '09:00', end: '10:00', interval: 30 })` is `['09:00', '09:30', '10:00']`. */
export function getTimeRange(options: TimeRangeOptions): string[] {
  const start = parseTime(options.start);
  const end = parseTime(options.end);
  const step = Math.round(options.interval * 60);
  if (!start || !end || step <= 0) return [];
  const times: string[] = [];
  for (let seconds = timeToSeconds(start); seconds <= timeToSeconds(end); seconds += step) {
    times.push(
      timeToString(
        { hours: Math.floor(seconds / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 },
        options.withSeconds,
      ),
    );
  }
  return times;
}
