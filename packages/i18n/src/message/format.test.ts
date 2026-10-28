import { describe, expect, test } from 'vitest';
import { createMessage, formatParts } from './format';
import { parseMessage } from './parse';

const fmt = (text: string, locale: string, params?: Record<string, unknown>) => formatParts(parseMessage(text), locale, params);

describe('formatParts', () => {
  test('arguments are inserted as they are', () => {
    expect(fmt('Hi {name}, {n} new', 'en', { name: 'Ada', n: 1234 })).toBe('Hi Ada, 1234 new');
  });

  test('a missing argument stays visible instead of throwing', () => {
    expect(fmt('Hi {name}', 'en', {})).toBe('Hi {name}');
    expect(fmt('Hi {name}', 'en')).toBe('Hi {name}');
  });

  test('number formats for the locale', () => {
    expect(fmt('{n, number}', 'en', { n: 1234567.891 })).toBe('1,234,567.891');
    expect(fmt('{n, number}', 'de', { n: 1234567.891 })).toBe('1.234.567,891');
    expect(fmt('{n, number, integer}', 'en', { n: 2.6 })).toBe('3');
    expect(fmt('{n, number, percent}', 'en', { n: 0.25 })).toBe('25%');
  });

  test('date formats for the locale and style', () => {
    const date = new Date(Date.UTC(2026, 9, 6, 12));
    const expected = (locale: string, dateStyle: 'short' | 'medium' | 'long' | 'full') =>
      new Intl.DateTimeFormat(locale, { dateStyle }).format(date);
    expect(fmt('{d, date}', 'en', { d: date })).toBe(expected('en', 'medium'));
    expect(fmt('{d, date, long}', 'de', { d: date })).toBe(expected('de', 'long'));
    expect(fmt('{d, date, full}', 'en', { d: date.getTime() })).toBe(expected('en', 'full'));
    expect(fmt('{d, date, long}', 'en', { d: date })).not.toBe(fmt('{d, date, long}', 'de', { d: date }));
  });

  describe('plural', () => {
    const items = '{n, plural, =0 {No items} one {# item} other {# items}}';

    test('English: exact match, one, other, and # is formatted for the locale', () => {
      expect(fmt(items, 'en', { n: 0 })).toBe('No items');
      expect(fmt(items, 'en', { n: 1 })).toBe('1 item');
      expect(fmt(items, 'en', { n: 2 })).toBe('2 items');
      expect(fmt(items, 'en', { n: 1234 })).toBe('1,234 items');
      expect(fmt(items, 'de', { n: 1234 })).toBe('1.234 items');
    });

    test("uses the locale's categories (Polish has few and many)", () => {
      const pl = '{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}';
      expect([1, 2, 5, 22, 1.5].map((n) => fmt(pl, 'pl', { n }))).toEqual([
        '1 plik',
        '2 pliki',
        '5 plików',
        '22 pliki',
        '1,5 pliku',
      ]);
    });

    test('falls back to other when the category has no branch', () => {
      expect(fmt('{n, plural, one {# car} other {# cars}}', 'pl', { n: 5 })).toBe('5 cars');
    });

    test('an exact match wins over the category', () => {
      expect(fmt('{n, plural, =1 {just one} one {# item} other {# items}}', 'en', { n: 1 })).toBe('just one');
    });
  });

  describe('select', () => {
    const message = '{role, select, admin {Admin {name}} other {User {name}}}';
    test('picks the branch, else other', () => {
      expect(fmt(message, 'en', { role: 'admin', name: 'Ada' })).toBe('Admin Ada');
      expect(fmt(message, 'en', { role: 'guest', name: 'Bob' })).toBe('User Bob');
    });

    test('a branch named like an Object property is only a branch if written', () => {
      expect(fmt('{x, select, a {A} other {O}}', 'en', { x: 'toString' })).toBe('O');
      expect(fmt('{x, select, __proto__ {P} other {O}}', 'en', { x: '__proto__' })).toBe('P');
    });
  });

  test('# inside a nested select in a plural is the plural number', () => {
    expect(fmt('{n, plural, other {{g, select, f {# women} other {# people}}}}', 'en', { n: 3, g: 'f' })).toBe('3 women');
  });

  test('# outside a plural is text', () => {
    expect(fmt('Room #{n}', 'en', { n: 4 })).toBe('Room #4');
  });
});

describe('createMessage', () => {
  test('a message without arguments is its string', () => {
    expect(createMessage("It''s {n}".replace('{n}', 'fine'), 'en')).toBe("It's fine");
  });

  test('a message with arguments is a function of them', () => {
    const message = createMessage('Hi {name}', 'en');
    expect(typeof message).toBe('function');
    expect((message as (p: Record<string, unknown>) => string)({ name: 'Ada' })).toBe('Hi Ada');
  });

  test('throws on a syntax error', () => {
    expect(() => createMessage('{oops', 'en')).toThrow();
  });
});
