export interface I18nOptions {
  /** Every locale a translation file may contain. */
  locales: readonly string[];
  /** Defines the shape of the messages and is the fallback for missing ones. Must be in `locales`. */
  defaultLocale: string;
  /** Translation file suffix; must start with `.` and must not end in `.json` (TypeScript types a real `.json` import itself). */
  suffix?: string;
  /** Report a message missing from a non-default locale as an error instead of a warning. */
  strict?: boolean;
  /**
   * `async` (default): each locale is its own chunk, loaded when it becomes active. `inline`: every locale is in the
   * module, so nothing is ever pending. The server always inlines.
   */
  mode?: 'async' | 'inline';
}

export interface ResolvedI18nOptions {
  readonly locales: readonly string[];
  readonly defaultLocale: string;
  readonly suffix: string;
  readonly strict: boolean;
  readonly mode: 'async' | 'inline';
}

export const DEFAULT_SUFFIX = '.i18n.jsonc';

export function resolveOptions(options: I18nOptions): ResolvedI18nOptions {
  const suffix = options.suffix ?? DEFAULT_SUFFIX;
  if (!suffix.startsWith('.') || suffix.length < 2) {
    throw new Error(`@solid-slopkit/i18n: suffix "${suffix}" must start with "." (e.g. "${DEFAULT_SUFFIX}")`);
  }
  if (suffix.toLowerCase().endsWith('.json')) {
    throw new Error(
      `@solid-slopkit/i18n: suffix "${suffix}" must not end in ".json": TypeScript types a real .json import from the file itself, so the generated types would be ignored. Use e.g. "${DEFAULT_SUFFIX}".`,
    );
  }
  if (options.locales.length === 0) throw new Error('@solid-slopkit/i18n: `locales` must not be empty');
  if (new Set(options.locales).size !== options.locales.length) {
    throw new Error('@solid-slopkit/i18n: `locales` must not contain duplicates');
  }
  if (!options.locales.includes(options.defaultLocale)) {
    throw new Error(
      `@solid-slopkit/i18n: defaultLocale "${options.defaultLocale}" is not in locales [${options.locales.join(', ')}]`,
    );
  }
  return {
    locales: options.locales,
    defaultLocale: options.defaultLocale,
    suffix,
    strict: options.strict ?? false,
    mode: options.mode ?? 'async',
  };
}
