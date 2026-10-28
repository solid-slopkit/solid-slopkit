# The provider reads the i18n locale; `@solid-slopkit/i18n` is a peer

`@solid-slopkit/i18n` is a required peer dependency of `@solid-slopkit/components`. `<SlopkitUi>` reads the active locale of the nearest `<I18nProvider>`, so an app that uses both sets its locale once, on the i18n provider. The order is: the `locale` prop, then the nearest `<I18nProvider>`'s active locale, then the enclosing `<SlopkitUi>`'s, then `en-US`. Without an `<I18nProvider>` nothing changes.

Before, the app passed the same locale to both providers. ADR 0016 allows the dependency; i18n still does not know the components.

## Considered Options

- **Keep passing the locale to both providers:** rejected. Every app that uses both packages wires the same signal twice, and a forgotten prop formats dates in one locale and text in another.
- **An optional peer:** rejected. The main entry would import it, and ADR 0002 allows optional peers only behind a subpath that the main entry never imports. A subpath bridge component would bring back the wiring this removes.
- **i18n reads the components' locale:** rejected. i18n is headless and must not need the component library.

## Consequences

- Every app installs `@solid-slopkit/i18n`, even one that never renders an `<I18nProvider>`. Only its runtime is imported, and the import is tree-shaken down to the context.
- A change to `I18nContext` in i18n can break the provider. The components tests render a real `<I18nProvider>` to catch it.
- An i18n locale must be a valid BCP 47 tag, since `Intl` formats with it. An invalid one throws the provider's `RangeError`.
