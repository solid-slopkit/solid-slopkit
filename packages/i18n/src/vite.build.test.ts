import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { build, createServer, type Rollup } from 'vite';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { slopkitI18n } from './vite';

// The plugin inside real Vite builds and a real dev server, on a throwaway project. The runtime is a stub:
// these tests are about what the plugin emits (the runtime is covered by the e2e test).
const options = { locales: ['en', 'de'], defaultLocale: 'en' };
let root: string;

const write = (path: string, content: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
};
const config = (plugin = slopkitI18n(options)) => ({
  root,
  configFile: false as const,
  logLevel: 'silent' as const,
  plugins: [plugin],
  resolve: { alias: { '@solid-slopkit/i18n': join(root, 'runtime-stub.ts') } },
});
const chunks = async (plugin = slopkitI18n(options)) => {
  const result = (await build({
    ...config(plugin),
    build: {
      write: false,
      minify: false,
      rollupOptions: { input: join(root, 'src/entry.ts') },
    },
  })) as Rollup.RollupOutput | Rollup.RollupOutput[];
  return (Array.isArray(result) ? result[0]! : result).output.filter((o): o is Rollup.OutputChunk => o.type === 'chunk');
};

beforeEach(() => {
  // realpath: Vite reports the real path, and macOS's tmpdir is behind a symlink
  root = realpathSync(mkdtempSync(join(tmpdir(), 'slopkit-i18n-build-')));
  write('runtime-stub.ts', 'export const defineTranslations = (definition: unknown) => definition;\n');
  write('src/entry.ts', `import t from './users.i18n.jsonc';\nconsole.log(t);\n`);
  write('src/users.i18n.jsonc', '{ "en": { "title": "Plain English" }, "de": { "title": "Schlichtes Deutsch" } }');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('build', () => {
  test('async: the entry holds no messages, and every locale is its own chunk', async () => {
    const output = await chunks();
    expect(output).toHaveLength(3);
    const entry = output.find((c) => c.isEntry)!;
    expect(entry.code).not.toContain('Plain English');
    expect(entry.code).not.toContain('Schlichtes Deutsch');
    expect(output.filter((c) => c.code.includes('Plain English'))).toHaveLength(1);
    expect(output.filter((c) => c.code.includes('Schlichtes Deutsch'))).toHaveLength(1);
    expect(entry.dynamicImports).toHaveLength(2);
  });

  test('inline: one chunk with every locale', async () => {
    const output = await chunks(slopkitI18n({ ...options, mode: 'inline' }));
    expect(output).toHaveLength(1);
    expect(output[0]!.code).toContain('Plain English');
    expect(output[0]!.code).toContain('Schlichtes Deutsch');
  });

  test('a translation error fails the build and names the file', async () => {
    write('src/users.i18n.jsonc', '{ "en": { "title": 1 } }');
    await expect(chunks()).rejects.toThrow(/users\.i18n\.jsonc: en\.title/);
  });

  test('messages are compiled: a plural in the output is data, not parsed at runtime', async () => {
    write('src/users.i18n.jsonc', '{ "en": { "items": "{n, plural, one {# user} other {# users}}" } }');
    const output = await chunks(slopkitI18n({ ...options, mode: 'inline' }));
    expect(output[0]!.code).toContain('"t": "plural"');
  });
});

describe('dev server', () => {
  const withServer = async (check: (server: Awaited<ReturnType<typeof createServer>>) => Promise<void>) => {
    const server = await createServer({
      ...config(),
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    try {
      await check(server);
    } finally {
      await server.close();
    }
  };

  test('the browser gets loaders and hot handling; the server gets the messages inline', async () => {
    await withServer(async (server) => {
      const client = await server.transformRequest('/src/users.i18n.jsonc');
      expect(client!.code).toContain('slopkit-i18n=de');
      expect(client!.code).toContain('import.meta.hot.accept()');
      expect(client!.code).not.toContain('Schlichtes Deutsch');

      const ssr = await server.transformRequest('/src/users.i18n.jsonc', { ssr: true });
      expect(ssr!.code).toContain('Schlichtes Deutsch');
      expect(ssr!.code).not.toContain('import.meta.hot');
    });
  });

  test('?raw gives the source of the file, not the compiled module', async () => {
    await withServer(async (server) => {
      const raw = await server.transformRequest('/src/users.i18n.jsonc?raw');
      expect(raw!.code).toContain('Plain English');
      expect(raw!.code).not.toContain('defineTranslations');
    });
  });

  test('a locale chunk is requested by query', async () => {
    await withServer(async (server) => {
      const chunk = await server.transformRequest('/src/users.i18n.jsonc?slopkit-i18n=de');
      expect(chunk!.code).toContain('Schlichtes Deutsch');
      expect(chunk!.code).not.toContain('Plain English');
    });
  });

  test('the plugin regenerates types when a translation file changes', async () => {
    await withServer(async (server) => {
      write('src/users.i18n.jsonc', '{ "en": { "title": "T", "extra": "E" }, "de": { "title": "T", "extra": "E" } }');
      server.watcher.emit('change', join(root, 'src/users.i18n.jsonc'));
      const types = readFileSync(join(root, 'node_modules/.slopkit-i18n/types/src/users.i18n.d.jsonc.ts'), 'utf8');
      expect(types).toContain('readonly extra: string;');
    });
  });
});
