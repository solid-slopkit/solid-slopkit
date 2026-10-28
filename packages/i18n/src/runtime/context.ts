import { createContext, getOwner, useContext } from 'solid-js';
import { isServer } from '@solidjs/web';

export interface I18nContextValue {
  /** The active locale. Read it in a tracking scope to follow changes. */
  locale: () => string;
  /** Switches the locale; a controlled provider reports it through `onChange` and waits for the new `locale` prop. */
  setLocale: (locale: string) => void;
}

/** Read it with `useContext(I18nContext)`; it throws outside an `I18nProvider`. */
export const I18nContext = createContext<I18nContextValue>();

/** The provider that mounted last, for reads that have no reactive owner (event handlers, timers). Client only. */
let latest: I18nContextValue | undefined;

export function registerProvider(value: I18nContextValue): () => void {
  if (isServer) return () => {};
  latest = value;
  return () => {
    if (latest === value) latest = undefined;
  };
}

/**
 * The active locale for a message read. Inside an owner (JSX, memos, effects) it comes from the
 * nearest provider and is tracked. With no owner (an event handler) the client falls back to the provider
 * that mounted last; the server has no way to know which request it is serving, so it throws.
 */
export function resolveLocale(what: string): string {
  let context: I18nContextValue | undefined;
  if (getOwner()) {
    try {
      context = useContext(I18nContext);
    } catch {
      // no provider above this owner: fall through
    }
  }
  if (!context && !isServer) context = latest;
  if (!context) {
    throw new Error(
      isServer
        ? `@solid-slopkit/i18n: "${what}" was read outside a component, memo or effect on the server, so the request's locale is unknown. Read it during rendering, or capture the messages with useTranslations().`
        : `@solid-slopkit/i18n: "${what}" was read with no I18nProvider above it. Wrap the app in <I18nProvider>.`,
    );
  }
  return context.locale();
}
