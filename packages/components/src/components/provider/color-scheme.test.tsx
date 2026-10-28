import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { SlopkitUi, useColorScheme, type SlopkitUiProps, type UseColorScheme } from '.';
import { colorSchemeScript } from './color-scheme';
import { expectHydration, renderAndHydrate } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';

const root = document.documentElement;
const attribute = () => root.getAttribute('data-slp-color-scheme');

// jsdom has no matchMedia: a stand-in whose OS scheme the test switches.
let osDark = false;
const mediaListeners = new Set<() => void>();
const setOsDark = (dark: boolean) => {
  osDark = dark;
  mediaListeners.forEach((listener) => listener());
};

beforeEach(() => {
  osDark = false;
  window.matchMedia = (query: string) =>
    ({
      media: query,
      get matches() {
        return osDark;
      },
      addEventListener: (_: string, listener: () => void) => mediaListeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => mediaListeners.delete(listener),
    }) as unknown as MediaQueryList;
});

afterEach(() => {
  localStorage.clear();
  root.removeAttribute('data-slp-color-scheme');
  mediaListeners.clear();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

function setup(props: Omit<SlopkitUiProps, 'children'> = {}) {
  let scheme!: UseColorScheme;
  const Probe = () => {
    scheme = useColorScheme();
    return <p data-testid="probe">{`${scheme.colorScheme()} ${scheme.resolvedColorScheme()}`}</p>;
  };
  const { getByTestId, unmount } = render(() => (
    <SlopkitUi {...props}>
      <Probe />
    </SlopkitUi>
  ));
  flush();
  return { scheme, text: () => getByTestId('probe').textContent, unmount };
}

describe('useColorScheme()', () => {
  test('defaults to auto, following the OS, and leaves the page to the OS too', () => {
    const { text } = setup();
    expect(text()).toBe('auto light');
    expect(attribute()).toBeNull();

    setOsDark(true);
    flush();
    expect(text()).toBe('auto dark');
    expect(attribute()).toBeNull();
  });

  test('picks up the stored preference once settled', () => {
    localStorage.setItem('slp-color-scheme', 'dark');
    const { text } = setup();
    expect(text()).toBe('dark dark');
    expect(attribute()).toBe('dark');
  });

  test('ignores a stored value that is not a preference', () => {
    localStorage.setItem('slp-color-scheme', 'purple');
    const { text } = setup({ defaultColorScheme: 'light' });
    expect(text()).toBe('light light');
  });

  test('setColorScheme stores and applies the preference', async () => {
    const { scheme, text } = setup();

    const { artifact } = await captureArtifact(() => scheme.setColorScheme('dark'), { scenario: 'set-color-scheme' });

    expect(text()).toBe('dark dark');
    expect(attribute()).toBe('dark');
    expect(localStorage.getItem('slp-color-scheme')).toBe('dark');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();

    scheme.setColorScheme('auto');
    flush();
    expect(text()).toBe('auto light');
    expect(attribute()).toBeNull();
    expect(localStorage.getItem('slp-color-scheme')).toBe('auto');
  });

  test('toggleColorScheme stores the opposite of the scheme showing', () => {
    setOsDark(true);
    const { scheme, text } = setup();
    expect(text()).toBe('auto dark');

    scheme.toggleColorScheme();
    flush();
    expect(text()).toBe('light light');
    expect(localStorage.getItem('slp-color-scheme')).toBe('light');

    scheme.toggleColorScheme();
    flush();
    expect(text()).toBe('dark dark');
  });

  test('clearColorScheme forgets the stored preference and goes back to the default', () => {
    localStorage.setItem('slp-color-scheme', 'light');
    const { scheme, text } = setup({ defaultColorScheme: 'dark' });
    expect(text()).toBe('light light');

    scheme.clearColorScheme();
    flush();
    expect(text()).toBe('dark dark');
    expect(attribute()).toBe('dark');
    expect(localStorage.getItem('slp-color-scheme')).toBeNull();
  });

  test('a fixed preference ignores the OS', () => {
    const { scheme, text } = setup();
    scheme.setColorScheme('light');
    setOsDark(true);
    flush();
    expect(text()).toBe('light light');
  });

  test('follows a change made in another tab', () => {
    const { text } = setup();
    localStorage.setItem('slp-color-scheme', 'dark');
    window.dispatchEvent(new StorageEvent('storage', { key: 'slp-color-scheme' }));
    flush();
    expect(text()).toBe('dark dark');
    expect(attribute()).toBe('dark');
  });

  test('colorSchemeStorageKey changes the key', () => {
    localStorage.setItem('my-scheme', 'dark');
    const { scheme, text } = setup({ colorSchemeStorageKey: 'my-scheme' });
    expect(text()).toBe('dark dark');

    scheme.setColorScheme('light');
    expect(localStorage.getItem('my-scheme')).toBe('light');
    expect(localStorage.getItem('slp-color-scheme')).toBeNull();
  });

  test('stops listening when the provider unmounts', () => {
    const { unmount } = setup();
    expect(mediaListeners.size).toBe(1);
    unmount();
    expect(mediaListeners.size).toBe(0);
  });

  test('throws outside <SlopkitUi>', () => {
    const Orphan = () => {
      useColorScheme();
      return null;
    };
    expect(() => render(() => <Orphan />)).toThrow('useColorScheme() must be called inside <SlopkitUi>.');
  });
});

describe('useColorScheme() with SSR', () => {
  test('hydrates cleanly with no stored preference', async () => {
    await expectHydration('./color-scheme.fixtures.tsx', 'probe');
  });

  test('hydrates with the default, then catches up with the stored preference', async () => {
    localStorage.setItem('slp-color-scheme', 'dark');
    const result = await renderAndHydrate('./color-scheme.fixtures.tsx', 'probe');
    try {
      expect(result.html).toContain('auto light');
      expect(result.clientMessages).toEqual([]);
      expect(result.replaced).toEqual([]);
      expect(result.container.textContent).toBe('dark dark');
    } finally {
      result.dispose();
    }
  });
});

describe('the color scheme head script', () => {
  const run = (defaultPreference: 'light' | 'dark' | 'auto' = 'auto') =>
    new Function(colorSchemeScript('slp-color-scheme', defaultPreference))();

  test('applies the stored preference', () => {
    localStorage.setItem('slp-color-scheme', 'dark');
    run();
    expect(attribute()).toBe('dark');

    localStorage.setItem('slp-color-scheme', 'auto');
    run('light');
    expect(attribute()).toBeNull();
  });

  test('falls back to the default without a valid stored preference', () => {
    run('light');
    expect(attribute()).toBe('light');

    localStorage.setItem('slp-color-scheme', '"><script>');
    run('auto');
    expect(attribute()).toBeNull();
  });

  test('quotes the key, so it cannot break out of the string', () => {
    expect(() => new Function(colorSchemeScript(`k'");alert(1)//`, 'auto'))()).not.toThrow();
  });
});
