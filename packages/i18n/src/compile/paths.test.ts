import { expect, test } from 'vitest';
import { typesFileFor } from './paths';

test('mirrors the source path under node_modules/.slopkit-i18n/types and turns the extension into .d<ext>.ts', () => {
  expect(typesFileFor('/app', '/app/src/ui/users.i18n.jsonc', '.i18n.jsonc')).toBe(
    '/app/node_modules/.slopkit-i18n/types/src/ui/users.i18n.d.jsonc.ts',
  );
  expect(typesFileFor('/app', '/app/src/users.i18n', '.i18n')).toBe('/app/node_modules/.slopkit-i18n/types/src/users.d.i18n.ts');
});
