import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { VisuallyHidden } from './visually-hidden';

describe('<VisuallyHidden />', () => {
  test('renders a span with its text', () => {
    const { getByText } = render(() => <VisuallyHidden>Close</VisuallyHidden>);
    const hidden = getByText('Close');

    expect(hidden.tagName).toBe('SPAN');
    expect(hidden).toHaveClass('slp-visually-hidden');
    expect(hidden.attributes).toHaveLength(1);
  });

  test('other props pass through, and class is merged', () => {
    const { getByText } = render(() => (
      <VisuallyHidden id="h" class={['mine', { on: true }]} data-testid="hidden">
        Close
      </VisuallyHidden>
    ));
    const hidden = getByText('Close');

    expect(hidden).toHaveAttribute('id', 'h');
    expect(hidden).toHaveAttribute('data-testid', 'hidden');
    expect(hidden).toHaveClass('slp-visually-hidden', 'mine', 'on');
  });

  test('as renders another element', () => {
    const { getByRole } = render(() => (
      <VisuallyHidden as="h2" id="results">
        Search results
      </VisuallyHidden>
    ));
    const heading = getByRole('heading', { level: 2, name: 'Search results' });

    expect(heading).toHaveClass('slp-visually-hidden');
    expect(heading).toHaveAttribute('id', 'results');
    expect(heading).not.toHaveAttribute('as');
  });

  test('names the control it sits in', () => {
    const { getByRole } = render(() => (
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>
    ));

    expect(getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  test('changing the text updates it without diagnostics or waste', async () => {
    const [count, setCount] = createSignal(1, { name: 'count' });
    const { getByText } = render(() => <VisuallyHidden>{`${count()} unread`}</VisuallyHidden>);
    flush();
    const hidden = getByText('1 unread');

    const { artifact } = await captureArtifact(() => setCount(2), { scenario: 'visually-hidden-text' });

    expect(hidden).toHaveTextContent('2 unread');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <button type="button">
          <span aria-hidden="true">×</span>
          <VisuallyHidden>Close</VisuallyHidden>
        </button>
        <section aria-labelledby="results">
          <VisuallyHidden as="h2" id="results">
            Search results
          </VisuallyHidden>
          <p>Three matches.</p>
        </section>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./visually-hidden.fixtures.tsx', 'label');
    await expectHydration('./visually-hidden.fixtures.tsx', 'heading');
  });
});
