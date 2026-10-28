import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopSize } from '../../../core';
import { Kbd } from './kbd';

describe('<Kbd />', () => {
  test('renders a kbd with its text, and no size by default', () => {
    const { getByText } = render(() => <Kbd>Ctrl</Kbd>);
    const kbd = getByText('Ctrl');

    expect(kbd.tagName).toBe('KBD');
    expect(kbd).toHaveClass('slp-kbd');
    expect(kbd).not.toHaveAttribute('data-size');
  });

  test('size is a data attribute; other props pass through', () => {
    const { getByText } = render(() => (
      <Kbd size="lg" id="k" class="mine" title="Escape">
        Esc
      </Kbd>
    ));
    const kbd = getByText('Esc');

    expect(kbd).toHaveAttribute('data-size', 'lg');
    expect(kbd).toHaveAttribute('id', 'k');
    expect(kbd).toHaveAttribute('title', 'Escape');
    expect(kbd).toHaveClass('slp-kbd', 'mine');
    expect(kbd).not.toHaveAttribute('size');
  });

  test('changing the size updates the attribute without diagnostics or waste', async () => {
    const [size, setSize] = createSignal<SlopSize | undefined>(undefined, { name: 'size' });
    const { getByText } = render(() => <Kbd size={size()}>K</Kbd>);
    flush();
    const kbd = getByText('K');

    const { artifact } = await captureArtifact(() => setSize('xl'), { scenario: 'kbd-size' });

    expect(kbd).toHaveAttribute('data-size', 'xl');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <p>
          Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.
        </p>
        <p>
          <Kbd size="xs">Shift</Kbd> <Kbd size="xl">Enter</Kbd>
        </p>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./kbd.fixtures.tsx', 'keys');
  });
});
