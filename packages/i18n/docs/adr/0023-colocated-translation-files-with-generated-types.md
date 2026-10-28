# Co-located translation files with plugin-generated types

Every component keeps its translations next to its source, the way CSS modules keep styles: `users-list.i18n.jsonc` is imported as `import translations from './users-list.i18n.jsonc'`, and `translations.title` is the typed Message for the Active locale. A Vite plugin (`@solid-slopkit/i18n/vite`) compiles the files and generates their types. One big shared dictionary is the failure mode this avoids. The package is headless and doesn't depend on `@solid-slopkit/components` (ADR 0016).

## Decisions

- **One file holds every locale:** `{ "en": { … }, "de": { … } }`. Messages may nest; leaves are strings. The plugin splits a file into per-locale chunks so only the Active locale loads. The `inline` mode keeps every locale in the module, so nothing is ever pending.
- **The suffix is `.i18n.jsonc`** (configurable, but it can't end in `.json`). TypeScript always types a real `.json` import from the file itself, so a generated type can't override it; any other extension can be typed from generated files. The plugin writes them to `node_modules/.slopkit-i18n/types/`, mirroring the source path, and the app's `tsconfig.json` adds `allowArbitraryExtensions: true` and a `rootDirs` entry once. No generated file appears in the source tree. `.jsonc` also lets translators leave comments, and editors already highlight it.
- **A shared translation file is an ordinary one**, imported from several places. There is no provider-level `messages` prop and no second typing path.
- **The Default locale defines the shape** (`defaultLocale`; `locales` lists the allowed ones). A key missing from another locale falls back to the default's text with a dev warning and a build warning; `strict: true` makes it an error. A key present only in a non-default locale is always an error.
- **Messages are a small ICU-style subset on `Intl`, parsed at build time:** `{name}`, `plural`, `select`, `number`, `date`. A Message without parameters is a `string`; one with parameters is a typed function. A malformed Message fails the build. The formatter sits behind an internal interface, so a full ICU implementation could be plugged in later.
- **Loading is async by default.** `I18nProvider` renders a root `<Loading fallback>`. A locale switch is a transition, so the old text stays until the new locale has loaded. Preloading is a function, `preloadTranslations(locale, ...translations)`, called before mounting.
- **`I18nProvider` is controlled or uncontrolled:** `locale` or `initialLocale`, with `onChange(locale)`. The locale is read with `useContext(I18nContext)`, which gives `{ locale(), setLocale(l) }`; there is no wrapper hook around `useContext`. Detecting and storing the user's locale stays in the app; the package ships only `matchLocale(requested, supported)`.
- **Vite only.** The compiler is bundler-neutral inside, but only the Vite plugin is exported. Vitest reuses it.

## Considered Options

- **One file per locale** (`x.en.i18n.json`): per-locale ownership, but a translator can't see every language of a key together, and the type source has to be one chosen locale.
- **A wrapper, `translations(messages)`, over a plain JSON import:** needs no generated types, but adds a line per component, and the import is no longer the live object.
- **Generated `.d.ts` files next to the source:** works with `.json`, but leaves generated files in the tree.
- **A bare `.i18n` extension:** works, but editors, formatters and translation platforms don't know it, so every user would configure each tool.
- **A plugin for every bundler, or a standalone CLI only:** a dependency and less control over Vite's chunking and hot updates for the former; a generate step the user must remember for the latter.

## Consequences

- The app adds two `tsconfig` options once, and the docs say so.
- Tools that expect `.json` translations (external translation platforms) must be told to read `.jsonc`.
- Hydration needs the initial locale's chunk before the client hydrates. The plugin doesn't know the locale, so a server-rendered app calls `await preloadTranslations(locale, ...)` before `hydrate()`.
- In dev, a change to a file's Messages is applied in place (importers keep their binding), and a change to its keys reloads the page.
- `tsc` needs the generated types, which the plugin writes when Vite starts. A CI job that type-checks before any Vite run calls `slopkit-i18n typegen` first; it reads the plugin's options from the Vite config.
