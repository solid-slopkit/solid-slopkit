import { renderToString } from '@solidjs/web';
import { expect, test } from 'vitest';
import { I18nProvider } from './provider';
import { defineTranslations, useTranslations } from './translations';
import { inline, type Users } from './fixtures';

const users = () => defineTranslations<Users>(inline());

test('the server renders the locale of each request, also for concurrent ones', () => {
  const t = users();
  const page = (locale: string) =>
    renderToString(() => (
      <I18nProvider locale={locale}>
        <p>
          {t.title}|{t.form.submit}|{t.items({ n: 1234 })}
        </p>
      </I18nProvider>
    ));
  const [en, de] = [page('en'), page('de')];
  expect(en).toContain('Users|Save|1,234 users');
  expect(de).toContain('Benutzer|Speichern|1.234 Benutzer');
});

test('a read with no owner fails on the server, instead of using a locale that may belong to another request', () => {
  const t = users();
  renderToString(() => <I18nProvider locale="de">{null}</I18nProvider>);
  expect(() => t.title).toThrow(/outside a component, memo or effect on the server/);
});

test('useTranslations gives the provider locale during server rendering', () => {
  const t = users();
  const Probe = () => <p>{useTranslations(t).title}</p>;
  expect(
    renderToString(() => (
      <I18nProvider locale="de">
        <Probe />
      </I18nProvider>
    )),
  ).toContain('Benutzer');
});
