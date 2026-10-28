# Setup

## The plugin

```ts
// vite.config.ts
import { slopkitI18n } from '@solid-slopkit/i18n/vite';

export default defineConfig({
  plugins: [slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en' }), solid()],
});
```

| Option          | Default         | Meaning                                                                                                                                              |
| --------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locales`       | required        | Every locale a file may contain. A file with another locale is an error.                                                                             |
| `defaultLocale` | required        | In `locales`. Defines the keys of every file and is the fallback for missing messages.                                                               |
| `suffix`        | `".i18n.jsonc"` | Translation file suffix. Must start with `.` and must not end in `.json`.                                                                            |
| `strict`        | `false`         | A message missing from a non-default locale is an error instead of a warning. Turn it on in CI.                                                      |
| `mode`          | `"async"`       | `"async"`: each locale is its own chunk, loaded when active. `"inline"`: every locale is in the module, nothing is ever pending. The server inlines. |

The plugin validates every translation file when Vite starts and when one changes; an error fails the build (and shows in the dev overlay) with the file and the key. The generated modules import `@solid-slopkit/i18n`, so install the package, not only the plugin.

## Types

The plugin writes each file's types to `node_modules/.slopkit-i18n/types`, mirroring its path from the project root. TypeScript finds them through two options, set once:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "allowArbitraryExtensions": true,
    "rootDirs": ["src", "node_modules/.slopkit-i18n/types/src"],
  },
}
```

List one pair for each source directory that holds translation files. `tsc` needs the types before it runs, and the plugin writes them only when Vite does, so on a fresh clone or in CI run `slopkit-i18n typegen && tsc --noEmit`. The command reads the plugin options from the Vite config (`--config <file>`, `--root <dir>`), prints warnings and exits 1 when a file has errors.

## Tests

Vitest runs Vite plugins, so put the plugin in the test config and components that import translation files work under test. `mode: 'inline'` there gives text at first render, without a loading state:

```ts
// vitest.config.ts
export default defineConfig({ plugins: [slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en', mode: 'inline' })] });
```

## Notes

- Translation platforms that expect `.json` must be told to read `.jsonc`, or set `suffix: '.i18n'` and map that extension to JSON in the editor and formatter.
- If the editor doesn't see new or changed types until the TypeScript server restarts, it isn't watching `node_modules/.slopkit-i18n`; see [Editors](https://github.com/solid-slopkit/solid-slopkit/blob/main/docs/using/i18n.md#2-set-it-up).
- If the Vite config imports TypeScript source files (a monorepo), run Vite and Vitest with `--configLoader runner`.
