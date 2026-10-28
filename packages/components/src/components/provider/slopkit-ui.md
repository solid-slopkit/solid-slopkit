# SlopkitUi

The provider. Required at the root of every app. It holds per-tree state: the CSS that components generate at runtime, the locale, the color scheme preference, the order of open overlays, the notifications, and the modals opened from code.

```tsx
import { SlopkitUi, useColorScheme, useLocale, useModals, useNotifications } from '@solid-slopkit/components';
```

## Usage

```tsx
import '@solid-slopkit/components/styles/slopkit.css';
import '@solid-slopkit/components/styles/default-theme.css';

export default function App() {
  return (
    <SlopkitUi locale="de-DE">
      <Router />
    </SlopkitUi>
  );
}
```

- Components that generate CSS (such as Box) register it with the nearest provider, which renders it in one `<style>` in the head. They throw `<Name> must be rendered inside <SlopkitUi>.` without one.
- On the server each request renders its own provider, so no state leaks between requests.
- Providers can nest. A nested provider inherits the locale unless it sets its own or an `<I18nProvider>` sits between them.
- Overlays (popovers, menus, modals) join the provider's order when they open. Escape closes only the topmost one, and a press outside closes, from the top down, each overlay it's outside of. A nested provider shares its root's order, so overlays in it nest correctly with those outside it.
- Notifications are kept here: `useNotifications()` shows them, a `<Notifications>` region renders them, and the `notifications` facade reaches the most recently mounted root provider. A nested provider shares its root's. See [Notifications](../feedback/notifications/notifications.md).
- Modals opened from code are kept here the same way: `useModals()` and the `modals` facade open them, a `<Modals>` host shows them. See [Modals](../overlays/modals/modals.md).
- Head tags are added with `useHead` from `@solidjs/web`.

## Props

| Prop                    | Type                          | Default               | Description                                        |
| ----------------------- | ----------------------------- | --------------------- | -------------------------------------------------- |
| `locale`                | `string`                      | see [Locale](#locale) | BCP 47 locale for `Intl` formatting.               |
| `defaultColorScheme`    | `'light' \| 'dark' \| 'auto'` | `'auto'`              | Preference used when nothing is stored. Read once. |
| `colorSchemeStorageKey` | `string`                      | `'slp-color-scheme'`  | localStorage key of the preference. Read once.     |
| `children`              | `JSX.Element`                 | —                     | The app.                                           |

## Locale

`useLocale()` returns an `Accessor<string>` with the locale of the nearest provider. Pass it to `Intl` formatters.

The provider's locale is the first of:

1. its `locale` prop;
2. the active locale of the nearest `<I18nProvider>` from `@solid-slopkit/i18n`, a peer dependency;
3. the enclosing `<SlopkitUi>`'s locale;
4. `en-US`.

An app that translates sets the locale once, on the i18n provider:

```tsx
import { I18nProvider } from '@solid-slopkit/i18n';

<I18nProvider initialLocale="de-DE">
  <SlopkitUi>
    <Router />
  </SlopkitUi>
</I18nProvider>;
```

```tsx
const locale = useLocale();
const price = () => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(9.5);
```

- Defaults to `en-US`, never the runtime's locale, so the server and the browser format the same and hydration matches.
- The tag is canonicalized: `locale="DE-de"` gives `de-DE`. An invalid tag throws a `RangeError`.
- Reactive: changing the `locale` prop or the `<I18nProvider>` locale updates `locale()`, including in nested providers that inherit it.
- The i18n locale must be a BCP 47 tag (`de-DE`, `de`). An `<I18nProvider>` with no locale yet (`''`) is skipped.
- Throws outside `<SlopkitUi>`.

## Color scheme

`useColorScheme()` returns the color scheme state of the nearest provider. Throws outside `<SlopkitUi>`.

| Member                | Type                                                | Description                                                             |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `colorScheme`         | `Accessor<'light' \| 'dark' \| 'auto'>`             | The stored preference, or the default when nothing is stored.           |
| `resolvedColorScheme` | `Accessor<'light' \| 'dark'>`                       | The scheme showing. For `auto`, the OS's, updated when the OS switches. |
| `setColorScheme`      | `(preference: 'light' \| 'dark' \| 'auto') => void` | Stores and applies a preference.                                        |
| `toggleColorScheme`   | `() => void`                                        | Stores and applies the opposite of the resolved scheme.                 |
| `clearColorScheme`    | `() => void`                                        | Removes the stored preference and goes back to the default.             |

```tsx
const scheme = useColorScheme();

<Button variant="ghost" onClick={() => scheme.toggleColorScheme()}>
  {scheme.resolvedColorScheme() === 'dark' ? 'Light mode' : 'Dark mode'}
</Button>;
```

- The preference is stored in localStorage and follows changes made in other tabs. If storage is blocked, it still applies to the current page.
- It is applied as `data-slp-color-scheme="light" | "dark"` on `<html>`. `auto` removes the attribute and leaves the scheme to the OS (`color-scheme: light dark` in the base styles).
- A script in the head applies the stored preference before first paint, so a saved choice never flashes the default.
- The server can't read localStorage. The server render and the hydrating client both start from the default (`auto` resolves to `light`), and the state catches up after hydration. UI that must be right on first paint, such as a toggle's icon, should pick its look in CSS, not from the accessors:

```css
.icon-dark {
  display: none;
}
:root[data-slp-color-scheme='dark'] .icon-dark {
  display: inline;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-slp-color-scheme]) .icon-dark {
    display: inline;
  }
}
```

- `data-slp-color-scheme="light"` or `"dark"` on any element forces that scheme for its subtree.
- Themes are separate from the color scheme: a theme is a CSS rule that sets the tokens, on `:root` for the default theme and on `[data-slp-theme="<name>"]` for any other. A theme that supports both schemes follows the preference. A single-scheme theme pins its own scheme.
