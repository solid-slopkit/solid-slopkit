# With slopkit components

`@solid-slopkit/components` and `@solid-slopkit/i18n` are independent. They meet through props: `SlopkitUi` takes `locale`, which components format dates and numbers with, and each component that renders built-in text (an accessible name such as "Close", an empty state) takes it as a prop with an English default. Give both the values of a translation file.

```jsonc
{
  // The built-in text of slopkit components is a prop on each component, filled from a translation file
  // like any other text.
  "en": { "close": "Close", "heading": "Notifications", "body": "You have new messages." },
  "de": { "close": "Schließen", "heading": "Benachrichtigungen", "body": "Sie haben neue Nachrichten." },
  "uk": { "close": "Закрити", "heading": "Сповіщення", "body": "У вас нові повідомлення." },
}
```

```tsx
import { createSignal, Show, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { I18nContext, I18nProvider } from '@solid-slopkit/i18n';
import { Alert, SlopkitUi, Stack } from '@solid-slopkit/components';
import { LocaleSwitch } from './LocaleSwitch';
import ui from './ui.i18n.jsonc';

// The two providers do not know each other: SlopkitUi takes the locale (for dates and numbers) as a
// prop, and this component hands it the locale of the I18nProvider above it.
function Bridge(props: { children: JSX.Element }) {
  const i18n = useContext(I18nContext);
  return <SlopkitUi locale={i18n.locale()}>{props.children}</SlopkitUi>;
}

function Inbox() {
  const [open, setOpen] = createSignal(true);
  return (
    <Show when={open()}>
      <Alert title={ui.heading} onClose={() => setOpen(false)} closeButtonLabel={ui.close}>
        {ui.body}
      </Alert>
    </Show>
  );
}

export default function SlopkitUiDemo() {
  return (
    <I18nProvider initialLocale="de">
      <Bridge>
        <Stack gap={2} style={{ 'max-width': '22rem' }}>
          <LocaleSwitch />
          <Inbox />
        </Stack>
      </Bridge>
    </I18nProvider>
  );
}
```

- Put the bridge once near the root, inside `I18nProvider`, so every slopkit component formats for the active locale.
- `SlopkitUi`'s `locale` does not have to equal the i18n locale: pass what `Intl` should format with (`"en-GB"` for an `"en"` site, for instance).
- `SlopkitUi` holds no translation dictionary. Pass translated built-in text where you render the component (`closeButtonLabel`, `nothingFoundMessage`, …); a shared translation file keeps those strings in one place. Each component's reference lists its text props.
- Translated text for common locales is not shipped; it is content, kept in your own translation files.
