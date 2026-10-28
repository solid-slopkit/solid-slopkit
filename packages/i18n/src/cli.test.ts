import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { run } from './cli';

const plugin = fileURLToPath(new URL('./vite.ts', import.meta.url));
let root: string;
const write = (path: string, content: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
};
const cli = async (...args: string[]) => {
  const out: string[] = [];
  const err: string[] = [];
  const code = await run(args, root, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join('\n'), err: err.join('\n') };
};
const types = () => join(root, 'node_modules/.slopkit-i18n/types/src/users.i18n.d.jsonc.ts');

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'slopkit-i18n-cli-'));
  write('package.json', '{ "type": "module" }');
  write(
    'vite.config.mjs',
    `import { slopkitI18n } from ${JSON.stringify(plugin)};
export default { plugins: [false, [slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en' })]] };`,
  );
  write('src/users.i18n.jsonc', '{ "en": { "title": "Users" }, "de": { "title": "Benutzer" } }');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

test('typegen writes the types of every translation file, with the options from the Vite config', async () => {
  const { code, out } = await cli('typegen');
  expect(code).toBe(0);
  expect(out).toContain('1 translation file(s), 1 type file(s) written');
  expect(readFileSync(types(), 'utf8')).toContain('readonly title: string;');
});

test('a second run writes nothing', async () => {
  await cli('typegen');
  expect((await cli('typegen')).out).toContain('0 type file(s) written');
});

test('translation errors give exit code 1 and are named; warnings do not', async () => {
  write('src/users.i18n.jsonc', '{ "en": { "title": 1 } }');
  const failed = await cli('typegen');
  expect(failed.code).toBe(1);
  expect(failed.err).toMatch(/error: src\/users\.i18n\.jsonc: en\.title/);
  expect(existsSync(types())).toBe(false);

  write('src/users.i18n.jsonc', '{ "en": { "title": "T", "more": "M" }, "de": { "title": "T" } }');
  const warned = await cli('typegen');
  expect(warned.code).toBe(0);
  expect(warned.out).toMatch(/warning: src\/users\.i18n\.jsonc: de\.more/);
});

test('--root and --config', async () => {
  write('app/vite.custom.mjs', `export { default } from '../vite.config.mjs';`);
  write('app/src/other.i18n.jsonc', '{ "en": { "a": "x" } }');
  const { code, out } = await cli('typegen', '--root', 'app', '--config', 'app/vite.custom.mjs');
  expect(code).toBe(0);
  expect(out).toContain('1 translation file(s)');
});

test('usage errors give exit code 2', async () => {
  expect((await cli()).code).toBe(2);
  expect((await cli('--help')).code).toBe(0);
  expect((await cli('nope')).err).toMatch(/unknown command "nope"/);
  expect((await cli('typegen', '--bad', 'x')).code).toBe(2);
  rmSync(join(root, 'vite.config.mjs'));
  expect((await cli('typegen')).err).toMatch(/no Vite config found/);
  write('vite.config.mjs', 'export default { plugins: [] };');
  expect((await cli('typegen')).err).toMatch(/does not use the slopkitI18n\(\) plugin/);
});
