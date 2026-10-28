import { join, relative } from 'node:path';

export const TYPES_DIR = 'node_modules/.slopkit-i18n/types';

/**
 * Where the declaration file of a translation file goes: the source's path relative to the project
 * root, mirrored under `node_modules/.slopkit-i18n/types`, with the extension turned into
 * `.d<ext>.ts` (`users.i18n.jsonc` → `users.i18n.d.jsonc.ts`). TypeScript finds it through
 * `rootDirs` and `allowArbitraryExtensions`.
 */
export function typesFileFor(root: string, file: string, suffix: string): string {
  const extension = suffix.slice(suffix.lastIndexOf('.'));
  const source = relative(root, file);
  return join(root, TYPES_DIR, `${source.slice(0, -extension.length)}.d${extension}.ts`);
}
