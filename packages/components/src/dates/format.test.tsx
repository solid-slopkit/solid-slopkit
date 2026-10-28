import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../test/ssr';
import { NO_DIAGNOSTICS } from '../../test/diagnostics';
import { SlopkitUi } from '../components/provider';
import { createDay, formatDate, getMonthNames, getWeekdayNames, useFormatDate } from '.';

const october15 = createDay(2026, 9, 15);

describe('formatDate', () => {
  test('formats in the locale with Intl options', () => {
    expect(formatDate(october15, 'en-US')).toBe('10/15/2026');
    expect(formatDate(october15, 'de-DE')).toBe('15.10.2026');
    expect(formatDate(october15, 'en-US', { month: 'long', year: 'numeric' })).toBe('October 2026');
    expect(formatDate(october15, 'fr-FR', { dateStyle: 'full' })).toBe('jeudi 15 octobre 2026');
  });
});

describe('getWeekdayNames', () => {
  test('seven names from the first day, in the format asked for', () => {
    expect(getWeekdayNames('en-US', 0)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(getWeekdayNames('en-US', 1, 'narrow')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    expect(getWeekdayNames('de-DE', 1, 'long')[0]).toBe('Montag');
    expect(getWeekdayNames('ar-EG', 6, 'long')[0]).toBe('السبت');
  });
});

describe('getMonthNames', () => {
  test('twelve names from January, in the form a month shows on its own', () => {
    expect(getMonthNames('en-US')).toHaveLength(12);
    expect(getMonthNames('en-US', 'short')[8]).toBe('Sep');
    // Russian declines a month inside a date; on its own it is nominative.
    expect(getMonthNames('ru-RU')[9]).toBe('октябрь');
  });
});

describe('useFormatDate()', () => {
  const Probe = () => {
    const format = useFormatDate();
    return <p data-testid="p">{format(october15, { month: 'long' })}</p>;
  };

  test('formats in the provider locale, and again when it changes', async () => {
    const [locale, setLocale] = createSignal('en-US', { name: 'locale' });
    const { getByTestId } = render(() => (
      <SlopkitUi locale={locale()}>
        <Probe />
      </SlopkitUi>
    ));
    expect(getByTestId('p')).toHaveTextContent('October');

    const { artifact } = await captureArtifact(() => setLocale('de-DE'), { scenario: 'format-date-locale' });

    expect(getByTestId('p')).toHaveTextContent('Oktober');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('throws outside <SlopkitUi>', () => {
    expect(() => render(() => <Probe />)).toThrow('<SlopkitUi>');
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./format.fixtures.tsx', 'formatted');
  });
});
