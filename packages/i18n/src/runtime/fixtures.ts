import { parseMessage } from '../message/parse';
import type { LocaleData, Shape } from '../message/ast';
import type { TranslationsDefinition } from './translations';

/** Builds locale data from message strings, the way the compiler parses them. */
export const data = (tree: Record<string, unknown>): LocaleData =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [
      key,
      typeof value === 'string' ? parseMessage(value) : data(value as Record<string, unknown>),
    ]),
  );

export const shape = (tree: Record<string, unknown>): Shape =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [key, typeof value === 'string' ? 1 : shape(value as Record<string, unknown>)]),
  );

export const en = {
  title: 'Users',
  greeting: 'Hello {name}',
  items: '{n, plural, one {# user} other {# users}}',
  form: { submit: 'Save' },
  onlyDefault: 'Only in English',
};
export const de = {
  title: 'Benutzer',
  greeting: 'Hallo {name}',
  items: '{n, plural, one {# Benutzer} other {# Benutzer}}',
  form: { submit: 'Speichern' },
};

export type Users = {
  readonly title: string;
  readonly greeting: (params: { name: string }) => string;
  readonly items: (params: { n: number }) => string;
  readonly form: { readonly submit: string };
  readonly onlyDefault: string;
};

export const inline = (name = 'users'): TranslationsDefinition => ({
  name,
  defaultLocale: 'en',
  shape: shape(en),
  locales: { en: data(en), de: data(de) },
});

/** A definition whose locales load through promises the test settles itself. */
export function deferred(name = 'users') {
  const resolvers: Record<string, () => void> = {};
  const loaded: string[] = [];
  const locales: TranslationsDefinition['locales'] = {};
  for (const [locale, tree] of Object.entries({ en, de })) {
    locales[locale] = () =>
      new Promise((resolve) => {
        loaded.push(locale);
        resolvers[locale] = () => resolve(data(tree));
      });
  }
  return {
    definition: { name, defaultLocale: 'en', shape: shape(en), locales } satisfies TranslationsDefinition,
    resolvers,
    loaded,
  };
}
