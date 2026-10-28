import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Image } from './image';

// A 4×2 PNG: twice as wide as it is tall.
const wide =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAEUlEQVR42mP8z8Dwn4EIwDiqEAAhAgP/x7a6fAAAAABJRU5ErkJggg==';
const red =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

const loaded = (img: HTMLImageElement) =>
  new Promise<void>((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => reject(new Error('image failed')), { once: true });
  });

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

describe('<Image /> in a browser', () => {
  test('a block that never overflows its container', async () => {
    const { getByRole } = render(() => (
      <div style={{ width: '100px' }}>
        <Image src={wide} alt="Wide" width={400} />
      </div>
    ));
    const img = getByRole('img') as HTMLImageElement;
    await loaded(img);

    expect(getComputedStyle(img).display).toBe('block');
    expect(rect(img).width).toBe(100);
  });

  test('fit decides how the picture fills a box of another aspect ratio', () => {
    const { getAllByRole } = render(() => (
      <>
        <Image src={wide} alt="Cover" style={{ width: '100px', height: '100px' }} />
        <Image src={wide} alt="Contain" fit="contain" style={{ width: '100px', height: '100px' }} />
      </>
    ));
    const [cover, contain] = getAllByRole('img');

    expect(getComputedStyle(cover).objectFit).toBe('cover');
    expect(getComputedStyle(contain).objectFit).toBe('contain');
    expect(rect(cover)).toEqual({ width: 100, height: 100 });
  });

  test('a broken src falls back, and loads the fallback', async () => {
    const { getByRole } = render(() => <Image src="/does-not-exist.png" fallbackSrc={red} alt="With fallback" />);
    const img = getByRole('img') as HTMLImageElement;

    await expect.poll(() => img.getAttribute('src')).toBe(red);
    await loaded(img);
    expect(img.naturalWidth).toBe(1);
  });

  test('a source the browser already knows is broken falls back too', async () => {
    // Load the broken source first, so the browser has it as failed when Image renders it.
    const probe = new window.Image();
    probe.src = '/also-does-not-exist.png';
    await new Promise((resolve) => probe.addEventListener('error', resolve, { once: true }));

    const { getByRole } = render(() => <Image src="/also-does-not-exist.png" fallbackSrc={red} alt="Failed early" />);
    const img = getByRole('img') as HTMLImageElement;

    await expect.poll(() => img.getAttribute('src')).toBe(red);
  });

  test('an SVG with no size of its own is not taken for a failure', async () => {
    const svg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>');
    const { getByRole } = render(() => <Image src={svg} fallbackSrc={red} alt="Sizeless" />);
    const img = getByRole('img') as HTMLImageElement;
    await loaded(img);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(img.getAttribute('src')).toBe(svg);
  });
});
