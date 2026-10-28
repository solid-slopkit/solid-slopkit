import { captureArtifact } from '@solidjs/diagnostics';
import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { I18nProvider } from './provider';
import { defineTranslations } from './translations';
import { inline, type Users } from './fixtures';

describe('translations reactivity budgets', () => {
  test('switching the locale re-reads only the messages on screen, without diagnostics', async () => {
    const t = defineTranslations<Users>(inline());
    const [locale, setLocale] = createSignal('en');
    let el!: HTMLElement;
    const { artifact } = await captureArtifact(
      () => {
        const result = render(() => (
          <I18nProvider locale={locale()}>
            <p data-testid="text">
              {t.title}|{t.form.submit}|{t.greeting({ name: 'Ada' })}
            </p>
          </I18nProvider>
        ));
        el = result.getByTestId('text');
        setLocale('de');
      },
      { scenario: 'translations-locale-switch' },
    );
    flush();
    expect(el).toHaveTextContent('Benutzer|Speichern|Hallo Ada');
    expect(artifact).toHaveNoDiagnostics();
  });
});
