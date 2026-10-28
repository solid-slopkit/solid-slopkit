import { render } from '@solidjs/testing-library';
import { flush, useContext } from 'solid-js';
import { expect, test, vi } from 'vitest';
import { I18nContext } from './context';
import { I18nProvider } from './provider';
import { preloadTranslations } from './translations';
import users from './fixtures/users.i18n.jsonc';

// The file is compiled by the Vite plugin (see vitest.config.ts) and read through the real runtime.
test('an imported translation file is the typed messages of the active locale', async () => {
  let setLocale!: (locale: string) => void;
  const Grab = () => ((setLocale = useContext(I18nContext).setLocale), null);
  const { container } = render(() => (
    <I18nProvider initialLocale="en" fallback={<i>loading</i>}>
      <Grab />
      <p>
        {users.title}|{users.form.submit}|{users.greeting({ name: 'Ada' })}|{users.items({ n: 2 })}
      </p>
    </I18nProvider>
  ));
  // The locale chunk is a dynamic import of the same file, transformed by the plugin on demand.
  await vi.waitFor(() => (flush(), expect(container).toHaveTextContent('Users|Save|Hello Ada|2 users')));
  setLocale('de');
  await vi.waitFor(() => (flush(), expect(container).toHaveTextContent('Benutzer|Speichern|Hallo Ada|2 Benutzer')));
});

test('it can be preloaded', async () => {
  await preloadTranslations('de', users);
});
