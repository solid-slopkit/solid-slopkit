import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Divider } from './divider';

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

describe('<Divider /> in a browser', () => {
  test('horizontal: a full-width 1px line in a muted text color, with no margin', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '300px' }}>
        <Divider />
      </div>
    ));
    const divider = getByRole('separator');
    const css = getComputedStyle(divider);

    expect(rect(divider)).toEqual({ width: 300, height: 1 });
    expect([css.borderTopStyle, css.borderTopWidth, css.marginTop]).toEqual(['solid', '1px', '0px']);
    expect(css.borderTopColor).toMatch(/\/ 0\.12\)$/);
  });

  test('horizontal: spans a flex column even when it centers its items', () => {
    const { getByRole } = render(() => (
      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', width: '300px' }}>
        <span>Centered</span>
        <Divider />
      </div>
    ));

    expect(rect(getByRole('separator')).width).toBe(300);
  });

  test('horizontal in a row: the lines share the space the text leaves, and stay 1px tall', () => {
    const { getAllByRole, getByText } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'center', gap: '8px', width: '300px' }}>
        <Divider />
        <span style={{ width: '60px', 'flex-shrink': '0' }}>or</span>
        <Divider />
      </div>
    ));
    const [left, right] = getAllByRole('separator');

    expect(rect(left)).toEqual({ width: 112, height: 1 });
    expect(rect(right)).toEqual({ width: 112, height: 1 });
    expect(rect(getByText('or')).width).toBe(60);
  });

  test('vertical: as tall as its flex row, or 1em next to inline content', () => {
    const { getAllByRole } = render(() => (
      <>
        <div style={{ display: 'flex', height: '40px', 'align-items': 'center' }}>
          <span>Left</span>
          <Divider orientation="vertical" />
          <span>Right</span>
        </div>
        <p style={{ 'font-size': '20px' }}>
          Left <Divider orientation="vertical" /> Right
        </p>
      </>
    ));
    const [inRow, inline] = getAllByRole('separator');

    expect(rect(inRow)).toEqual({ width: 1, height: 40 });
    expect(getComputedStyle(inRow).borderLeftStyle).toBe('solid');
    expect(getComputedStyle(inRow).borderTopStyle).toBe('none');
    expect(rect(inline)).toEqual({ width: 1, height: 20 });
  });

  test('variant and color style the line', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <Divider variant="dashed" color="error" />
        <Divider variant="dotted" />
        <span data-testid="token" style={{ color: 'var(--slp-color-error)' }} />
      </>
    ));
    const [dashed, dotted] = getAllByRole('separator');

    expect(getComputedStyle(dashed).borderTopStyle).toBe('dashed');
    expect(getComputedStyle(dashed).borderTopColor).toBe(getComputedStyle(getByTestId('token')).color);
    expect(getComputedStyle(dotted).borderTopStyle).toBe('dotted');
  });
});
