import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Loader, type LoaderVariant } from './loader';

describe('<Loader />', () => {
  test('a status named "Loading", a spinner with no parts, sized to the text by default', () => {
    const { getByRole } = render(() => <Loader />);
    const loader = getByRole('status', { name: 'Loading' });

    expect(loader.tagName).toBe('SPAN');
    expect(loader).toHaveClass('slp-loader');
    expect(loader).toHaveAttribute('data-variant', 'spinner');
    expect(loader).not.toHaveAttribute('data-size');
    expect(loader).not.toHaveAttribute('data-color');
    expect(loader).toBeEmptyDOMElement();
  });

  test('dots and bars have three parts', () => {
    const { getAllByRole } = render(() => (
      <>
        <Loader variant="dots" />
        <Loader variant="bars" />
      </>
    ));

    for (const loader of getAllByRole('status')) {
      expect(loader.querySelectorAll('[data-slot="loader-part"]')).toHaveLength(3);
    }
  });

  test('label names it; variant, size and color are data attributes; other props pass through', () => {
    const { getByRole } = render(() => (
      <Loader label="Loading results" variant="bars" size="lg" color="primary" id="l" class="mine" />
    ));
    const loader = getByRole('status', { name: 'Loading results' });

    expect(loader).toHaveAttribute('data-variant', 'bars');
    expect(loader).toHaveAttribute('data-size', 'lg');
    expect(loader).toHaveAttribute('data-color', 'primary');
    expect(loader).toHaveAttribute('id', 'l');
    expect(loader).toHaveClass('slp-loader', 'mine');
    expect(loader).not.toHaveAttribute('label');
  });

  test('changing the variant swaps the parts without diagnostics or waste', async () => {
    const [variant, setVariant] = createSignal<LoaderVariant>('spinner', { name: 'variant' });
    const { getByRole } = render(() => <Loader variant={variant()} />);
    flush();

    const { artifact } = await captureArtifact(() => setVariant('dots'), { scenario: 'loader-variant' });

    expect(getByRole('status').querySelectorAll('[data-slot="loader-part"]')).toHaveLength(3);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(5);
  });

  test('has no axe violations', async () => {
    const variants: LoaderVariant[] = ['spinner', 'dots', 'bars'];
    const { container } = render(() => (
      <>
        <For each={variants}>{(variant) => <Loader variant={variant} color="primary" />}</For>
        <Loader label="Saving" size="xl" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./loader.fixtures.tsx', 'loaders');
  });
});
