import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { AspectRatio } from './aspect-ratio';

const size = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

describe('<AspectRatio /> in a browser', () => {
  test('its child fills the width and takes its height from the ratio, which can change', async () => {
    const [ratio, setRatio] = createSignal(16 / 9);
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div style={{ width: '320px' }}>
          <AspectRatio ratio={ratio()}>
            <div data-testid="child" />
          </AspectRatio>
        </div>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => size(getByTestId('child'))).toEqual({ width: 320, height: 180 });

    setRatio(4);
    flush();
    await expect.poll(() => size(getByTestId('child'))).toEqual({ width: 320, height: 80 });
  });

  test('a square by default, and images are cropped to fit', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div style={{ width: '200px' }}>
          <AspectRatio>
            <img data-testid="img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
          </AspectRatio>
        </div>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => size(getByTestId('img'))).toEqual({ width: 200, height: 200 });
    expect(getComputedStyle(getByTestId('img')).objectFit).toBe('cover');
  });
});
