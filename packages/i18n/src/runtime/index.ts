export { I18nProvider, type I18nProviderProps } from './provider';
export { I18nContext, type I18nContextValue } from './context';
export { matchLocale } from './locale';
export { preloadTranslations, useTranslations } from './translations';
// Used by the code the Vite plugin generates for a translation file; not for hand-written code.
export { defineTranslations } from './translations';
export type { LocaleData, LocaleSource, Shape, TranslationsDefinition } from './translations';
