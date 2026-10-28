import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Loader } from './loader';

const size = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return [Math.round(width), Math.round(height)];
};

describe('<Loader /> in a browser', () => {
  test('without a size it is 1em, so it follows the text; sizes are fixed', () => {
    const { getAllByRole } = render(() => (
      <div style={{ 'font-size': '20px', display: 'flex', 'align-items': 'start' }}>
        <Loader />
        <Loader size="xs" />
        <Loader size="sm" />
        <Loader size="md" />
        <Loader size="lg" />
        <Loader size="xl" />
      </div>
    ));

    expect(getAllByRole('status').map(size)).toEqual([
      [20, 20],
      [16, 16],
      [20, 20],
      [28, 28],
      [36, 36],
      [48, 48],
    ]);
  });

  test('the spinner is a turning ring with one side clear, in the current text color', () => {
    const { getByRole } = render(() => (
      <span style={{ color: 'rgb(10, 20, 30)', 'font-size': '16px' }}>
        <Loader />
      </span>
    ));
    const css = getComputedStyle(getByRole('status'));

    expect(css.borderTopColor).toBe('rgb(10, 20, 30)');
    expect(css.borderRightColor).toBe('rgba(0, 0, 0, 0)');
    expect(css.borderTopWidth).toBe('2px');
    expect(css.animationName).toMatch(/slp-loader-spin/);
  });

  test('color takes the role; --slp-loader-color overrides it', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <Loader color="error" />
        <Loader color="error" style={{ '--slp-loader-color': 'rgb(1, 2, 3)' }} />
        <span data-testid="token" style={{ color: 'var(--slp-color-error)' }} />
      </>
    ));
    const [role, custom] = getAllByRole('status');

    expect(getComputedStyle(role).color).toBe(getComputedStyle(getByTestId('token')).color);
    expect(getComputedStyle(custom).color).toBe('rgb(1, 2, 3)');
  });

  test('dots and bars animate their parts in turn', () => {
    const { getAllByRole } = render(() => (
      <>
        <Loader variant="dots" size="xl" />
        <Loader variant="bars" size="xl" />
      </>
    ));
    const [dots, bars] = getAllByRole('status');
    const parts = (el: Element) => [...el.querySelectorAll('[data-slot="loader-part"]')].map((part) => getComputedStyle(part));

    expect(parts(dots).map((css) => css.animationDelay)).toEqual(['0s', '0.15s', '0.3s']);
    expect(parts(dots)[0].animationName).toMatch(/slp-loader-dot/);
    expect(parts(bars)[0].animationName).toMatch(/slp-loader-bar/);
    expect(Math.round(parseFloat(parts(bars)[0].height))).toBe(48);
  });
});
