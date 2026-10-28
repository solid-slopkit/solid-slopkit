import { describe, expect, test } from 'vitest';
import { formatTime, getDayPeriodLabels, getHourCycle, getTimeRange, parseTime, timeToSeconds, timeToString } from './time';

describe('time helpers', () => {
  test('parseTime reads HH:mm and HH:mm:ss, null otherwise', () => {
    expect(parseTime('09:30')).toEqual({ hours: 9, minutes: 30, seconds: 0 });
    expect(parseTime('9:05:07')).toEqual({ hours: 9, minutes: 5, seconds: 7 });
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('10:60')).toBeNull();
    expect(parseTime('')).toBeNull();
    expect(parseTime(undefined)).toBeNull();
  });

  test('timeToString and timeToSeconds', () => {
    expect(timeToString({ hours: 9, minutes: 5, seconds: 7 })).toBe('09:05');
    expect(timeToString({ hours: 9, minutes: 5, seconds: 7 }, true)).toBe('09:05:07');
    expect(timeToSeconds({ hours: 1, minutes: 1, seconds: 1 })).toBe(3661);
  });

  test("a locale's hour cycle and day periods", () => {
    expect(getHourCycle('en-US')).toBe('12h');
    expect(getHourCycle('de-DE')).toBe('24h');
    expect(getDayPeriodLabels('en-US')).toEqual(['AM', 'PM']);
    expect(getDayPeriodLabels('ko-KR')).toEqual(['오전', '오후']);
  });

  test('formatTime writes the time in 12 or 24 hours', () => {
    const time = { hours: 21, minutes: 5, seconds: 9 };
    expect(formatTime(time, 'en-US', '12h')).toBe('9:05 PM');
    expect(formatTime(time, 'en-US', '24h')).toBe('21:05');
    expect(formatTime(time, 'de-DE', '24h', true)).toBe('21:05:09');
  });
});

describe('getTimeRange()', () => {
  test('the times from start to end, interval minutes apart', () => {
    expect(getTimeRange({ start: '09:00', end: '10:00', interval: 30 })).toEqual(['09:00', '09:30', '10:00']);
    expect(getTimeRange({ start: '09:00', end: '09:50', interval: 20 })).toEqual(['09:00', '09:20', '09:40']);
    expect(getTimeRange({ start: '23:30', end: '23:59', interval: 15, withSeconds: true })).toEqual(['23:30:00', '23:45:00']);
  });

  test('nothing for unreadable times or a non-positive interval', () => {
    expect(getTimeRange({ start: 'nine', end: '10:00', interval: 30 })).toEqual([]);
    expect(getTimeRange({ start: '09:00', end: '10:00', interval: 0 })).toEqual([]);
    expect(getTimeRange({ start: '10:00', end: '09:00', interval: 30 })).toEqual([]);
  });
});
