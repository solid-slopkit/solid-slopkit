import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { ColorSwatch } from './color-swatch';

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

describe('<ColorSwatch /> in a browser', () => {
  test('sizes are circles', () => {
    const { container } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <ColorSwatch value="red" size="xs" />
        <ColorSwatch value="red" size="sm" />
        <ColorSwatch value="red" />
        <ColorSwatch value="red" size="lg" />
        <ColorSwatch value="red" size="xl" />
      </div>
    ));
    const swatches = [...container.querySelectorAll('.slp-color-swatch')];

    expect(swatches.map((el) => rect(el).width)).toEqual([16, 20, 28, 36, 44]);
    expect(swatches.map((el) => rect(el).height)).toEqual([16, 20, 28, 36, 44]);
    expect(getComputedStyle(swatches[0]).borderTopLeftRadius).toBe('50%');
  });

  test('the color is a layer over a checkerboard, ringed so a light color stays visible', () => {
    const { container } = render(() => <ColorSwatch value="rgb(255, 0, 0)" />);
    const swatch = container.firstElementChild!;
    const layer = getComputedStyle(swatch, '::before');

    expect(layer.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(layer.boxShadow).toMatch(/inset$/);
    expect(getComputedStyle(swatch).backgroundImage).toMatch(/^conic-gradient/);
  });

  test('the color layer sits below the children: a stacking context of its own, with the layer at z-index -1', () => {
    const { container } = render(() => (
      <ColorSwatch value="rgb(0, 0, 0)" size="xl">
        Aa
      </ColorSwatch>
    ));
    const swatch = container.firstElementChild!;

    expect(getComputedStyle(swatch).isolation).toBe('isolate');
    expect(getComputedStyle(swatch, '::before').zIndex).toBe('-1');
  });
});
