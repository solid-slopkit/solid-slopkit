import { render } from '@solidjs/testing-library';
import type { JSX } from '@solidjs/web';
import { cdp } from 'vitest/browser';
import { afterEach, describe, expect, test } from 'vitest';

// A custom property keeps light-dark() unresolved, so read the token through a color property, where the
// element's own color-scheme resolves it.
const surface = (el: HTMLElement) => getComputedStyle(el).backgroundColor;
const Surface = (props: { 'data-slp-color-scheme'?: string; 'data-testid': string; children?: JSX.Element }) => (
  <div {...props} style={{ 'background-color': 'var(--slp-color-base-100)' }} />
);

const LIGHT = 'oklch(1 0 0)';
const DARK = 'oklch(0.21 0 0)';

const emulateScheme = (value: 'light' | 'dark' | '') =>
  cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }] });

describe('color scheme', () => {
  afterEach(() => emulateScheme(''));

  test('follows the OS by default', async () => {
    const { getByTestId } = render(() => <Surface data-testid="s" />);

    await emulateScheme('light');
    expect(getComputedStyle(document.documentElement).colorScheme).toBe('light dark');
    expect(surface(getByTestId('s'))).toBe(LIGHT);

    await emulateScheme('dark');
    expect(surface(getByTestId('s'))).toBe(DARK);
  });

  test('[data-slp-color-scheme] forces a scheme for its subtree, and nests', async () => {
    await emulateScheme('light');
    const { getByTestId } = render(() => (
      <Surface data-slp-color-scheme="dark" data-testid="dark">
        <Surface data-slp-color-scheme="light" data-testid="light">
          <Surface data-testid="inherited" />
        </Surface>
      </Surface>
    ));

    expect(surface(getByTestId('dark'))).toBe(DARK);
    expect(surface(getByTestId('light'))).toBe(LIGHT);
    expect(surface(getByTestId('inherited'))).toBe(LIGHT);
  });

  test('a forced scheme wins over the OS', async () => {
    await emulateScheme('dark');
    const { getByTestId } = render(() => <Surface data-slp-color-scheme="light" data-testid="s" />);

    expect(surface(getByTestId('s'))).toBe(LIGHT);
  });

  test('on the root element, it sets the scheme of native UI too', async () => {
    await emulateScheme('light');
    document.documentElement.dataset.slpColorScheme = 'dark';
    try {
      expect(getComputedStyle(document.documentElement).colorScheme).toBe('dark');
    } finally {
      delete document.documentElement.dataset.slpColorScheme;
    }
  });
});
