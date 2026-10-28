import { createMemo, createSignal, onSettled, type Accessor } from 'solid-js';
import type { HeadTag } from '@solidjs/web';

/** The user's choice: a fixed scheme, or `auto` to follow the OS. */
export type ColorSchemePreference = 'light' | 'dark' | 'auto';
/** The scheme a preference resolves to. */
export type ColorScheme = 'light' | 'dark';

export interface ColorSchemeOptions {
  /** The preference when nothing is stored. Defaults to `auto`. */
  defaultColorScheme?: ColorSchemePreference;
  /** The localStorage key the preference is stored under. Defaults to `slp-color-scheme`. */
  colorSchemeStorageKey?: string;
}

export interface UseColorScheme {
  /** The stored preference, or the default when nothing is stored. */
  colorScheme: Accessor<ColorSchemePreference>;
  /** The scheme the preference resolves to: for `auto`, the OS's, updated when the OS switches. */
  resolvedColorScheme: Accessor<ColorScheme>;
  /** Stores a preference and applies it. */
  setColorScheme(preference: ColorSchemePreference): void;
  /** Stores and applies the opposite of the resolved scheme. */
  toggleColorScheme(): void;
  /** Forgets the stored preference and goes back to the default. */
  clearColorScheme(): void;
}

const ATTRIBUTE = 'data-slp-color-scheme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const isPreference = (value: unknown): value is ColorSchemePreference =>
  value === 'light' || value === 'dark' || value === 'auto';

/**
 * The script that applies a stored preference before first paint, so a saved choice never flashes the
 * default. It does what `apply` below does, in plain ES5 for a <head>.
 */
export function colorSchemeScript(key: string, defaultPreference: ColorSchemePreference): string {
  return (
    `try{var p=localStorage.getItem(${JSON.stringify(key)});` +
    `if(p!=='light'&&p!=='dark'&&p!=='auto')p=${JSON.stringify(defaultPreference)};` +
    `var r=document.documentElement;` +
    `if(p==='auto')r.removeAttribute('${ATTRIBUTE}');else r.setAttribute('${ATTRIBUTE}',p)}catch(e){}`
  );
}

function readStored(key: string): ColorSchemePreference | undefined {
  try {
    const value = localStorage.getItem(key);
    return isPreference(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function writeStored(key: string, preference: ColorSchemePreference | undefined) {
  try {
    if (preference === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, preference);
  } catch {
    // Storage blocked: the preference still applies to this page.
  }
}

// `auto` leaves the scheme to slopkit.base (`color-scheme: light dark`), a fixed preference forces it.
function apply(preference: ColorSchemePreference) {
  const root = document.documentElement;
  if (preference === 'auto') root.removeAttribute(ATTRIBUTE);
  else root.setAttribute(ATTRIBUTE, preference);
}

/**
 * The provider's color scheme state. The server can't read the stored preference, so both the server and the
 * hydrating client start from the default; the head script has already applied the stored one to the page,
 * and the state catches up once hydration settles.
 */
export function createColorScheme(options: ColorSchemeOptions): { api: UseColorScheme; headTag: () => HeadTag } {
  const key = options.colorSchemeStorageKey ?? 'slp-color-scheme';
  const defaultPreference = options.defaultColorScheme ?? 'auto';

  const [preference, setPreference] = createSignal<ColorSchemePreference>(defaultPreference, {
    name: 'SlopkitUi.colorScheme',
  });
  // The server assumes light for `auto`, like a browser with no preference.
  const [osDark, setOsDark] = createSignal(false, { name: 'SlopkitUi.osDark' });
  const resolved = createMemo<ColorScheme>(
    () => {
      const value = preference();
      return value === 'auto' ? (osDark() ? 'dark' : 'light') : value;
    },
    { name: 'SlopkitUi.resolvedColorScheme' },
  );

  const update = (value: ColorSchemePreference, stored: ColorSchemePreference | undefined) => {
    writeStored(key, stored);
    apply(value);
    setPreference(value);
  };

  onSettled(() => {
    // Every browser has matchMedia; jsdom doesn't.
    const media = typeof matchMedia === 'function' ? matchMedia(DARK_QUERY) : undefined;
    const onMediaChange = () => setOsDark(media?.matches ?? false);
    onMediaChange();
    media?.addEventListener('change', onMediaChange);

    const fromStorage = () => {
      const value = readStored(key) ?? defaultPreference;
      apply(value);
      setPreference(value);
    };
    fromStorage();
    // Another tab changed the preference.
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) fromStorage();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      media?.removeEventListener('change', onMediaChange);
      window.removeEventListener('storage', onStorage);
    };
  });

  return {
    api: {
      colorScheme: preference,
      resolvedColorScheme: resolved,
      setColorScheme: (value) => update(value, value),
      toggleColorScheme: () => {
        const next = resolved() === 'dark' ? 'light' : 'dark';
        update(next, next);
      },
      clearColorScheme: () => update(defaultPreference, undefined),
    },
    headTag: () => ({
      tag: 'script',
      key: 'slopkit-ui-color-scheme',
      props: { children: colorSchemeScript(key, defaultPreference) },
    }),
  };
}
