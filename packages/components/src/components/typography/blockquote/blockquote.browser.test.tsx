import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Blockquote } from './blockquote';

describe('<Blockquote /> in a browser', () => {
  test('no margins; a 4px bar on the start side, in a muted text color', () => {
    const { getByText } = render(() => (
      <div style={{ width: '300px' }}>
        <Blockquote>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </Blockquote>
      </div>
    ));
    const quote = getByText('First paragraph').parentElement!;
    const figure = quote.parentElement!;
    const css = getComputedStyle(figure);

    expect(figure.getBoundingClientRect().width).toBe(300);
    expect([css.marginTop, css.marginLeft, getComputedStyle(quote).marginLeft]).toEqual(['0px', '0px', '0px']);
    expect([css.borderLeftStyle, css.borderLeftWidth]).toEqual(['solid', '4px']);
    expect(css.borderLeftColor).toMatch(/\/ 0\.2\)$/);
    expect(getComputedStyle(getByText('First paragraph')).marginTop).toBe('0px');
    expect(getComputedStyle(getByText('Second paragraph')).marginBottom).toBe('0px');
  });

  test('color sets the bar from the role', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Blockquote color="primary">Quote</Blockquote>
        <span data-testid="token" style={{ color: 'var(--slp-color-primary)' }} />
      </>
    ));

    expect(getComputedStyle(getByText('Quote').parentElement!).borderLeftColor).toBe(
      getComputedStyle(getByTestId('token')).color,
    );
  });

  test('the attribution sits below the quote, smaller and muted', () => {
    const { getByText } = render(() => (
      <div style={{ 'font-size': '16px', color: 'rgb(0, 0, 0)' }}>
        <Blockquote attribution="— Ada">Quote</Blockquote>
      </div>
    ));
    const quote = getByText('Quote');
    const caption = getByText('— Ada');
    const css = getComputedStyle(caption);

    expect(caption.getBoundingClientRect().top).toBeGreaterThan(quote.getBoundingClientRect().bottom);
    expect(css.fontSize).toBe('14px');
    expect(css.color).not.toBe('rgb(0, 0, 0)');
  });
});
