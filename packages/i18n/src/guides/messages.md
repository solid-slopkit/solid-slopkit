# Messages

A message is a string. Most are plain text, and then `translations.title` is that string. A message with arguments becomes a function of one object, and its type comes from the message: the build reads every message of every locale.

| In a message                         | Argument type                           | Result                                                                                                                |
| ------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `{name}`                             | `string \| number`                      | The value as it is; a number is not formatted.                                                                        |
| `{n, number}`                        | `number`                                | Formatted for the locale. Styles: `integer`, `percent`.                                                               |
| `{d, date}`                          | `Date \| number`                        | Formatted for the locale. Styles: `short`, `medium` (default), `long`, `full`. A number is a timestamp.               |
| `{n, plural, one {…} other {…}}`     | `number`                                | The branch for the locale's plural category (`zero one two few many other`); `=0` matches exactly, `#` is the number. |
| `{x, select, a {…} b {…} other {…}}` | the listed names, or any other `string` | The branch named `x`, else `other`.                                                                                   |

Branches may contain arguments and further plurals or selects. In a plural, `#` is the number, also inside a select within it. Quote a literal brace with apostrophes (`'{'`); `''` is an apostrophe; a lone `'` is itself.

```jsonc
{
  "en": {
    "users": "{count, plural, =0 {No users} one {# user} other {# users}}",
    "role": "{role, select, admin {You can manage everything.} other {You can edit pages.}}",
    "price": "Total: {amount, number}",
    "share": "{ratio, number, percent} of the quota used",
    "joined": "Joined on {date, date, long}",
  },
  "de": {
    "users": "{count, plural, =0 {Keine Benutzer} one {# Benutzer} other {# Benutzer}}",
    "role": "{role, select, admin {Sie können alles verwalten.} other {Sie können Seiten bearbeiten.}}",
    "price": "Summe: {amount, number}",
    "share": "{ratio, number, percent} des Kontingents verbraucht",
    "joined": "Beigetreten am {date, date, long}",
  },
  "uk": {
    // Ukrainian has four plural categories: one, few, many and other.
    "users": "{count, plural, =0 {Немає користувачів} one {# користувач} few {# користувачі} many {# користувачів} other {# користувача}}",
    "role": "{role, select, admin {Ви можете керувати всім.} other {Ви можете редагувати сторінки.}}",
    "price": "Разом: {amount, number}",
    "share": "Використано {ratio, number, percent} квоти",
    "joined": "Приєднався {date, date, long}",
  },
}
```

```tsx
import { createSignal } from 'solid-js';
import { I18nProvider } from '@solid-slopkit/i18n';
import { NumberInput, SegmentedControl, Stack, Text } from '@solid-slopkit/components';
import { LocaleSwitch } from './LocaleSwitch';
import messages from './messages.i18n.jsonc';

// A message with arguments is a function of a typed object: `count` must be a number, `role` suggests the
// branches the message lists (any other string takes `other`), `date` is a Date. Numbers and dates are
// formatted for the locale.
const JOINED = new Date(Date.UTC(2026, 9, 6, 12));

export default function MessagesDemo() {
  const [count, setCount] = createSignal(5);
  const [role, setRole] = createSignal('admin');
  return (
    <I18nProvider initialLocale="uk">
      <Stack gap={2} style={{ 'max-width': '26rem' }}>
        <LocaleSwitch />
        <NumberInput label="Users" min={0} value={count()} onChange={(value) => setCount(value ?? 0)} />
        <SegmentedControl aria-label="Role" size="xs" data={['admin', 'editor']} value={role()} onChange={setRole} />
        <Text>{messages.users({ count: count() })}</Text>
        <Text>{messages.role({ role: role() })}</Text>
        <Text>{messages.price({ amount: 1234567.5 })}</Text>
        <Text>{messages.share({ ratio: 0.42 })}</Text>
        <Text>{messages.joined({ date: JOINED })}</Text>
      </Stack>
    </I18nProvider>
  );
}
```

Plurals use the locale's own rules (the Ukrainian text has four branches). Number, date and plural formatting come from `Intl`, so nothing is added to the bundle.

## What the build checks

- A message that does not parse, or a plural or select without an `other` branch, fails the build.
- One name used two incompatible ways in a message (`{d} {d, date}`) is an error.
- A translation may use **fewer** arguments than the default locale's message, or a **wider** type for one (plain `{n}` where the default has `{n, number}`). It may not use an argument the default does not pass, nor need a narrower type than the default promises.

## Notes

- An argument the caller did not pass is left visible as `{name}` instead of throwing.
- Not supported: plural offsets, ordinals (`selectordinal`), currency styles, time styles, and tags (rich text) inside a message. Split the text into several messages and put the markup around them.
- A select argument is typed as its listed names plus any string (`"admin" | (string & {})`): `other` handles the rest, and the listed names are suggested.
