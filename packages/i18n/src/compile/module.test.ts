import { describe, expect, test } from 'vitest';
import { localeModule, translationsModule } from './module';
import { resolveOptions } from './options';

const options = resolveOptions({ locales: ['en', 'de'], defaultLocale: 'en' });
const en = { title: 'Users', greeting: 'Hi {name}', form: { submit: 'Save' } };
const de = { title: 'Benutzer', greeting: 'Hallo {name}', form: { submit: 'Speichern' } };
const locales = new Map([
  ['en', en],
  ['de', de],
]);
const build = (context: Partial<Parameters<typeof translationsModule>[2]> = {}) =>
  translationsModule(locales, en, { file: '/app/src/users.i18n.jsonc', options, inline: false, hot: false, ...context });

describe('translationsModule', () => {
  test('async: a loader per locale, importing a chunk of the same file', () => {
    const code = build();
    expect(code).toContain(`import { defineTranslations } from '@solid-slopkit/i18n';`);
    expect(code).toContain(`"en": () => import("./users.i18n.jsonc?slopkit-i18n=en").then((m) => m.default)`);
    expect(code).toContain(`"de": () => import("./users.i18n.jsonc?slopkit-i18n=de").then((m) => m.default)`);
    expect(code).not.toContain('Benutzer');
    expect(code).toContain('export default translations;');
  });

  test('inline: the parsed messages of every locale in the module', () => {
    const code = build({ inline: true });
    expect(code).not.toContain('import(');
    expect(code).toContain('"Benutzer"');
    expect(code).toContain('"Users"');
  });

  test('names the file, the default locale and the shape of the default locale', () => {
    const code = build();
    expect(code).toContain('name: "users.i18n.jsonc"');
    expect(code).toContain('defaultLocale: "en"');
    expect(code).toContain('shape: {"title":1,"greeting":1,"form":{"submit":1}}');
  });

  test('messages are parsed at build time: the emitted data holds parts, not strings with braces', () => {
    const code = build({ inline: true });
    expect(code).toContain('{"t":"arg","n":"name"}');
  });

  test('hot: updates in place, reloads on a changed shape, and is absent otherwise', () => {
    expect(build({ hot: true })).toContain('import.meta.hot.accept();');
    expect(build({ hot: true })).toContain('import.meta.hot.invalidate()');
    expect(build({ hot: true })).toContain('import.meta.hot?.data?.translations');
    expect(build()).not.toContain('import.meta.hot');
  });
});

test('localeModule is the parsed messages of one locale', () => {
  expect(localeModule(de)).toBe(
    `export default ${JSON.stringify({ title: ['Benutzer'], greeting: ['Hallo ', { t: 'arg', n: 'name' }], form: { submit: ['Speichern'] } })};\n`,
  );
});
