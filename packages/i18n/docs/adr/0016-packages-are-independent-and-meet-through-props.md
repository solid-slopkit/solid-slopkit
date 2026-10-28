# Packages are independent and meet through props

`@solid-slopkit/i18n` (translations) and `@solid-slopkit/components` (components) are separate packages, and neither depends on the other at runtime. i18n is headless: no CSS and no components of its own besides its provider. Where it works with the components, it produces values the components already take as props: a translation file's messages fill a component's text props, and the active locale is passed to `<SlopkitUi locale>`. The two providers don't know each other.

The docs app installs `@solid-slopkit/components` from npm for its demos. Consumers of i18n install no component library.

## Considered Options

- **Put the translations inside `@solid-slopkit/components`:** rejected. The component library would have to know the i18n API, and every app would ship it.
- **A subpath of `@solid-slopkit/components`** (`/i18n`): rejected. A headless library would follow the UI package's release cadence and CSS build, which it has no use for.

## Consequences

- Each package has its own version and release (ADR 0001), and neither needs the other installed.
- Docs that show two packages together say how they are wired, since neither does it for the app.
