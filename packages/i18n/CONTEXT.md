# i18n (`@solid-slopkit/i18n`)

Translations live next to the code that uses them, the way CSS modules do, and are read as plain typed objects. Decisions are in [docs/adr](./docs/adr).

## Language

**Translation file**:
A file with the `.i18n.jsonc` suffix holding the Messages of every locale for one component, or for a set of shared strings. Imported like a module; the import is the live, typed Messages for the Active locale. A shared translation file is an ordinary translation file imported from several places, not a special kind.
_Avoid_: dictionary, bundle, resource file, locale file

**Message**:
One translated string, addressed by a key in a Translation file (`translations.title`). A Message with parameters is read as a typed function (`translations.greeting({ name })`).
_Avoid_: string, label, key (the key only addresses a Message)

**Default locale**:
The locale whose Messages define the keys of every Translation file, and the fallback for a Message missing from another locale.
_Avoid_: base locale, source language

**Active locale**:
The locale the nearest `I18nProvider` holds. Every Message read resolves against it.
_Avoid_: current language, lang

**Skill**:
A task-oriented guide for coding agents (`skills/<area>/SKILL.md`), shipped in the package.
_Avoid_: guide, recipe

**LLM reference**:
Handwritten Markdown for agents next to the source, shipped in the package: one guide per topic. `llms.md` is the package's index.
_Avoid_: llms.txt (that is only the index), API docs

## Relationships

The package depends on no other `@solid-slopkit` package; it meets them through props (ADR 0016).

- **i18n → `@solid-slopkit/components`**: Messages fill a component's built-in text props, and the Active locale is passed to the components' provider for date and number formatting. The two providers don't know each other. The docs app installs the components from npm for its demos.
