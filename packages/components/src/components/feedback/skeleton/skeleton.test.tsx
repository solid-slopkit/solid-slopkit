import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Skeleton } from './skeleton';

describe('<Skeleton />', () => {
  test('a hidden, animated div by default', () => {
    const { container } = render(() => <Skeleton style={{ height: '1rem' }} />);
    const skeleton = container.firstElementChild!;

    expect(skeleton.tagName).toBe('DIV');
    expect(skeleton).toHaveClass('slp-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveAttribute('data-visible', '');
    expect(skeleton).toHaveAttribute('data-animate', '');
    expect(skeleton).not.toHaveAttribute('data-circle');
  });

  test('circle and animate are data attributes; other props pass through', () => {
    const { container } = render(() => (
      <Skeleton circle animate={false} id="s" class="mine" style={{ width: '2rem', height: '2rem' }} />
    ));
    const skeleton = container.firstElementChild as HTMLElement;

    expect(skeleton).toHaveAttribute('data-circle', '');
    expect(skeleton).not.toHaveAttribute('data-animate');
    expect(skeleton).toHaveAttribute('id', 's');
    expect(skeleton).toHaveClass('slp-skeleton', 'mine');
    expect(skeleton.style.width).toBe('2rem');
  });

  test('visible={false} shows the children: no hidden state and no animation', () => {
    const { getByText } = render(() => (
      <Skeleton visible={false}>
        <p>Loaded</p>
      </Skeleton>
    ));
    const skeleton = getByText('Loaded').parentElement!;

    expect(skeleton).not.toHaveAttribute('aria-hidden');
    expect(skeleton).not.toHaveAttribute('data-visible');
    expect(skeleton).not.toHaveAttribute('data-animate');
  });

  test('loading finishing reveals the content without diagnostics or waste', async () => {
    const [loading, setLoading] = createSignal(true, { name: 'loading' });
    const { getByText } = render(() => (
      <Skeleton visible={loading()}>
        <p>Content</p>
      </Skeleton>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setLoading(false), { scenario: 'skeleton-reveal' });

    expect(getByText('Content').parentElement).not.toHaveAttribute('aria-hidden');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <div aria-busy="true">
        <Skeleton circle style={{ width: '2.5rem', height: '2.5rem' }} />
        <Skeleton style={{ height: '1rem' }} />
        <Skeleton>
          <button type="button">Hidden while loading</button>
        </Skeleton>
        <Skeleton visible={false}>
          <p>Loaded</p>
        </Skeleton>
      </div>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./skeleton.fixtures.tsx', 'skeletons');
  });
});
