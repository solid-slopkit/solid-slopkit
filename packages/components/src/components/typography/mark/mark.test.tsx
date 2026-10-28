import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopColor } from '../../../core';
import { Mark } from './mark';

describe('<Mark />', () => {
  test('renders a mark with the warning color by default', () => {
    const { getByText } = render(() => <Mark>found</Mark>);
    const mark = getByText('found');

    expect(mark.tagName).toBe('MARK');
    expect(mark).toHaveClass('slp-mark');
    expect(mark).toHaveAttribute('data-color', 'warning');
  });

  test('color is a data attribute; other props pass through', () => {
    const { getByText } = render(() => (
      <Mark color="info" id="m" class="mine" title="Match">
        found
      </Mark>
    ));
    const mark = getByText('found');

    expect(mark).toHaveAttribute('data-color', 'info');
    expect(mark).toHaveAttribute('id', 'm');
    expect(mark).toHaveAttribute('title', 'Match');
    expect(mark).toHaveClass('slp-mark', 'mine');
  });

  test('changing the color updates the attribute without diagnostics or waste', async () => {
    const [color, setColor] = createSignal<SlopColor>('warning', { name: 'color' });
    const { getByText } = render(() => <Mark color={color()}>found</Mark>);
    flush();

    const { artifact } = await captureArtifact(() => setColor('success'), { scenario: 'mark-color' });

    expect(getByText('found')).toHaveAttribute('data-color', 'success');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <p>
        <Mark>default</Mark> <Mark color="primary">primary</Mark> <Mark color="error">error</Mark>
      </p>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./mark.fixtures.tsx', 'marks');
  });
});
