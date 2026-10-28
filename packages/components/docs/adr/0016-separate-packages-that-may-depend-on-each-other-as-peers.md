# Separate packages that may depend on each other as peers

`@solid-slopkit/components` (components), `@solid-slopkit/signal-forms` (form state) and `@solid-slopkit/i18n` (translations) are separate packages, each in its own repository with its own version and release. They are designed to work together, and a package may depend on another one where that saves the app wiring. Such a dependency is a peer dependency, so an app installs each slopkit package once, at a version it picks.

Forms and i18n are headless: no CSS and no components of their own besides i18n's provider. Where they work with the components, they still produce values the components take as props:

- `bind()` from forms returns the props a slopkit input takes (`value`, `onChange(value)`, `error`, …).
- A translation file's messages fill a component's text props. The active locale reaches `<SlopkitUi>` from `<I18nProvider>` (ADR 0027).

## Considered Options

- **No runtime dependencies between the packages:** the earlier rule, dropped. The app had to wire packages built to fit together, such as passing the same locale to both providers.
- **Put the binding or the translations inside `@solid-slopkit/components`:** rejected. Every app would ship them, and a headless library would follow the UI package's release cadence and CSS build.
- **Subpaths of `@solid-slopkit/components`** (`/forms`, `/i18n`): rejected for the same reason.
- **Regular dependencies:** rejected. Two packages could install two copies of a third, each with its own contexts.

## Consequences

- Each package keeps its own version and release. A peer range says which versions of the other it works with.
- The dependencies must not form a cycle.
- A change in one package can break another that depends on it. The dependent's tests use the real package to catch it, as the forms tests render the real inputs.
