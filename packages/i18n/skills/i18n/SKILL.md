---
name: slopkit-i18n
description: Translate SolidJS apps with @solid-slopkit/i18n — co-located *.i18n.jsonc translation files next to each component, typed messages with ICU arguments, plurals and selects, I18nProvider and switching the locale, loading per-locale chunks, and server rendering. Use when adding or changing user-facing text in another language, a translation file, the locale switcher, or i18n setup in Vite, tsconfig or tests.
---

# Translations with @solid-slopkit/i18n

A component's messages live next to it in `<name>.i18n.jsonc`, holding every locale. `import translations from './users.i18n.jsonc'` gives the typed messages of the active locale, and `translations.title` follows the nearest `I18nProvider`.

The setup, the API and the references for each area are linked from `node_modules/@solid-slopkit/i18n/dist/source/llms.md`.

## Rules that prevent the usual mistakes

**Solid 2.x**

- A component function runs once. Read a message **inside JSX or a memo**, never into a variable at the top of the component (`const title = translations.title` freezes the locale it had).
- Never destructure props. Read `node_modules/solid-js/CHEATSHEET.md` before writing reactive code.

**Translation files**

- The suffix is `.i18n.jsonc` (JSON with comments), one file per component, holding **every locale**: `{ "en": { "title": "Users" }, "de": { "title": "Benutzer" } }`. Messages may nest in objects; every leaf is a string. Keys cannot contain `.` or be empty; arrays, numbers and `null` are errors.
- The plugin option `defaultLocale` defines the keys. A message missing from another locale falls back to the default text (a build warning, an error with `strict: true`). A key that exists only in a non-default locale is always a build error.
- There is no "global" kind of file. Shared strings are an ordinary file (`common.i18n.jsonc`) that several components import.
- Do not name the suffix `.json`: TypeScript types a real `.json` import from the file, so the generated types would never apply.
- Never edit `node_modules/.slopkit-i18n/types`: it is generated. `slopkit-i18n typegen` writes it before `tsc`.

**Messages**

- A message without arguments is a `string`. One with arguments is a function of **one typed object**: `translations.items({ n: 3 })`. Call it, do not template it into a string.
- Syntax is a small ICU subset: `{name}`, `{n, number}`, `{d, date, long}`, `{n, plural, one {# item} other {# items}}`, `{x, select, a {…} other {…}}`. Every plural and select needs an `other` branch. Plural offsets, ordinals, currency and tags are not supported.

**Reading and the locale**

- The active locale belongs to the nearest `I18nProvider`. Read and set it with `useContext(I18nContext)` (`locale()`, `setLocale(l)`); there is no `useI18n`.
- A message read during rendering, in a memo or an effect follows the provider above it. In an **event handler, timer or promise callback** there is no owner: the client uses the provider mounted last, and the **server throws**. Use `useTranslations(translations)` in the component setup to bind to the right provider everywhere.
- The package does not detect or persist the locale. The app decides and passes it to the provider.

**Loading**

- By default each locale is its own chunk and `I18nProvider` renders a `<Loading>` (its `fallback` prop). A locale switch keeps the old text until the new one is ready. The server always inlines every locale.
- Before `hydrate()` on a server-rendered app, `await preloadTranslations(locale, ...files)`.
