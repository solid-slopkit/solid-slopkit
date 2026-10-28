import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { NumberFormatter } from './number-formatter';

// Intl puts narrow no-break spaces in some formats; compare with plain spaces.
const text = (el: Element) => el.textContent!.replace(/[  ]/g, ' ');

describe('<NumberFormatter />', () => {
  test('a span with the number in the provider locale, en-US by default', () => {
    const { container } = render(() => (
      <SlopkitUi>
        <NumberFormatter value={1234567.891} />
      </SlopkitUi>
    ));
    const span = container.querySelector('.slp-number-formatter')!;

    expect(span.tagName).toBe('SPAN');
    expect(text(span)).toBe('1,234,567.891');
  });

  test('follows the provider locale; locale overrides it for one number', () => {
    const { container } = render(() => (
      <SlopkitUi locale="de-DE">
        <NumberFormatter value={1234.5} />
        <NumberFormatter value={1234.5} locale="fr-FR" />
      </SlopkitUi>
    ));
    const [german, french] = [...container.querySelectorAll('.slp-number-formatter')];

    expect(text(german)).toBe('1.234,5');
    expect(text(french)).toBe('1 234,5');
  });

  test('options go to Intl.NumberFormat; prefix and suffix wrap the result; bigint works', () => {
    const { container } = render(() => (
      <SlopkitUi>
        <NumberFormatter value={9.5} options={{ style: 'currency', currency: 'EUR' }} />
        <NumberFormatter value={0.256} options={{ style: 'percent', maximumFractionDigits: 1 }} suffix=" done" />
        <NumberFormatter value={1500000} options={{ notation: 'compact' }} prefix="~" />
        <NumberFormatter value={12345678901234567890n} />
      </SlopkitUi>
    ));

    expect([...container.querySelectorAll('.slp-number-formatter')].map(text)).toEqual([
      '€9.50',
      '25.6% done',
      '~1.5M',
      '12,345,678,901,234,567,890',
    ]);
  });

  test('null and undefined show nothing; other props pass through', () => {
    const { container } = render(() => (
      <SlopkitUi>
        <NumberFormatter value={null} id="n" class="mine" title="No value" />
        <NumberFormatter value={undefined} />
      </SlopkitUi>
    ));
    const [empty, missing] = [...container.querySelectorAll('.slp-number-formatter')];

    expect(empty).toBeEmptyDOMElement();
    expect(missing).toBeEmptyDOMElement();
    expect(empty).toHaveAttribute('id', 'n');
    expect(empty).toHaveAttribute('title', 'No value');
    expect(empty).toHaveClass('slp-number-formatter', 'mine');
  });

  test('a new value formats again without a new formatter, diagnostics or waste', async () => {
    const [value, setValue] = createSignal(1, { name: 'value' });
    const { container } = render(() => (
      <SlopkitUi>
        <NumberFormatter value={value()} options={{ style: 'currency', currency: 'USD' }} />
      </SlopkitUi>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setValue(2.5), { scenario: 'number-formatter-value' });

    expect(text(container.querySelector('.slp-number-formatter')!)).toBe('$2.50');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('a new provider locale formats again', () => {
    const [locale, setLocale] = createSignal('en-US', { name: 'locale' });
    const { container } = render(() => (
      <SlopkitUi locale={locale()}>
        <NumberFormatter value={1234.5} />
      </SlopkitUi>
    ));

    setLocale('de-DE');
    flush();

    expect(text(container.querySelector('.slp-number-formatter')!)).toBe('1.234,5');
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <p>
          Total: <NumberFormatter value={9.5} options={{ style: 'currency', currency: 'EUR' }} />
        </p>
      </SlopkitUi>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./number-formatter.fixtures.tsx', 'numbers');
  });
});
