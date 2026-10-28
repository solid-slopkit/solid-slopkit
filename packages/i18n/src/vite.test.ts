import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { slopkitI18n } from './vite';

const options = { locales: ['en', 'de'], defaultLocale: 'en' };
let root: string;
const write = (path: string, content: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
};

// The hooks are called directly; Vite's own types for `this` are not needed here.
type Hooks = {
  configResolved(config: { root: string; command: string }): void;
  buildStart(this: { error(m: string): never; warn(m: string): void }): void;
};
const plugin = (command: 'build' | 'serve') => {
  const p = slopkitI18n(options) as unknown as Hooks;
  p.configResolved({ root, command });
  return p;
};
const context = () => ({
  warn: vi.fn(),
  error: vi.fn((m: string): never => {
    throw new Error(m);
  }),
});

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'slopkit-i18n-vite-'));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

test('rejects invalid options when the plugin is created', () => {
  expect(() => slopkitI18n({ ...options, suffix: '.json' })).toThrow(/suffix/);
});

test('buildStart writes the declaration files', () => {
  write('src/a.i18n.jsonc', '{ "en": { "a": "x" } }');
  plugin('serve').buildStart.call(context());
  expect(existsSync(join(root, 'node_modules/.slopkit-i18n/types/src/a.i18n.d.jsonc.ts'))).toBe(true);
});

test('translation errors fail a build, naming the file', () => {
  write('src/a.i18n.jsonc', '{ "en": { "a": 1 } }');
  expect(() => plugin('build').buildStart.call(context())).toThrow(/src\/a\.i18n\.jsonc: en\.a:/);
});

test('in dev, errors and warnings are only logged', () => {
  write('src/a.i18n.jsonc', '{ "en": { "a": 1 } }');
  write('src/b.i18n.jsonc', '{ "en": { "a": "x" }, "de": {} }');
  const ctx = context();
  expect(() => plugin('serve').buildStart.call(ctx)).not.toThrow();
  expect(ctx.warn).toHaveBeenCalledTimes(2);
});
