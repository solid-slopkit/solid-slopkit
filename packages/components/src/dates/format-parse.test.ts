import { describe, expect, test } from 'vitest';
import { createDay } from './date';
import { formatDate, parseDate } from './format';

describe('parseDate()', () => {
  test('reads ISO days in any locale', () => {
    expect(parseDate('2026-10-15', 'en-US')).toEqual(createDay(2026, 9, 15));
    expect(parseDate(' 2026-1-5 ', 'de-DE')).toEqual(createDay(2026, 0, 5));
  });

  test("reads three numbers in the locale's order, with any separators", () => {
    expect(parseDate('10/15/2026', 'en-US')).toEqual(createDay(2026, 9, 15));
    expect(parseDate('15.10.2026', 'de-DE')).toEqual(createDay(2026, 9, 15));
    expect(parseDate('15/10/2026', 'en-GB')).toEqual(createDay(2026, 9, 15));
    expect(parseDate('2026/10/15', 'ja-JP')).toEqual(createDay(2026, 9, 15));
    expect(parseDate('10 15 2026', 'en-US')).toEqual(createDay(2026, 9, 15));
  });

  test('reads back what the numeric format writes', () => {
    const day = createDay(2026, 1, 3);
    for (const locale of ['en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'nl-NL']) {
      const text = formatDate(day, locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
      expect(parseDate(text, locale), `${locale}: ${text}`).toEqual(day);
    }
  });

  test('a year of one or two digits is in 2000–2099', () => {
    expect(parseDate('10/15/26', 'en-US')).toEqual(createDay(2026, 9, 15));
    expect(parseDate('1/2/3', 'en-US')).toEqual(createDay(2003, 0, 2));
  });

  test('null for text that names no day', () => {
    expect(parseDate('', 'en-US')).toBeNull();
    expect(parseDate('10/15', 'en-US')).toBeNull();
    expect(parseDate('October 15, 2026', 'en-US')).toBeNull();
    expect(parseDate('2/30/2026', 'en-US')).toBeNull();
    expect(parseDate('13/1/2026', 'en-US')).toBeNull();
    expect(parseDate('10/15/202', 'en-US')).toBeNull();
    expect(parseDate('0/15/2026', 'en-US')).toBeNull();
  });
});
