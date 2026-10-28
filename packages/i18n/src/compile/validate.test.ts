import { describe, expect, test } from 'vitest';
import { resolveOptions } from './options';
import { validateTranslations } from './validate';

const options = resolveOptions({ locales: ['en', 'de'], defaultLocale: 'en' });
const strict = resolveOptions({ locales: ['en', 'de'], defaultLocale: 'en', strict: true });
const messages = (value: unknown, o = options) =>
  validateTranslations(value, o).diagnostics.map((d) => `${d.level}: ${d.message}`);

describe('validateTranslations', () => {
  test('accepts a complete file and returns the default locale as the type source', () => {
    const result = validateTranslations(
      { en: { title: 'Users', form: { submit: 'Save' } }, de: { title: 'Benutzer', form: { submit: 'Speichern' } } },
      options,
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.defaultMessages).toEqual({ title: 'Users', form: { submit: 'Save' } });
  });

  test('the file must be an object of locales', () => {
    expect(messages([])).toEqual([expect.stringContaining('error: a translation file must be an object')]);
    expect(messages('x')).toHaveLength(1);
  });

  test('rejects unknown locales and a missing default locale', () => {
    expect(messages({ en: { a: 'x' }, fr: { a: 'x' } })).toEqual(['error: unknown locale "fr" (allowed: en, de)']);
    expect(messages({ de: { a: 'x' } })).toEqual([expect.stringContaining('the default locale "en" is missing')]);
  });

  test('leaves must be strings: no arrays, numbers, booleans or null', () => {
    expect(messages({ en: { a: ['x'], b: 1, c: true, d: null, e: 'ok' } })).toEqual([
      'error: en.a: a message must be a string or a group of messages, not an array',
      'error: en.b: a message must be a string or a group of messages, not a number',
      'error: en.c: a message must be a string or a group of messages, not a boolean',
      'error: en.d: a message must be a string or a group of messages, not null',
    ]);
  });

  test('keys must not be empty or contain a dot', () => {
    expect(messages({ en: { 'a.b': 'x', '': 'y', ok: { 'c.d': 'z' } } })).toEqual([
      'error: en.a.b: keys must not be empty or contain "."',
      'error: en.: keys must not be empty or contain "."',
      'error: en.ok.c.d: keys must not be empty or contain "."',
    ]);
  });

  test('a message missing from a non-default locale is a warning, and an error when strict', () => {
    const file = { en: { a: 'x', g: { b: 'y' } }, de: { a: 'x' } };
    expect(messages(file)).toEqual(['warning: de.g: group missing, falls back to "en"']);
    expect(messages(file, strict)).toEqual(['error: de.g: group missing, falls back to "en"']);
    expect(validateTranslations(file, options).defaultMessages).toBeDefined();
    expect(validateTranslations(file, strict).defaultMessages).toBeUndefined();
  });

  test('a key only in a non-default locale is always an error', () => {
    expect(messages({ en: { a: 'x' }, de: { a: 'x', extra: 'y' } })).toEqual(['error: de.extra: not in the default locale "en"']);
  });

  test('a message and a group at the same key is an error', () => {
    expect(messages({ en: { a: 'x', g: { b: 'y' } }, de: { a: { b: 'x' }, g: 'y' } })).toEqual([
      'error: de.a: a group here, but a message in "en"',
      'error: de.g: a message here, but a group in "en"',
    ]);
  });

  test('reports nested paths', () => {
    expect(messages({ en: { f: { e: { r: 'x' } } }, de: { f: { e: {} } } })).toEqual([
      'warning: de.f.e.r: message missing, falls back to "en"',
    ]);
  });

  describe('messages', () => {
    test('a syntax error is reported with the path of the message, in any locale', () => {
      expect(messages({ en: { a: 'ok', b: 'Hi {name' }, de: { b: '{n, plural, one {x}}' } })).toEqual([
        'error: en.b: expected "," or "}" (at character 9)',
        'error: de.b: a plural needs an "other" branch (at character 5)',
      ]);
    });

    test('a message that uses one name two incompatible ways is an error', () => {
      expect(messages({ en: { a: '{d} {d, date}' } })).toEqual([
        expect.stringContaining('en.a: "d" is used as both plain text and a date'),
      ]);
    });

    test('a translation may use fewer arguments, or a wider type', () => {
      const file = { en: { a: 'Hi {name}, {n, number} new', b: '{n, number}' }, de: { a: 'Hallo!', b: '{n}' } };
      expect(messages(file)).toEqual([]);
    });

    test('a translation may not use an argument the default does not pass', () => {
      expect(messages({ en: { a: 'Hi' }, de: { a: 'Hallo {name}' } })).toEqual([
        'error: de.a: uses {name}, which "en" does not pass',
      ]);
    });

    test('a translation may not need more than the default promises', () => {
      expect(messages({ en: { a: '{n}', b: '{d, date}' }, de: { a: '{n, number}', b: '{d}' } })).toEqual([
        expect.stringContaining('de.a: {n} is used differently'),
        expect.stringContaining('de.b: {d} is used differently'),
      ]);
    });

    test('argument checks run on nested groups too', () => {
      expect(messages({ en: { g: { a: 'Hi' } }, de: { g: { a: 'Hallo {x}' } } })).toEqual([
        'error: de.g.a: uses {x}, which "en" does not pass',
      ]);
    });
  });
});
