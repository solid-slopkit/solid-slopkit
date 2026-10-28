# Locale

## The provider and the context

```tsx
// Uncontrolled: the provider owns the locale, starting from initialLocale.
<I18nProvider initialLocale="en" onChange={(locale) => save(locale)}>

// Controlled: you own it, the provider shows it.
<I18nProvider locale={locale()} onChange={setLocale}>
```

```ts
const i18n = useContext(I18nContext);
i18n.locale(); // "en", tracked
i18n.setLocale('de');
```

`onChange` receives the locale, never an event. With a controlled `locale`, `setLocale` only reports through `onChange` and the provider changes when the prop does. Nested providers override the locale for their subtree. Reading `I18nContext` outside a provider throws. There is no `useI18n` wrapper.

A language switcher is a few lines:

```tsx
import { useContext } from 'solid-js';
import { SegmentedControl } from '@solid-slopkit/components';
import { I18nContext } from '@solid-slopkit/i18n';

/** The demos' language switcher: reads and sets the locale of the nearest I18nProvider. */
export function LocaleSwitch() {
  const i18n = useContext(I18nContext);
  return (
    <SegmentedControl aria-label="Language" size="xs" data={['en', 'de', 'uk']} value={i18n.locale()} onChange={i18n.setLocale} />
  );
}
```

The package does not detect or remember the locale. Reading a cookie, the `Accept-Language` header or `navigator.languages`, and saving the choice, are decisions for the app, which passes the result in.

## matchLocale

`matchLocale(requested, supported)` picks the best of your locales for what the user asked for. `requested` is one tag or a list in order of preference, such as `navigator.languages`; matching ignores case and returns the spelling from `supported`.

```ts
import { matchLocale } from '@solid-slopkit/i18n';

matchLocale('de-AT', ['en', 'de']); // "de"
matchLocale('pt', ['en', 'pt-BR']); // "pt-BR"
matchLocale(['fr-CA', 'de-CH', 'en'], ['en', 'de']); // "de"
matchLocale('ja', ['en', 'de']); // undefined
```

## Reading outside rendering

A message finds the locale from the reactive owner it is read from. During rendering, in a memo or in an effect that is the right provider. An event handler, a timer or a promise callback has no owner, so there:

- on the client the message uses the provider that mounted last, correct unless one page mounts two providers with different locales;
- on the server it throws, because the server cannot know which request it is serving.

`useTranslations(translations)` returns the same messages bound to the provider above the calling component, so reads are correct everywhere. Call it while the component is being set up.

```jsonc
{
  "en": { "save": "Save draft", "saved": "Saved {count, plural, one {# change} other {# changes}}." },
  "de": { "save": "Entwurf speichern", "saved": "{count, plural, one {# Änderung} other {# Änderungen}} gespeichert." },
  "uk": {
    "save": "Зберегти чернетку",
    "saved": "Збережено: {count, plural, one {# зміна} few {# зміни} many {# змін} other {# зміни}}.",
  },
}
```

```tsx
import { createSignal } from 'solid-js';
import { I18nProvider, useTranslations } from '@solid-slopkit/i18n';
import { Button, Stack, Text } from '@solid-slopkit/components';
import { LocaleSwitch } from './LocaleSwitch';
import translations from './handler.i18n.jsonc';

// Reading a message while rendering follows the locale automatically. In an event handler there is no
// reactive owner to ask, so a plain `translations.saved(...)` uses the provider that mounted last.
// `useTranslations` binds the messages to this component's own provider instead, which is also correct
// when one page has several providers with different locales.
function Draft() {
  const t = useTranslations(translations);
  const [status, setStatus] = createSignal('');
  let count = 0;
  return (
    <Stack gap={1} align="flex-start">
      <Button size="xs" variant="outline" onClick={() => setStatus(t.saved({ count: ++count }))}>
        {translations.save}
      </Button>
      <Text size="sm" role="status">
        {status()}
      </Text>
    </Stack>
  );
}

export default function HandlerDemo() {
  return (
    <I18nProvider initialLocale="uk">
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <LocaleSwitch />
        <Draft />
      </Stack>
    </I18nProvider>
  );
}
```
