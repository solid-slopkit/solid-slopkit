# Translation files

A file named `*.i18n.jsonc` holds the messages of every locale for one component. Import it like a module; the import is the live, typed messages of the active locale.

```jsonc
{
  // One file holds every locale of this component. The first locale in the plugin options is the default
  // and defines the keys; the others may lag behind and fall back to it.
  "en": {
    "title": "Users",
    "empty": "Nobody has joined yet.",
    "add": "Invite someone",
  },
  "de": {
    "title": "Benutzer",
    "empty": "Noch ist niemand beigetreten.",
    "add": "Jemanden einladen",
  },
  "uk": {
    "title": "Користувачі",
    "empty": "Ще ніхто не приєднався.",
    "add": "Запросити когось",
  },
}
```

```tsx
import { I18nProvider } from '@solid-slopkit/i18n';
import { Button, Paper, Stack, Text, Title } from '@solid-slopkit/components';
import { LocaleSwitch } from './LocaleSwitch';
import translations from './users.i18n.jsonc';

// The file next to this one is imported like any module. `translations.title` is the message in the
// active locale, typed from the file; it follows the locale of the provider above.
function UsersList() {
  return (
    <Paper withBorder>
      <Stack gap={1} align="flex-start">
        <Title order={4}>{translations.title}</Title>
        <Text size="sm">{translations.empty}</Text>
        <Button variant="outline" size="xs">
          {translations.add}
        </Button>
      </Stack>
    </Paper>
  );
}

export default function UsageDemo() {
  return (
    <I18nProvider initialLocale="en">
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <LocaleSwitch />
        <UsersList />
      </Stack>
    </I18nProvider>
  );
}
```

`translations.title` is a `string` typed from the default locale. A wrong key is a type error. The text follows the locale of the nearest `I18nProvider`.

## The default locale

- `defaultLocale` (plugin option) defines the keys of every file and is the fallback for missing messages.
- A message missing from another locale shows the default text, with one warning per message in development. Arguments are still formatted for the active locale.
- A key that exists only in a non-default locale, a locale not in `locales`, and a message that does not parse are build errors that name the file and the key.
- `strict: true` turns missing messages into errors too. Use it in CI.
- A locale a file does not contain at all shows the file's default locale.

## Shared strings

There is no separate kind of "global" translation. A file of shared strings is an ordinary translation file that several components import, beside each component's own file. Each file is loaded once, however many components read it.

```jsonc
{
  // Shared strings are an ordinary translation file that several components import.
  "en": { "save": "Save", "cancel": "Cancel" },
  "de": { "save": "Speichern", "cancel": "Abbrechen" },
  "uk": { "save": "Зберегти", "cancel": "Скасувати" },
}
```

```jsonc
{
  "en": { "title": "Profile", "name": "Display name" },
  "de": { "title": "Profil", "name": "Anzeigename" },
  "uk": { "title": "Профіль", "name": "Ім’я для показу" },
}
```

```tsx
import { I18nProvider } from '@solid-slopkit/i18n';
import { Button, Group, Paper, Stack, TextInput, Title } from '@solid-slopkit/components';
import common from './common.i18n.jsonc';
import { LocaleSwitch } from './LocaleSwitch';
import profile from './profile.i18n.jsonc';

// `common` is imported by this component and by the next one; each file is loaded once.
function ProfileForm() {
  return (
    <Paper withBorder>
      <Stack gap={2}>
        <Title order={4}>{profile.title}</Title>
        <TextInput label={profile.name} />
        <ConfirmBar />
      </Stack>
    </Paper>
  );
}

function ConfirmBar() {
  return (
    <Group gap={1}>
      <Button size="xs" variant="outline">
        {common.save}
      </Button>
      <Button size="xs" variant="outline">
        {common.cancel}
      </Button>
    </Group>
  );
}

export default function SharedDemo() {
  return (
    <I18nProvider initialLocale="de">
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <LocaleSwitch />
        <ProfileForm />
      </Stack>
    </I18nProvider>
  );
}
```

## Notes

- Comments (`//`, `/* */`) and trailing commas are allowed.
- Do not read a message into a variable outside JSX or a memo: components run once, so the value would not follow the locale.
- Editing the messages of a file hot-updates in place in dev; adding or removing a key reloads the page.
