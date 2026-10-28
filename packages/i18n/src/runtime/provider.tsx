import { Loading, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { I18nContext, registerProvider, type I18nContextValue } from './context';

interface I18nProviderCommonProps {
  /** Called when `setLocale` asks for another locale. */
  onChange?: (locale: string) => void;
  /** Shown while the first locale chunk of what is rendering is still loading. */
  fallback?: JSX.Element;
  children?: JSX.Element;
}

export type I18nProviderProps = I18nProviderCommonProps &
  (
    | {
        /** Controlled: the provider shows this locale and changes only when the prop does. */ locale: string;
        initialLocale?: never;
      }
    | { /** Uncontrolled: the provider owns the locale, starting here. */ initialLocale: string; locale?: never }
  );

/**
 * Holds the active locale for everything below it and renders a root `<Loading>`, so translation files
 * whose locale chunk is not loaded yet show `fallback` instead of failing. Switching locale afterwards is a
 * transition: the old text stays until the new locale is ready.
 */
export function I18nProvider(props: I18nProviderProps): JSX.Element {
  const [own, setOwn] = createSignal(
    untrack(() => props.initialLocale),
    { name: 'I18nProvider.own' },
  );
  const locale = createMemo(() => props.locale ?? own() ?? '', { name: 'I18nProvider.locale' });
  const value: I18nContextValue = {
    locale,
    setLocale(next) {
      if (next === untrack(locale)) return;
      if (props.locale === undefined) setOwn(next);
      props.onChange?.(next);
    },
  };
  onCleanup(registerProvider(value));
  return (
    <I18nContext value={value}>
      <Loading fallback={props.fallback}>{props.children}</Loading>
    </I18nContext>
  );
}
