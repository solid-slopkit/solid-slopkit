import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { findTranslationFiles, generateAll } from './generate';
import { resolveOptions } from './options';

const options = resolveOptions({ locales: ['en', 'de'], defaultLocale: 'en' });
let root: string;

const write = (path: string, content: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
};
const typesPath = (path: string) => join(root, 'node_modules/.slopkit-i18n/types', path);

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'slopkit-i18n-'));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('findTranslationFiles', () => {
  test('finds files by suffix, skipping node_modules, dist and dot-directories', () => {
    write('src/a.i18n.jsonc', '{}');
    write('src/deep/b.i18n.jsonc', '{}');
    write('src/c.json', '{}');
    write('node_modules/x/d.i18n.jsonc', '{}');
    write('dist/e.i18n.jsonc', '{}');
    write('.hidden/f.i18n.jsonc', '{}');
    expect(findTranslationFiles(root, '.i18n.jsonc').map((f) => f.slice(root.length))).toEqual([
      '/src/a.i18n.jsonc',
      '/src/deep/b.i18n.jsonc',
    ]);
  });
});

describe('generateAll', () => {
  test('writes the declaration file for a valid file, with comments allowed in the source', () => {
    write('src/users.i18n.jsonc', '{ // the list\n "en": { "title": "Users" }, "de": { "title": "Benutzer" } }');
    const [result] = generateAll(root, options);
    expect(result).toMatchObject({ diagnostics: [], written: true });
    expect(readFileSync(typesPath('src/users.i18n.d.jsonc.ts'), 'utf8')).toContain('readonly title: string;');
  });

  test('does not rewrite an unchanged declaration file', () => {
    write('src/users.i18n.jsonc', '{ "en": { "title": "Users" } }');
    generateAll(root, options);
    const target = typesPath('src/users.i18n.d.jsonc.ts');
    const past = new Date(2020, 0, 1);
    utimesSync(target, past, past);
    expect(generateAll(root, options)[0]!.written).toBe(false);
    expect(statSync(target).mtime).toEqual(past);
  });

  test('rewrites it when the default locale changes, but not when only another locale does', () => {
    write('src/users.i18n.jsonc', '{ "en": { "title": "Users" }, "de": { "title": "Benutzer" } }');
    generateAll(root, options);
    write('src/users.i18n.jsonc', '{ "en": { "title": "Users" }, "de": { "title": "Nutzer" } }');
    expect(generateAll(root, options)[0]!.written).toBe(false);
    write('src/users.i18n.jsonc', '{ "en": { "title": "Users", "more": "More" }, "de": { "title": "Nutzer", "more": "Mehr" } }');
    expect(generateAll(root, options)[0]!.written).toBe(true);
  });

  test('reports invalid JSON and invalid content, and writes no declaration file for them', () => {
    write('src/broken.i18n.jsonc', '{ "en": ');
    write('src/bad.i18n.jsonc', '{ "en": { "a": 1 } }');
    const [bad, broken] = generateAll(root, options);
    expect(broken!.diagnostics[0]!.message).toMatch(/^invalid JSON/);
    expect(bad!.diagnostics[0]!.message).toMatch(/not a number|not number|a number/);
    expect(existsSync(typesPath('src/broken.i18n.d.jsonc.ts'))).toBe(false);
    expect(existsSync(typesPath('src/bad.i18n.d.jsonc.ts'))).toBe(false);
  });

  test('removes declaration files whose source is gone', () => {
    write('src/a.i18n.jsonc', '{ "en": { "a": "x" } }');
    write('src/b.i18n.jsonc', '{ "en": { "b": "x" } }');
    generateAll(root, options);
    rmSync(join(root, 'src/b.i18n.jsonc'));
    generateAll(root, options);
    expect(existsSync(typesPath('src/a.i18n.d.jsonc.ts'))).toBe(true);
    expect(existsSync(typesPath('src/b.i18n.d.jsonc.ts'))).toBe(false);
  });
});
