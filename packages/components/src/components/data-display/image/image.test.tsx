import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Image } from './image';

const fail = (img: HTMLElement) => {
  img.dispatchEvent(new Event('error'));
  flush();
};

describe('<Image />', () => {
  test('renders an img with its alt and the cover fit by default', () => {
    const { getByRole } = render(() => <Image src="/a.png" alt="A mountain" />);
    const img = getByRole('img', { name: 'A mountain' });

    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/a.png');
    expect(img).toHaveClass('slp-image');
    expect(img).toHaveAttribute('data-fit', 'cover');
    expect(img).not.toHaveAttribute('data-fallback');
  });

  test('fit is a data attribute; native attributes and other props pass through', () => {
    const { getByRole } = render(() => (
      <Image src="/a.png" alt="A" fit="contain" width={200} height={100} loading="lazy" id="i" class="mine" />
    ));
    const img = getByRole('img');

    expect(img).toHaveAttribute('data-fit', 'contain');
    expect(img).toHaveAttribute('width', '200');
    expect(img).toHaveAttribute('height', '100');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('id', 'i');
    expect(img).toHaveClass('slp-image', 'mine');
    expect(img).not.toHaveAttribute('fit');
    expect(img).not.toHaveAttribute('fallbackSrc');
  });

  test('on error, switches to fallbackSrc and calls onError', () => {
    const onError = vi.fn();
    const { getByRole } = render(() => <Image src="/broken.png" fallbackSrc="/fallback.png" alt="A" onError={onError} />);
    const img = getByRole('img');

    fail(img);

    expect(img).toHaveAttribute('src', '/fallback.png');
    expect(img).toHaveAttribute('data-fallback', '');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test('a failing fallback does not loop, and without fallbackSrc the src stays', () => {
    const { getAllByRole } = render(() => (
      <>
        <Image src="/broken.png" fallbackSrc="/also-broken.png" alt="A" />
        <Image src="/broken.png" alt="B" />
      </>
    ));
    const [withFallback, without] = getAllByRole('img');

    fail(withFallback);
    fail(withFallback);
    fail(without);

    expect(withFallback).toHaveAttribute('src', '/also-broken.png');
    expect(without).toHaveAttribute('src', '/broken.png');
    expect(without).not.toHaveAttribute('data-fallback');
  });

  test('a new src gets its own try after a failure', () => {
    const [src, setSrc] = createSignal('/broken.png', { name: 'src' });
    const { getByRole } = render(() => <Image src={src()} fallbackSrc="/fallback.png" alt="A" />);
    const img = getByRole('img');

    fail(img);
    expect(img).toHaveAttribute('src', '/fallback.png');

    setSrc('/next.png');
    flush();
    expect(img).toHaveAttribute('src', '/next.png');
    expect(img).not.toHaveAttribute('data-fallback');
  });

  test('changing the src updates the attribute without diagnostics or waste', async () => {
    const [src, setSrc] = createSignal('/a.png', { name: 'src' });
    const { getByRole } = render(() => <Image src={src()} alt="A" />);
    flush();

    const { artifact } = await captureArtifact(() => setSrc('/b.png'), { scenario: 'image-src' });

    expect(getByRole('img')).toHaveAttribute('src', '/b.png');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('switching to the fallback runs without diagnostics or waste', async () => {
    const { getByRole } = render(() => <Image src="/broken.png" fallbackSrc="/fallback.png" alt="A" />);
    flush();
    const img = getByRole('img');

    const { artifact } = await captureArtifact(() => img.dispatchEvent(new Event('error')), {
      scenario: 'image-fallback',
    });

    expect(img).toHaveAttribute('src', '/fallback.png');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Image src="/a.png" alt="A mountain at dawn" />
        <Image src="/b.png" alt="" fit="contain" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./image.fixtures.tsx', 'images');
  });
});
