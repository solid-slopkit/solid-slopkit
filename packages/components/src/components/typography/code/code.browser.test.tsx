import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { Code } from './code';

describe('<Code /> in a browser', () => {
  test('inline: monospace on the base surface, scaled with the text around it', () => {
    const { getByText, getByTestId } = render(() => (
      <p style={{ 'font-size': '20px' }}>
        Run <Code>pnpm</Code>
        <span data-testid="surface" style={{ color: 'var(--slp-color-base-200)' }} />
      </p>
    ));
    const css = getComputedStyle(getByText('pnpm'));

    expect(css.fontFamily).toMatch(/monospace/);
    expect(css.fontSize).toBe('17px');
    expect(css.backgroundColor).toBe(getComputedStyle(getByTestId('surface')).color);
  });

  test('block: keeps line breaks, and scrolls a long line instead of wrapping', () => {
    const long = 'x'.repeat(200);
    const { getByText } = render(() => (
      <div style={{ width: '200px' }}>
        <Code block>{`one\ntwo\n${long}`}</Code>
      </div>
    ));
    const pre = getByText(/one/).parentElement!;
    const css = getComputedStyle(pre);

    expect(pre.getBoundingClientRect().width).toBe(200);
    expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
    expect(css.whiteSpace).toBe('pre');
    expect(css.marginTop).toBe('0px');
    expect(pre.innerText.split('\n').slice(0, 2)).toEqual(['one', 'two']);
  });

  test('block: the keyboard reaches it, and it scrolls with arrow keys', async () => {
    const { getByText } = render(() => (
      <>
        <button type="button">Before</button>
        <div style={{ width: '200px' }}>
          <Code block>{'y'.repeat(300)}</Code>
        </div>
      </>
    ));
    const pre = getByText(/y+/).parentElement!;
    getByText('Before').focus();

    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(pre);

    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => pre.scrollLeft).toBeGreaterThan(0);
  });

  test('a scrolling block passes axe', async () => {
    const { container } = render(() => (
      <div style={{ width: '200px' }}>
        <Code block>{'z'.repeat(300)}</Code>
      </div>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
