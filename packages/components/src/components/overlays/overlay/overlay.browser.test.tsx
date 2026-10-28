import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { Overlay, type OverlayProps } from './overlay';

const rect = (el: Element) => {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) };
};

function setup(props: OverlayProps = {}) {
  const onClick = vi.fn();
  const result = render(() => (
    <div data-testid="parent" style={{ position: 'relative', width: '300px', height: '200px', 'border-radius': '16px' }}>
      <button onClick={onClick}>Under</button>
      <Overlay data-testid="overlay" {...props} />
    </div>
  ));
  return { ...result, onClick, parent: result.getByTestId('parent'), overlay: result.getByTestId('overlay') };
}

describe('<Overlay /> in a browser', () => {
  test('fills its positioned parent, with its corners, and catches the pointer', async () => {
    const { parent, overlay, onClick, getByText } = setup();

    expect(rect(overlay)).toEqual(rect(parent));
    expect(getComputedStyle(overlay).borderTopLeftRadius).toBe('16px');
    await userEvent.click(getByText('Under'), { force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  test('black at the opacity by default; a color role and the public property change the color', () => {
    const black = setup();
    expect(getComputedStyle(black.overlay).backgroundColor).toBe('oklab(0 0 0 / 0.6)');
    black.unmount();

    const custom = setup({ backgroundOpacity: 0.5, style: { '--slp-overlay-color': 'white' } });
    // White, give or take the color space conversion.
    const [lightness, , , alpha] = getComputedStyle(custom.overlay)
      .backgroundColor.match(/[\d.]+/g)!
      .map(Number);
    expect(lightness).toBeCloseTo(1, 3);
    expect(alpha).toBe(0.5);
  });

  test('blur blurs what is behind it, only when set', () => {
    const plain = setup();
    expect(getComputedStyle(plain.overlay).backdropFilter).toBe('none');
    plain.unmount();

    const blurred = setup({ blur: 4 });
    expect(getComputedStyle(blurred.overlay).backdropFilter).toBe('blur(4px)');
  });

  test('fixed covers the viewport', () => {
    const { overlay } = setup({ fixed: true });

    expect(rect(overlay)).toEqual({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
  });

  test('center puts its children in the middle', () => {
    const { getByText } = render(() => (
      <div style={{ position: 'relative', width: '300px', height: '200px' }}>
        <Overlay center>
          <span style={{ display: 'block', width: '100px', height: '40px' }}>Middle</span>
        </Overlay>
      </div>
    ));
    const parentBox = rect(getByText('Middle').parentElement!);
    const box = rect(getByText('Middle'));

    expect(box.left - parentBox.left).toBe(100);
    expect(box.top - parentBox.top).toBe(80);
  });
});
