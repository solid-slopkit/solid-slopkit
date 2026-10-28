import { describe, expect, test } from 'vitest';
import { decimalPlaces, formatNumber, numberSeparators, parseNumber, roundTo, sanitizeNumberText } from './number-format';

const en = numberSeparators('en-US');
const de = numberSeparators('de-DE');

describe('number-format', () => {
  test('separators per locale', () => {
    expect(en).toEqual({ decimal: '.', group: ',' });
    expect(de).toEqual({ decimal: ',', group: '.' });
  });

  test('formats with or without grouping, and a fixed scale', () => {
    expect(formatNumber(1234567.5, 'en-US', { grouping: true })).toBe('1,234,567.5');
    expect(formatNumber(1234567.5, 'de-DE', { grouping: true })).toBe('1.234.567,5');
    expect(formatNumber(1234.5, 'de-DE', { grouping: false })).toBe('1234,5');
    expect(formatNumber(2, 'en-US', { grouping: false, decimalScale: 2, fixedDecimalScale: true })).toBe('2.00');
    expect(formatNumber(2.456, 'en-US', { grouping: false, decimalScale: 2 })).toBe('2.46');
    expect(formatNumber(-3, 'sv-SE', { grouping: false })).toBe('-3');
    expect(formatNumber(12, 'ar-EG', { grouping: false })).toBe('12');
  });

  test('parses the locale, ignoring group separators and spaces', () => {
    expect(parseNumber('1,234.5', en)).toBe(1234.5);
    expect(parseNumber('1.234,5', de)).toBe(1234.5);
    // In German, . groups thousands.
    expect(parseNumber('1234.5', de)).toBe(12345);
    expect(parseNumber('−7', en)).toBe(-7);
    expect(parseNumber('1 234', numberSeparators('fr-FR'))).toBe(1234);
    expect(parseNumber('.5', en)).toBe(0.5);
    expect(parseNumber('5.', en)).toBe(5);
  });

  test('no number in empty text, a lone sign or separator, or letters', () => {
    for (const text of ['', ' ', '-', '.', '-.', 'abc', '1-2', '1.2.3']) expect(parseNumber(text, en)).toBeUndefined();
  });

  test('sanitize keeps digits, one decimal separator and a leading minus', () => {
    const options = { allowNegative: true };
    expect(sanitizeNumberText('-12a.3.4', en, options, 8)).toEqual({ text: '-12.34', removedBeforeCaret: 2 });
    expect(sanitizeNumberText('1-2', en, options, 3).text).toBe('12');
    expect(sanitizeNumberText('1,234', en, options, 5).text).toBe('1234');
  });

  test('sanitize: no minus when negatives are not allowed; no decimals with decimalScale 0; at most decimalScale digits', () => {
    expect(sanitizeNumberText('-5', en, { allowNegative: false }, 2).text).toBe('5');
    expect(sanitizeNumberText('5.5', en, { allowNegative: true, decimalScale: 0 }, 3).text).toBe('55');
    expect(sanitizeNumberText('1.2345', en, { allowNegative: true, decimalScale: 2 }, 6).text).toBe('1.23');
  });

  test('sanitize: a typed . becomes the locale decimal separator', () => {
    expect(sanitizeNumberText('1.5', de, { allowNegative: true }, 3).text).toBe('15');
    expect(sanitizeNumberText('1,5', de, { allowNegative: true }, 3).text).toBe('1,5');
    expect(sanitizeNumberText('1.5', numberSeparators('fr-FR'), { allowNegative: true }, 3).text).toBe('1,5');
  });

  test('decimalPlaces and roundTo', () => {
    expect(decimalPlaces(1)).toBe(0);
    expect(decimalPlaces(0.25)).toBe(2);
    expect(decimalPlaces(1e-7)).toBe(7);
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
  });
});
