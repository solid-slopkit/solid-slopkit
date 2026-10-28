import type { Plugin } from 'vite';
import { formatDiagnostic, generateAll, processFile, type FileResult } from './compile/generate';
import { LOCALE_QUERY, localeModule, translationsModule } from './compile/module';
import { resolveOptions, type I18nOptions } from './compile/options';
import { readTranslations } from './compile/read';

export type { I18nOptions } from './compile/options';

/**
 * Vite plugin for `@solid-slopkit/i18n`. It validates every translation file and keeps their generated
 * declaration files in `node_modules/.slopkit-i18n/types` up to date, on start and while the dev
 * server runs. Errors fail the build; in dev they are logged.
 */
export function slopkitI18n(options: I18nOptions): Plugin {
  const resolved = resolveOptions(options);
  let root = process.cwd();
  let command: 'build' | 'serve' = 'serve';

  const report = (results: FileResult[], log: { warn(message: string): void; error(message: string): void }) => {
    for (const { file, diagnostics } of results) {
      for (const diagnostic of diagnostics) {
        log[diagnostic.level === 'error' ? 'error' : 'warn'](`[@solid-slopkit/i18n] ${formatDiagnostic(root, file, diagnostic)}`);
      }
    }
  };

  return {
    name: 'slopkit-i18n',
    enforce: 'pre',
    // Read by `slopkit-i18n typegen` to find the options in the Vite config.
    api: { options: resolved },
    configResolved(config) {
      root = config.root;
      command = config.command;
    },
    buildStart() {
      const results = generateAll(root, resolved);
      const errors = results.flatMap((r) =>
        r.diagnostics.filter((d) => d.level === 'error').map((d) => formatDiagnostic(root, r.file, d)),
      );
      if (command === 'build' && errors.length > 0) {
        this.error(`[@solid-slopkit/i18n] ${errors.length} translation error(s):\n${errors.join('\n')}`);
      }
      report(results, { warn: (m) => this.warn(m), error: (m) => this.warn(m) });
    },
    load(id, loadOptions) {
      const [file, query = ''] = id.split('?');
      if (!file || !file.endsWith(resolved.suffix)) return;
      // `?raw`, `?url` and `?inline` ask for the file itself (the docs show sources this way), not the compiled module.
      const params = new URLSearchParams(query);
      if (params.has('raw') || params.has('url') || params.has('inline')) return;
      this.addWatchFile(file);
      const { diagnostics, defaultMessages, locales } = readTranslations(file, resolved);
      if (!defaultMessages || !locales) {
        const errors = diagnostics.filter((d) => d.level === 'error').map((d) => formatDiagnostic(root, file, d));
        this.error(`[@solid-slopkit/i18n] ${errors.join('\n')}`);
      }
      const locale = params.get(LOCALE_QUERY);
      if (locale) {
        const tree = locales.get(locale);
        if (!tree)
          this.error(
            `[@solid-slopkit/i18n] ${formatDiagnostic(root, file, { level: 'error', message: `no locale "${locale}"` })}`,
          );
        return localeModule(tree);
      }
      const server = Boolean(loadOptions?.ssr) || this.environment?.config.consumer === 'server';
      return translationsModule(locales, defaultMessages, {
        file,
        options: resolved,
        inline: server || resolved.mode === 'inline',
        hot: command === 'serve' && !server,
      });
    },
    configureServer(server) {
      const handle = (file: string) => {
        if (!file.endsWith(resolved.suffix)) return;
        const result = processFile(root, file, resolved);
        report([result], { warn: (m) => server.config.logger.warn(m), error: (m) => server.config.logger.error(m) });
      };
      server.watcher.on('add', handle).on('change', handle);
    },
  };
}
