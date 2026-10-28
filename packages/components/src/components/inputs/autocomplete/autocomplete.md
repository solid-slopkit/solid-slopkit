# Autocomplete

A labelled text field with suggestions: what's typed is the value, and the suggestions that contain it are offered in a dropdown to fill it in. Built on [Combobox](../combobox/combobox.md).

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** below.

```tsx
import { Autocomplete } from '@solid-slopkit/components';
```

## Usage

```tsx
<Autocomplete label="City" placeholder="Start typing" data={['Amsterdam', 'Antwerp', 'Athens', 'Berlin']} />

<Autocomplete
  label="Ingredient"
  value={ingredient()}
  onChange={setIngredient}
  limit={5}
  data={[
    { group: 'Fruit', items: ['Apple', 'Banana'] },
    { group: 'Vegetables', items: ['Leek', { value: 'Lettuce', disabled: true }] },
  ]}
/>
```

- **Value:** the text. Uncontrolled with `defaultValue` (read once), or controlled with `value`. `onChange(text)` is called on every change: typed, or filled in from a suggestion. `onOptionSubmit(value)` is called only when a suggestion is chosen.
- **Suggestions:** strings, `{ value, disabled? }` items, and `{ group, items }` groups. Those whose text contains what's typed (ignoring case) are shown; all of them while the field is empty. `limit` caps how many, across the groups.
- **Opening:** typing opens it while something matches and closes it when nothing does, so there's never an empty dropdown. A click opens it, and so do the arrow keys, while there are suggestions.
- **Keyboard:** typing never makes a suggestion active, so Enter keeps what was typed and submits a form as usual. ArrowDown and ArrowUp move to a suggestion; Enter then fills it in and closes. Escape and Tab close it and keep the text. Home and End move the caret.
- **Focus** stays on the field; a click on a suggestion fills it in.
- **Field:** a text `input` with `aria-autocomplete="list"` and `autocomplete="off"`. Other props, such as `name`, `placeholder` or `onBlur`, go to it.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. The label names the field and the list.
- **Box:** an [Input](../input/input.md)'s box, with `variant`, `leftSection` and `rightSection`. `disabled` and `readOnly` offer no suggestions.
- **Dropdown:** under the field and as wide as it; `comboboxProps` sets `position`, `offset`, `matchTargetWidth`, `transition` and `transitionDuration`. The list scrolls past 15rem. Needs a `<SlopkitUi>` above it.
- For a value that must be one of the options, use [Select](../select/select.md) with `searchable`.

## Props

| Prop             | Type                                                                     | Default     | Description                                 |
| ---------------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------- |
| `data`           | `AutocompleteData`                                                       | —           | The suggestions. Required.                  |
| `value`          | `string`                                                                 | —           | The text, when controlled.                  |
| `defaultValue`   | `string`                                                                 | `''`        | The text it starts with, when uncontrolled. |
| `onChange`       | `(value: string) => void`                                                | —           | Called whenever the text changes.           |
| `onOptionSubmit` | `(value: string) => void`                                                | —           | Called when a suggestion is chosen.         |
| `limit`          | `number`                                                                 | —           | At most this many suggestions are shown.    |
| `readOnly`       | `boolean`                                                                | `false`     | Shows the text without letting it change.   |
| `disabled`       | `boolean`                                                                | `false`     | Disables the field.                         |
| `variant`        | `'outline' \| 'soft' \| 'ghost'`                                         | `'outline'` | The box's look.                             |
| `leftSection`    | `JSX.Element`                                                            | —           | Content before the text.                    |
| `rightSection`   | `JSX.Element`                                                            | —           | Content after the text.                     |
| `comboboxProps`  | `{ position, offset, matchTargetWidth, transition, transitionDuration }` | —           | The dropdown's position and animation.      |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-autocomplete`. The field box is an `.slp-input`, and the dropdown a [Combobox](../combobox/combobox.md)'s (`.slp-combobox`, `.slp-combobox-option`, …).
