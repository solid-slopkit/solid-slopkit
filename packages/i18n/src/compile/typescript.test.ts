import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { generateAll } from './generate';
import { resolveOptions } from './options';

// Types generated into node_modules, outside the source tree, are what
// TypeScript uses for `import translations from './x.i18n.jsonc'`, given rootDirs and allowArbitraryExtensions.
let root: string;
const write = (path: string, content: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
};

// TypeScript 7 has no compiler API, so this runs the `tsc` command on the temporary project.
const tsc = fileURLToPath(new URL('../../node_modules/.bin/tsc', import.meta.url));
const check = (usage: string): string[] => {
  write('src/ui/use.ts', `import translations from './users.i18n.jsonc';\n${usage}\n`);
  write(
    'tsconfig.json',
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        target: 'esnext',
        module: 'esnext',
        moduleResolution: 'bundler',
        allowArbitraryExtensions: true,
        rootDirs: ['src', 'node_modules/.slopkit-i18n/types/src'],
        types: [],
      },
      files: ['src/ui/use.ts'],
    }),
  );
  const result = spawnSync(tsc, ['-p', root, '--pretty', 'false'], { encoding: 'utf8' });
  // One diagnostic per `file(line,col): error TSxxxx: message` line; a chained message continues on indented lines.
  return result.stdout
    .split(/\n(?=\S)/)
    .filter((text) => / error TS\d+: /.test(text))
    .map((text) => text.replace(/^.*? error TS\d+: /, ''));
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'slopkit-i18n-ts-'));
  write(
    'src/ui/users.i18n.jsonc',
    '{ "en": { "title": "Users", "form": { "submit": "Save" }, "greeting": "Hi {name}", "items": "{n, plural, one {# item} other {# items}}", "role": "{role, select, admin {Admin} other {User}}" }, "de": { "title": "Benutzer", "form": { "submit": "Speichern" } } }',
  );
  generateAll(root, resolveOptions({ locales: ['en', 'de'], defaultLocale: 'en' }));
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

test('the generated types type the import: messages are strings, nested like the file', () => {
  expect(check('const a: string = translations.title;\nconst b: string = translations.form.submit;')).toEqual([]);
});

test('a wrong key and a wrong type are errors', () => {
  const errors = check('translations.nope;\nconst n: number = translations.title;');
  expect(errors).toHaveLength(2);
  expect(errors[0]).toMatch(/'nope' does not exist/);
  expect(errors[1]).toMatch(/'string' is not assignable to type 'number'/);
});

test('the locales of the file are not on the type', () => {
  expect(check('translations.en;')[0]).toMatch(/'en' does not exist/);
});

test('a message with arguments is a function with a typed parameters object', () => {
  expect(
    check('const a: string = translations.greeting({ name: "Ada" });\nconst b: string = translations.items({ n: 3 });'),
  ).toEqual([]);
  expect(check('translations.items({ n: "3" });')[0]).toMatch(/'string' is not assignable to type 'number'/);
  expect(check('translations.greeting({});')[0]).toMatch(/Property 'name' is missing/);
  expect(check('translations.greeting({ name: "Ada", extra: 1 });')[0]).toMatch(/'extra' does not exist/);
});

test('a select suggests its listed branches and takes any other string, which `other` handles', () => {
  expect(check('translations.role({ role: "admin" });\ntranslations.role({ role: "guest" });')).toEqual([]);
  expect(check('translations.role({ role: 1 });')[0]).toMatch(/'number' is not assignable to type/);
});

test('a message with arguments is not a string', () => {
  expect(check('const s: string = translations.greeting;')[0]).toMatch(/is not assignable to type 'string'/);
});
