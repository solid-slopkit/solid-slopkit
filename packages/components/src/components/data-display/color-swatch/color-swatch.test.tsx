import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { ColorSwatch } from './color-swatch';

const swatchColor = (el: Element) => (el as HTMLElement).style.getPropertyValue('--_swatch-color');

describe('<ColorSwatch />', () => {
  test('a span with the value in a custom property, md by default, with no role', () => {
    const { container } = render(() => <ColorSwatch value="#7048e8" />);
    const swatch = container.firstElementChild!;

    expect(swatch.tagName).toBe('SPAN');
    expect(swatch).toHaveClass('slp-color-swatch');
    expect(swatch).toHaveAttribute('data-size', 'md');
    expect(swatchColor(swatch)).toBe('#7048e8');
    expect(swatch).not.toHaveAttribute('role');
    expect(swatch).not.toHaveAttribute('value');
  });

  test('the style object is kept; size and other props pass through; children render inside', () => {
    const { getByRole } = render(() => (
      <ColorSwatch value="red" size="xl" style={{ 'border-radius': '4px' }} role="img" aria-label="Red" id="s" class="mine">
        <b>✓</b>
      </ColorSwatch>
    ));
    const swatch = getByRole('img', { name: 'Red' }) as HTMLElement;

    expect(swatch.style.borderRadius).toBe('4px');
    expect(swatchColor(swatch)).toBe('red');
    expect(swatch).toHaveAttribute('data-size', 'xl');
    expect(swatch).toHaveAttribute('id', 's');
    expect(swatch).toHaveClass('slp-color-swatch', 'mine');
    expect(swatch).toHaveTextContent('✓');
  });

  test('changing the value updates the custom property without diagnostics or waste', async () => {
    const [value, setValue] = createSignal('#000000', { name: 'value' });
    const { container } = render(() => <ColorSwatch value={value()} />);
    flush();

    const { artifact } = await captureArtifact(() => setValue('#ffffff'), { scenario: 'color-swatch-value' });

    expect(swatchColor(container.firstElementChild!)).toBe('#ffffff');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <p>
          <ColorSwatch value="#7048e8" /> Grape
        </p>
        <ColorSwatch value="rgb(0 0 0 / 40%)" role="img" aria-label="Black at 40%" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./color-swatch.fixtures.tsx', 'swatches');
  });
});
