# @solid-slopkit/i18n

`@solid-slopkit/i18n` is internationalization for SolidJS 2.x where translations live **next to the component** that uses them, like CSS modules. A Vite plugin compiles each `*.i18n.jsonc` file into a module, so `import translations from './users.i18n.jsonc'` gives the typed messages of the active locale. It does not depend on `@solid-slopkit/components`; the two meet only through props.

Before adding translations, read the task guide at `node_modules/@solid-slopkit/i18n/skills/i18n/SKILL.md`: the rules that prevent the usual mistakes. Each link below is a reference for one area. Paths are relative to this file.

## Setup

```bash
pnpm add solid-js @solidjs/web @solid-slopkit/i18n
```

```ts
// vite.config.ts
import { slopkitI18n } from '@solid-slopkit/i18n/vite';
export default defineConfig({ plugins: [slopkitI18n({ locales: ['en', 'de'], defaultLocale: 'en' }), solid()] });
```

```jsonc
// tsconfig.json: the generated types live in node_modules/.slopkit-i18n/types, outside src
{ "compilerOptions": { "allowArbitraryExtensions": true, "rootDirs": ["src", "node_modules/.slopkit-i18n/types/src"] } }
```

```tsx
import { I18nProvider } from '@solid-slopkit/i18n';
<I18nProvider initialLocale="en">
  <App />
</I18nProvider>;
```

## API

Runtime (`@solid-slopkit/i18n`): `I18nProvider` (`locale` or `initialLocale`, `onChange(locale)`, `fallback`), `I18nContext`, `useTranslations(translations)`, `preloadTranslations(locale, ...translations)`, `matchLocale(requested, supported)`. `defineTranslations` is used by the generated modules, not by hand-written code.

Plugin (`@solid-slopkit/i18n/vite`): `slopkitI18n({ locales, defaultLocale, suffix?, strict?, mode? })`. Command: `slopkit-i18n typegen [--root <dir>] [--config <file>]`.

## References

- [Translation files](guides/translation-files.md): the file format, the default locale, shared strings.
- [Messages](guides/messages.md): arguments, plurals, select, numbers, dates, and what the build checks.
- [Locale](guides/locale.md): the provider, switching, `matchLocale`, reading outside rendering.
- [Loading and SSR](guides/loading-and-ssr.md): chunks, the loading boundary, preloading, server rendering.
- [Setup](guides/setup.md): plugin options, `tsconfig`, `typegen`, tests.
- [With slopkit components](guides/slopkit-components.md): passing the locale to `SlopkitUi` and translated text to components.
