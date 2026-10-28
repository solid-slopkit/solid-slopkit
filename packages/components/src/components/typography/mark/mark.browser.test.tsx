import { render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import type { SlopColor } from '../../../core';
import { Mark } from './mark';

// Not accent: in the default theme's dark scheme it is pure white, and any tint strong enough to show is too light
// under light text.
const colors: SlopColor[] = ['neutral', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

describe('<Mark /> in a browser', () => {
  test('a translucent tint of the role; the text keeps the color around it', () => {
    const { getByText } = render(() => (
      <p style={{ color: 'rgb(10, 20, 30)' }}>
        A <Mark>match</Mark>
      </p>
    ));
    const css = getComputedStyle(getByText('match'));

    expect(css.color).toBe('rgb(10, 20, 30)');
    expect(css.backgroundColor).toMatch(/\/ 0\.3\)$/);
  });

  test('a mark that wraps gets its padding on every line', () => {
    const { getByText } = render(() => (
      <p style={{ width: '120px' }}>
        <Mark>a highlighted phrase that wraps onto several lines</Mark>
      </p>
    ));
    const mark = getByText(/a highlighted phrase/);

    expect(getComputedStyle(mark).boxDecorationBreak).toBe('clone');
    expect(mark.getClientRects().length).toBeGreaterThan(1);
  });

  test('--slp-mark-color overrides the role', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Mark color="primary" style={{ '--slp-mark-color': 'rgb(255, 0, 0)' }}>
          custom
        </Mark>
        <span data-testid="tint" style={{ 'background-color': 'color-mix(in oklab, rgb(255, 0, 0) 30%, transparent)' }} />
      </>
    ));

    expect(getComputedStyle(getByText('custom')).backgroundColor).toBe(getComputedStyle(getByTestId('tint')).backgroundColor);
  });

  test('the colors keep the text readable in both color schemes', async () => {
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <For each={colors}>
            {(color) => (
              <p>
                Text with a <Mark color={color}>{color}</Mark> mark.
              </p>
            )}
          </For>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((violation) => violation.nodes.map((node) => `${scheme}: ${node.html}`))).toEqual([]);
      unmount();
    }
  });
});
