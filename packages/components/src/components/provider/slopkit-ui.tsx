import { createContext, createMemo, createSignal, untrack, useContext, type Accessor } from 'solid-js';
import { isServer, useHead, type HeadTag, type JSX } from '@solidjs/web';
import { I18nContext, type I18nContextValue } from '@solid-slopkit/i18n';
import { createColorScheme, type ColorSchemeOptions, type UseColorScheme } from './color-scheme';
import { createOverlayStack, type OverlayStack } from './overlay-stack';
import {
  createNotificationStore,
  registerNotificationStore,
  type NotificationStore,
  type UseNotifications,
} from './notifications';
import { createModalStore, registerModalStore, type ModalStore, type UseModals } from './modals';

interface SlopkitUiContextValue {
  /** Adds a class's CSS to the provider's stylesheet. Registering a class that is already there is a no-op. */
  registerStyle(className: string, css: string): void;
  colorScheme: UseColorScheme;
  locale: Accessor<string>;
  /** The order of open overlays. One per tree: a nested provider shares its root's. */
  overlays: OverlayStack;
  /** The notifications. One per tree: a nested provider shares its root's. */
  notifications: NotificationStore;
  /** The modals opened through `useModals()`. One per tree: a nested provider shares its root's. */
  modals: ModalStore;
}

export interface SlopkitUiProps extends ColorSchemeOptions {
  /**
   * The BCP 47 locale components format numbers and dates with, through `Intl`. Defaults to the active locale
   * of the nearest `<I18nProvider>`, then the enclosing provider's, then `en-US`, never the runtime's: the
   * server and the browser would format differently and break hydration.
   */
  locale?: string;
  children?: JSX.Element;
}

const DEFAULT_LOCALE = 'en-US';

function canonicalLocale(locale: string): string {
  try {
    return Intl.getCanonicalLocales(locale)[0];
  } catch {
    throw new RangeError(`<SlopkitUi> got an invalid locale: "${locale}". Pass a BCP 47 tag like "de-DE".`);
  }
}

/** The nearest `<I18nProvider>`, if any. Its context throws when read with no provider above. */
function useI18n(): I18nContextValue | undefined {
  try {
    return useContext(I18nContext);
  } catch {
    return undefined;
  }
}

const SlopkitUiContext = createContext<SlopkitUiContextValue | null>(null);

/**
 * Root of a slopkit UI tree. Components that generate CSS at runtime, such as Box, register it here, and the
 * provider renders all of it in one <style>. Registered CSS stays for the provider's lifetime, so a class
 * whose last component unmounts keeps its rule. On the server, each request renders its own provider, so
 * styles never leak between requests.
 *
 * It holds the locale (`useLocale()`): the `locale` prop, else the active locale of the nearest
 * `<I18nProvider>`, else the enclosing provider's.
 *
 * It also owns the color scheme preference (`useColorScheme()`), stored in localStorage and applied as
 * `data-slp-color-scheme` on <html>, by a head script before first paint and by the hook afterwards.
 *
 * It keeps the order of open overlays, which decides which one Escape or an outside click closes, and the
 * notifications (`useNotifications()`), which a `<Notifications>` region shows, and the modals opened from code
 * (`useModals()`), which a `<Modals>` host shows.
 */
export function SlopkitUi(props: SlopkitUiProps) {
  const parent = useContext(SlopkitUiContext);
  const i18n = useI18n();
  const locale = createMemo(
    () => {
      if (props.locale !== undefined) return canonicalLocale(props.locale);
      // An uncontrolled <I18nProvider> with no initial locale reports ''.
      const active = i18n?.locale();
      if (active) return canonicalLocale(active);
      return parent?.locale() ?? DEFAULT_LOCALE;
    },
    { name: 'SlopkitUi.locale' },
  );

  // Read once: the head script and the stored preference are keyed by them.
  const colorScheme = untrack(() =>
    createColorScheme({ defaultColorScheme: props.defaultColorScheme, colorSchemeStorageKey: props.colorSchemeStorageKey }),
  );
  useHead(colorScheme.headTag());

  const styles = new Map<string, string>();
  // Client only: tells the head registry's effect that a class was added, so it re-reads the CSS. Components
  // register while rendering, which is an intentional write in an owned scope. Never written on the server,
  // where nothing re-renders and the head reads the CSS when it flushes.
  const [stylesAdded, notifyStylesAdded] = createSignal(undefined, {
    equals: false,
    ownedWrite: true,
    name: 'SlopkitUi.stylesAdded',
  });

  // Joined once per change rather than per registration. The map only grows, so its size is the cache key.
  let joined = { size: -1, css: '' };
  const css = () => {
    stylesAdded();
    if (joined.size !== styles.size) joined = { size: styles.size, css: [...styles.values()].join('') };
    return joined.css;
  };

  // `useHead` with a getter rather than <Style>: <Style> computes its body when it renders, which on the
  // server is before the components below have registered anything. The getter is read when the head
  // flushes (and tracked on the client).
  // Nothing until a component registers CSS, so apps without generated styles get no empty <style>.
  const tag = (): HeadTag[] => {
    const value = css();
    return value ? [{ tag: 'style', key: 'slopkit-ui', props: { children: value } }] : [];
  };
  useHead(tag);

  const context: SlopkitUiContextValue = {
    colorScheme: colorScheme.api,
    locale,
    overlays: parent?.overlays ?? createOverlayStack(),
    notifications: parent?.notifications ?? createNotificationStore(),
    modals: parent?.modals ?? createModalStore(),
    registerStyle(className, value) {
      if (styles.has(className)) return;
      styles.set(className, value);
      // The server flushes head tags per streamed boundary. Registering the same key again from the boundary
      // that added the class makes its flush replace the <style> with the full CSS.
      if (isServer) useHead(tag);
      else notifyStylesAdded();
    },
  };

  // The `notifications` and `modals` facades reach the most recently mounted root.
  if (!parent) {
    registerNotificationStore(context.notifications);
    registerModalStore(context.modals);
  }

  return <SlopkitUiContext value={context}>{props.children}</SlopkitUiContext>;
}

export function useSlopkitUi(component: string): SlopkitUiContextValue {
  const context = useContext(SlopkitUiContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <SlopkitUi>.`);
  return context;
}

/** The color scheme preference of the nearest <SlopkitUi>, and the scheme it resolves to. */
export function useColorScheme(): UseColorScheme {
  const context = useContext(SlopkitUiContext);
  if (!context) throw new Error('useColorScheme() must be called inside <SlopkitUi>.');
  return context.colorScheme;
}

/** The locale of the nearest <SlopkitUi>, for `Intl` formatters. */
export function useLocale(): Accessor<string> {
  const context = useContext(SlopkitUiContext);
  if (!context) throw new Error('useLocale() must be called inside <SlopkitUi>.');
  return context.locale;
}

/** Shows, changes and closes the notifications of the nearest <SlopkitUi>, which a `<Notifications>` region shows. */
export function useNotifications(): UseNotifications {
  const context = useContext(SlopkitUiContext);
  if (!context) throw new Error('useNotifications() must be called inside <SlopkitUi>.');
  const { show, update, hide, clean, notifications } = context.notifications;
  return { show, update, hide, clean, notifications };
}

/** Opens, changes and closes modals from code, through the nearest <SlopkitUi>; a `<Modals>` host shows them. */
export function useModals(): UseModals {
  const context = useContext(SlopkitUiContext);
  if (!context) throw new Error('useModals() must be called inside <SlopkitUi>.');
  const { open, openConfirm, confirm, update, close, closeAll, modals } = context.modals;
  return { open, openConfirm, confirm, update, close, closeAll, modals };
}
