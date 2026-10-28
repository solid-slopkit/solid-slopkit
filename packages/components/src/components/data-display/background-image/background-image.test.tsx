import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { BackgroundImage } from './background-image';

const image = (el: HTMLElement) => el.style.getPropertyValue('--_background-image');

describe('<BackgroundImage />', () => {
  test('a div with the URL in a custom property, and its children inside', () => {
    const { getByText } = render(() => (
      <BackgroundImage src="/hero.png">
        <span>Content</span>
      </BackgroundImage>
    ));
    const root = getByText('Content').parentElement!;

    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass('slp-background-image');
    expect(image(root)).toBe('url("/hero.png")');
    expect(root).not.toHaveAttribute('src');
  });

  test('quotes and backslashes in the URL are escaped, line breaks dropped', () => {
    const { container } = render(() => <BackgroundImage src={'/a "b"\\c\nd.png'} />);

    expect(image(container.firstElementChild as HTMLElement)).toBe('url("/a \\"b\\"\\\\cd.png")');
  });

  test('the style object is kept, and other props pass through', () => {
    const { container } = render(() => (
      <BackgroundImage src="/hero.png" style={{ 'min-height': '10rem' }} id="b" class="mine" role="img" aria-label="Hills" />
    ));
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.minHeight).toBe('10rem');
    expect(image(root)).toBe('url("/hero.png")');
    expect(root).toHaveAttribute('id', 'b');
    expect(root).toHaveAttribute('role', 'img');
    expect(root).toHaveAttribute('aria-label', 'Hills');
    expect(root).toHaveClass('slp-background-image', 'mine');
  });

  test('changing the src updates the custom property without diagnostics or waste', async () => {
    const [src, setSrc] = createSignal('/a.png', { name: 'src' });
    const { container } = render(() => <BackgroundImage src={src()} />);
    flush();
    const root = container.firstElementChild as HTMLElement;

    const { artifact } = await captureArtifact(() => setSrc('/b.png'), { scenario: 'background-image-src' });

    expect(image(root)).toBe('url("/b.png")');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <BackgroundImage src="/hero.png">
          <h2>On top of the image</h2>
        </BackgroundImage>
        <BackgroundImage src="/hills.png" role="img" aria-label="Green hills under a blue sky" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./background-image.fixtures.tsx', 'backgrounds');
  });
});
