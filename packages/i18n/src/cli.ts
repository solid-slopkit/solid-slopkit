import { resolve } from 'node:path';
import { loadConfigFromFile, type Plugin, type PluginOption } from 'vite';
import { formatDiagnostic, generateAll } from './compile/generate';
import type { ResolvedI18nOptions } from './compile/options';

const USAGE = `Usage: slopkit-i18n typegen [--root <dir>] [--config <vite config>]

Writes the generated types of every translation file (node_modules/.slopkit-i18n/types), the way the
Vite plugin does when Vite starts, so that tsc can run before Vite. The plugin's options are read from
the Vite config. Exits with 1 when a translation file has errors.`;

export interface Output {
  out(line: string): void;
  err(line: string): void;
}

/** Plugins in a Vite config may be nested, falsy or promised. */
async function flatten(option: PluginOption): Promise<Plugin[]> {
  const resolved = await option;
  if (!resolved) return [];
  if (Array.isArray(resolved)) return (await Promise.all(resolved.map(flatten))).flat();
  return [resolved as Plugin];
}

/** The `slopkit-i18n` command. Returns the exit code. */
export async function run(argv: string[], cwd: string, output: Output): Promise<number> {
  const args = [...argv];
  const command = args.shift();
  if (command === undefined || command === '--help' || command === '-h') {
    output.out(USAGE);
    return command === undefined ? 2 : 0;
  }
  if (command !== 'typegen') {
    output.err(`slopkit-i18n: unknown command "${command}"\n${USAGE}`);
    return 2;
  }

  let rootArg: string | undefined;
  let configArg: string | undefined;
  while (args.length > 0) {
    const flag = args.shift()!;
    const value = args.shift();
    if ((flag !== '--root' && flag !== '--config') || value === undefined) {
      output.err(`slopkit-i18n: unexpected "${flag}"\n${USAGE}`);
      return 2;
    }
    if (flag === '--root') rootArg = value;
    else configArg = value;
  }

  const base = resolve(cwd, rootArg ?? '.');
  // The runner loader (not the native one) handles a config that imports TypeScript sources, as monorepos do.
  const loaded = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    configArg && resolve(cwd, configArg),
    base,
    undefined,
    undefined,
    'runner',
  );
  if (!loaded) {
    output.err(`slopkit-i18n: no Vite config found in ${base}`);
    return 2;
  }
  const plugins = (await Promise.all((loaded.config.plugins ?? []).map(flatten))).flat();
  const plugin = plugins.find((p) => p.name === 'slopkit-i18n');
  const options = (plugin?.api as { options?: ResolvedI18nOptions } | undefined)?.options;
  if (!options) {
    output.err(`slopkit-i18n: the Vite config (${loaded.path}) does not use the slopkitI18n() plugin`);
    return 2;
  }

  const root = resolve(base, loaded.config.root ?? '.');
  const results = generateAll(root, options);
  let errors = 0;
  for (const { file, diagnostics } of results) {
    for (const diagnostic of diagnostics) {
      const line = `${diagnostic.level}: ${formatDiagnostic(root, file, diagnostic)}`;
      if (diagnostic.level === 'error') {
        errors++;
        output.err(line);
      } else {
        output.out(line);
      }
    }
  }
  const written = results.filter((r) => r.written).length;
  output.out(`slopkit-i18n: ${results.length} translation file(s), ${written} type file(s) written`);
  return errors > 0 ? 1 : 0;
}
