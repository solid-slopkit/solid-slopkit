import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import { I18nProvider } from '@solid-slopkit/i18n';
import { describe, expect, test } from 'vitest';
import { SlopkitUi, useLocale } from '.';
import { renderAndHydrate } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';

const Probe = (props: { id: string }) => {
  const locale = useLocale();
  return <p data-testid={props.id}>{locale()}</p>;
};

describe('useLocale()', () => {
  test('defaults to en-US, not the runtime locale', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Probe id="p" />
      </SlopkitUi>
    ));
    expect(getByTestId('p')).toHaveTextContent('en-US');
  });

  test('returns the locale prop, canonicalized', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi locale="DE-de">
        <Probe id="p" />
      </SlopkitUi>
    ));
    expect(getByTestId('p')).toHaveTextContent('de-DE');
  });

  test('follows a change of the prop', async () => {
    const [locale, setLocale] = createSignal('en-US', { name: 'locale' });
    const { getByTestId } = render(() => (
      <SlopkitUi locale={locale()}>
        <Probe id="p" />
      </SlopkitUi>
    ));

    const { artifact } = await captureArtifact(() => setLocale('fr-FR'), { scenario: 'provider-locale' });

    expect(getByTestId('p')).toHaveTextContent('fr-FR');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('a nested provider inherits the locale unless it sets its own', () => {
    const [outer, setOuter] = createSignal('de-DE', { name: 'outer' });
    const { getByTestId } = render(() => (
      <SlopkitUi locale={outer()}>
        <SlopkitUi>
          <Probe id="inherits" />
        </SlopkitUi>
        <SlopkitUi locale="ja-JP">
          <Probe id="own" />
        </SlopkitUi>
      </SlopkitUi>
    ));
    expect(getByTestId('inherits')).toHaveTextContent('de-DE');
    expect(getByTestId('own')).toHaveTextContent('ja-JP');

    setOuter('it-IT');
    flush();
    expect(getByTestId('inherits')).toHaveTextContent('it-IT');
    expect(getByTestId('own')).toHaveTextContent('ja-JP');
  });

  test('follows the active locale of the nearest <I18nProvider>', async () => {
    const [locale, setLocale] = createSignal('de-DE', { name: 'locale' });
    const { getByTestId } = render(() => (
      <I18nProvider locale={locale()}>
        <SlopkitUi>
          <Probe id="p" />
        </SlopkitUi>
      </I18nProvider>
    ));
    expect(getByTestId('p')).toHaveTextContent('de-DE');

    const { artifact } = await captureArtifact(() => setLocale('fr-FR'), { scenario: 'i18n-locale' });

    expect(getByTestId('p')).toHaveTextContent('fr-FR');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('the locale prop wins over <I18nProvider>', () => {
    const { getByTestId } = render(() => (
      <I18nProvider locale="de-DE">
        <SlopkitUi locale="ja-JP">
          <Probe id="p" />
        </SlopkitUi>
      </I18nProvider>
    ));
    expect(getByTestId('p')).toHaveTextContent('ja-JP');
  });

  test('a nested <I18nProvider> wins over the enclosing provider', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi locale="de-DE">
        <I18nProvider locale="it-IT">
          <SlopkitUi>
            <Probe id="p" />
          </SlopkitUi>
        </I18nProvider>
      </SlopkitUi>
    ));
    expect(getByTestId('p')).toHaveTextContent('it-IT');
  });

  test('an <I18nProvider> with no locale yet falls back to en-US', () => {
    const { getByTestId } = render(() => (
      <I18nProvider initialLocale="">
        <SlopkitUi>
          <Probe id="p" />
        </SlopkitUi>
      </I18nProvider>
    ));
    expect(getByTestId('p')).toHaveTextContent('en-US');
  });

  test('rejects an invalid locale with a clear error', () => {
    expect(() =>
      render(() => (
        <SlopkitUi locale="not a locale">
          <Probe id="p" />
        </SlopkitUi>
      )),
    ).toThrow('<SlopkitUi> got an invalid locale: "not a locale"');
  });

  test('throws outside <SlopkitUi>', () => {
    expect(() => render(() => <Probe id="p" />)).toThrow('useLocale() must be called inside <SlopkitUi>.');
  });

  test('formats the same on the server and the client', async () => {
    const result = await renderAndHydrate('./locale.fixtures.tsx', 'german');
    try {
      expect(result.serverMessages).toEqual([]);
      expect(result.clientMessages).toEqual([]);
      expect(result.replaced).toEqual([]);
      expect(result.container.textContent).toBe('1.234,50 €');
    } finally {
      result.dispose();
    }
  });

  test('formats with the <I18nProvider> locale the same on the server and the client', async () => {
    const result = await renderAndHydrate('./locale.fixtures.tsx', 'germanFromI18n');
    try {
      expect(result.serverMessages).toEqual([]);
      expect(result.clientMessages).toEqual([]);
      expect(result.replaced).toEqual([]);
      expect(result.container.textContent).toBe('1.234,50 €');
    } finally {
      result.dispose();
    }
  });
});
