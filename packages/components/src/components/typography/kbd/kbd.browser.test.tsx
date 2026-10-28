import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Kbd } from './kbd';

describe('<Kbd /> in a browser', () => {
  test('a keycap: monospace, bold, with a thicker bottom border', () => {
    const { getByText } = render(() => <Kbd>Ctrl</Kbd>);
    const css = getComputedStyle(getByText('Ctrl'));

    expect(css.fontFamily).toMatch(/monospace/);
    expect(css.fontWeight).toBe('700');
    expect([css.borderTopWidth, css.borderBottomWidth]).toEqual(['1px', '3px']);
    expect(css.whiteSpace).toBe('nowrap');
  });

  test('without a size, it scales with the text around it', () => {
    const { getByText } = render(() => (
      <>
        <p style={{ 'font-size': '20px' }}>
          Press <Kbd>Big</Kbd>
        </p>
        <p style={{ 'font-size': '10px' }}>
          Press <Kbd>Small</Kbd>
        </p>
      </>
    ));

    expect(getComputedStyle(getByText('Big')).fontSize).toBe('17px');
    expect(getComputedStyle(getByText('Small')).fontSize).toBe('8.5px');
  });

  test('size takes the font size from the type scale, whatever the text around it', () => {
    const { getByText, getByTestId } = render(() => (
      <p style={{ 'font-size': '30px' }}>
        <Kbd size="sm">Esc</Kbd>
        <span data-testid="token" style={{ 'font-size': 'var(--slp-font-size-sm)' }} />
      </p>
    ));

    expect(getComputedStyle(getByText('Esc')).fontSize).toBe(getComputedStyle(getByTestId('token')).fontSize);
  });

  test('a single character is at least as wide as it is tall', () => {
    const { getByText } = render(() => <Kbd size="md">K</Kbd>);
    const { width, height } = getByText('K').getBoundingClientRect();

    expect(width).toBeGreaterThanOrEqual(height - 1);
  });
});
