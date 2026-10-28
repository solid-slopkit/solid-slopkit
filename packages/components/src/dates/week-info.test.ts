import { describe, expect, test } from 'vitest';
import { getWeekInfo } from '.';
import { weekInfoFromTable } from './week-info';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Every region tag Intl accepts, minus the deprecated ones it maps to another region.
const regions = [...LETTERS]
  .flatMap((a) => [...LETTERS].map((b) => a + b))
  .filter((region) => {
    try {
      return new Intl.Locale(`und-${region}`).region === region;
    } catch {
      return false;
    }
  });

describe('getWeekInfo', () => {
  test('the locale week: first day and weekend, numbered like getDay()', () => {
    expect(getWeekInfo('en-US')).toEqual({ firstDayOfWeek: 0, weekendDays: [6, 0] });
    expect(getWeekInfo('de-DE')).toEqual({ firstDayOfWeek: 1, weekendDays: [6, 0] });
    expect(getWeekInfo('ar-EG')).toEqual({ firstDayOfWeek: 6, weekendDays: [5, 6] });
    expect(getWeekInfo('he-IL')).toEqual({ firstDayOfWeek: 0, weekendDays: [5, 6] });
    // Without a region, the language's most likely one.
    expect(getWeekInfo('en').firstDayOfWeek).toBe(0);
    expect(getWeekInfo('fr').firstDayOfWeek).toBe(1);
  });

  test('the fw extension picks the first day', () => {
    expect(getWeekInfo('en-US-u-fw-mon').firstDayOfWeek).toBe(1);
    expect(weekInfoFromTable('en-US-u-fw-mon').firstDayOfWeek).toBe(1);
    expect(weekInfoFromTable('de-DE-u-ca-gregory-fw-sun').firstDayOfWeek).toBe(0);
  });

  test('returns a copy the caller may change', () => {
    getWeekInfo('de-DE').weekendDays.push(5);
    expect(getWeekInfo('de-DE').weekendDays).toEqual([6, 0]);
  });

  test('throws a RangeError on an invalid tag', () => {
    expect(() => getWeekInfo('not a locale')).toThrow(RangeError);
  });

  // The table stands in where Intl.Locale has no week info; it must agree with Intl so the server and such a
  // browser render the same weeks.
  test.each(regions)('the fallback table agrees with Intl for %s', (region) => {
    expect(weekInfoFromTable(`und-${region}`)).toEqual(getWeekInfo(`und-${region}`));
  });
});
