import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Paper } from './paper';

describe('<Paper /> in a browser', () => {
  test('defaults: base-100 background, 1rem padding, a 1rem radius, no border or shadow', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Paper>Default</Paper>
        <div data-testid="token" style={{ 'background-color': 'var(--slp-color-base-100)' }} />
      </>
    ));
    const css = getComputedStyle(getByText('Default'));
    const token = getComputedStyle(getByTestId('token'));

    expect(css.backgroundColor).toBe(token.backgroundColor);
    expect(css.borderTopLeftRadius).toBe('16px');
    expect(css.paddingTop).toBe('16px');
    expect(css.borderTopStyle).toBe('none');
    expect(css.boxShadow).toBe('none');
  });

  test('padding, surface, radius, border and shadow apply', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Paper padding="xl" surface="base-300" radius="none" withBorder shadow="lg">
          Styled
        </Paper>
        <Paper padding="none">Flush</Paper>
        <div data-testid="token" style={{ 'background-color': 'var(--slp-color-base-300)' }} />
      </>
    ));
    const css = getComputedStyle(getByText('Styled'));

    expect(css.paddingTop).toBe('32px');
    expect(getComputedStyle(getByText('Flush')).paddingTop).toBe('0px');
    expect(css.backgroundColor).toBe(getComputedStyle(getByTestId('token')).backgroundColor);
    expect(css.borderTopLeftRadius).toBe('0px');
    expect([css.borderTopStyle, css.borderTopWidth]).toEqual(['solid', '1px']);
    expect(css.boxShadow).not.toBe('none');
  });
});
