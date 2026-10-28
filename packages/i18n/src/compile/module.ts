import { basename } from 'node:path';
import type { LocaleData, Shape } from '../message/ast';
import { parseMessage } from '../message/parse';
import type { ResolvedI18nOptions } from './options';
import type { MessageTree } from './validate';

export const LOCALE_QUERY = 'slopkit-i18n';

const toParts = (tree: MessageTree): LocaleData =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [key, typeof value === 'string' ? parseMessage(value) : toParts(value)]),
  );

const toShape = (tree: MessageTree): Shape =>
  Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, typeof value === 'string' ? 1 : toShape(value)]));

/** The code of one locale's chunk. */
export function localeModule(tree: MessageTree): string {
  return `export default ${JSON.stringify(toParts(tree))};\n`;
}

export interface ModuleContext {
  file: string;
  options: ResolvedI18nOptions;
  /** Inline every locale: the server, or `mode: 'inline'`. */
  inline: boolean;
  /** Emit the dev server's hot-update handling. */
  hot: boolean;
}

/**
 * The code a translation file compiles to: its messages for every locale, behind the runtime's
 * `defineTranslations`. Per-locale chunks are `?slopkit-i18n=<locale>` imports of the same file.
 */
export function translationsModule(
  locales: Map<string, MessageTree>,
  defaultMessages: MessageTree,
  context: ModuleContext,
): string {
  const { file, options, inline, hot } = context;
  const name = basename(file);
  const entries = [...locales]
    .map(([locale, tree]) =>
      inline
        ? `${JSON.stringify(locale)}: ${JSON.stringify(toParts(tree))}`
        : `${JSON.stringify(locale)}: () => import(${JSON.stringify(`./${name}?${LOCALE_QUERY}=${locale}`)}).then((m) => m.default)`,
    )
    .join(',\n    ');
  const definition = `{
  name: ${JSON.stringify(name)},
  defaultLocale: ${JSON.stringify(options.defaultLocale)},
  shape: ${JSON.stringify(toShape(defaultMessages))},
  locales: {
    ${entries}
  },
}`;
  const lines = [
    `import { defineTranslations } from '@solid-slopkit/i18n';`,
    hot
      ? `const translations = defineTranslations(${definition}, import.meta.hot?.data?.translations);`
      : `const translations = defineTranslations(${definition});`,
  ];
  if (hot) {
    // Messages are replaced in place, so importers keep their binding. A changed set of keys cannot be: reload.
    lines.push(
      `if (import.meta.hot?.data) {`,
      `  const previous = import.meta.hot.data.translations;`,
      `  import.meta.hot.data.translations = translations;`,
      `  import.meta.hot.accept();`,
      `  if (previous && previous !== translations) import.meta.hot.invalidate();`,
      `}`,
    );
  }
  lines.push(`export default translations;`, '');
  return lines.join('\n');
}
