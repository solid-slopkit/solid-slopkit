import { describe, expect, test } from 'vitest';
import { resolveOptions } from './options';

const base = { locales: ['en', 'de'], defaultLocale: 'en' };

describe('resolveOptions', () => {
  test('applies defaults', () => {
    expect(resolveOptions(base)).toEqual({ ...base, suffix: '.i18n.jsonc', strict: false, mode: 'async' });
  });

  test('accepts a custom suffix that does not end in .json', () => {
    expect(resolveOptions({ ...base, suffix: '.i18n', strict: true, mode: 'inline' })).toMatchObject({
      suffix: '.i18n',
      strict: true,
      mode: 'inline',
    });
  });

  test.each(['.i18n.json', '.I18N.JSON', 'i18n.jsonc', '.'])('rejects the suffix %s', (suffix) => {
    expect(() => resolveOptions({ ...base, suffix })).toThrow(/suffix/);
  });

  test('rejects empty, duplicate and inconsistent locales', () => {
    expect(() => resolveOptions({ locales: [], defaultLocale: 'en' })).toThrow(/empty/);
    expect(() => resolveOptions({ locales: ['en', 'en'], defaultLocale: 'en' })).toThrow(/duplicates/);
    expect(() => resolveOptions({ locales: ['en'], defaultLocale: 'de' })).toThrow(/defaultLocale/);
  });
});
