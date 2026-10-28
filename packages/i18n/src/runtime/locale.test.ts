import { describe, expect, test } from 'vitest';
import { matchLocale } from './locale';

describe('matchLocale', () => {
  const supported = ['en', 'de', 'pt-BR', 'zh-Hans-CN'];

  test('an exact match, ignoring case, spelled as in the supported list', () => {
    expect(matchLocale('de', supported)).toBe('de');
    expect(matchLocale('DE', supported)).toBe('de');
    expect(matchLocale('pt-br', supported)).toBe('pt-BR');
    expect(matchLocale('pt_BR', supported)).toBe('pt-BR');
  });

  test('drops trailing subtags: de-AT → de, zh-Hans-CN-x → zh-Hans-CN', () => {
    expect(matchLocale('de-AT', supported)).toBe('de');
    expect(matchLocale('en-GB-oxendict', supported)).toBe('en');
    expect(matchLocale('zh-Hans-CN-u-nu-latn', supported)).toBe('zh-Hans-CN');
  });

  test('a language alone finds its first regional variant', () => {
    expect(matchLocale('pt', supported)).toBe('pt-BR');
    expect(matchLocale('zh', supported)).toBe('zh-Hans-CN');
  });

  test('a preference list is tried in order', () => {
    expect(matchLocale(['fr-CA', 'de-AT', 'en'], supported)).toBe('de');
    expect(matchLocale(['fr', 'es'], supported)).toBeUndefined();
  });

  test('an exact match of a later tag does not beat a looser match of an earlier one', () => {
    expect(matchLocale(['de-CH', 'en'], supported)).toBe('de');
  });

  test('nothing fits: undefined; wildcards and empty tags are ignored', () => {
    expect(matchLocale('ja', supported)).toBeUndefined();
    expect(matchLocale(['*', ''], supported)).toBeUndefined();
    expect(matchLocale([], supported)).toBeUndefined();
    expect(matchLocale('en', [])).toBeUndefined();
  });
});
