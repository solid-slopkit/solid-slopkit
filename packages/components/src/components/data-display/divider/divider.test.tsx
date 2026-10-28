import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Divider, type DividerOrientation } from './divider';

describe('<Divider />', () => {
  test('renders a horizontal hr, a separator', () => {
    const { getByRole } = render(() => <Divider />);
    const divider = getByRole('separator');

    expect(divider.tagName).toBe('HR');
    expect(divider).toHaveClass('slp-divider');
    expect(divider).toHaveAttribute('data-orientation', 'horizontal');
    expect(divider).toHaveAttribute('data-variant', 'solid');
    expect(divider).not.toHaveAttribute('aria-orientation');
    expect(divider).not.toHaveAttribute('data-color');
  });

  test('vertical sets aria-orientation; variant and color are data attributes; other props pass through', () => {
    const { getByRole } = render(() => <Divider orientation="vertical" variant="dashed" color="primary" id="d" class="mine" />);
    const divider = getByRole('separator');

    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('data-orientation', 'vertical');
    expect(divider).toHaveAttribute('data-variant', 'dashed');
    expect(divider).toHaveAttribute('data-color', 'primary');
    expect(divider).toHaveAttribute('id', 'd');
    expect(divider).toHaveClass('slp-divider', 'mine');
    expect(divider).not.toHaveAttribute('orientation');
  });

  test('changing orientation updates attributes without diagnostics or waste', async () => {
    const [orientation, setOrientation] = createSignal<DividerOrientation>('horizontal', { name: 'orientation' });
    const { getByRole } = render(() => <Divider orientation={orientation()} />);
    flush();
    const divider = getByRole('separator');

    const { artifact } = await captureArtifact(() => setOrientation('vertical'), { scenario: 'divider-orientation' });

    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('data-orientation', 'vertical');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <p>Above</p>
        <Divider />
        <p>Below</p>
        <div style={{ display: 'flex' }}>
          <span>Left</span>
          <Divider orientation="vertical" variant="dotted" color="secondary" />
          <span>Right</span>
        </div>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./divider.fixtures.tsx', 'orientations');
  });
});
