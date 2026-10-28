# MultiSelect

A labelled field that picks several values from a list in a dropdown: the selection shows as pills, and typing in the field after them filters the options. Built on [PillsInput](../pills-input/pills-input.md) and [Combobox](../combobox/combobox.md).

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** and **Pointer** below.

```tsx
import { MultiSelect } from '@solid-slopkit/components';
```

## Usage

```tsx
<MultiSelect label="Languages" placeholder="Pick some" data={['English', 'Deutsch', 'Français']} />

<MultiSelect
  label="Cities"
  clearable
  hidePickedOptions
  maxValues={3}
  value={cities()}
  onChange={(value) => setCities(value)}
  data={[
    { group: 'Nordics', items: ['Copenhagen', 'Oslo', 'Stockholm'] },
    { group: 'Baltics', items: [{ value: 'rix', label: 'Riga' }, { value: 'tll', label: 'Tallinn', disabled: true }] },
  ]}
/>
```

- **Data:** strings, `{ value, label?, disabled? }` items, and `{ group, items }` groups, in the order shown, as on [Select](../select/select.md). A label defaults to its value.
- **Value:** an array of values, in the order they were picked. Uncontrolled with `defaultValue` (read once), or controlled with `value`. `onChange(value, items)` is called with the new array and their items. A value that isn't in `data` shows as a pill with the value as its label.
- **Pills:** each value is a [Pill](../pill/pill.md) with a remove button named after it, "Remove Oslo" (`removeLabel` changes the first word), which takes it out and focuses the field. Each remove button is a tab stop before the field.
- **Field:** a text field with `role="combobox"` after the pills. Typing filters the options by their labels (ignoring case) and makes the first match active; `nothingFoundMessage` (default `Nothing found`) shows when nothing matches. Choosing an option or closing the dropdown clears the search. `placeholder` shows while nothing is selected.
- **Choosing:** Enter on the active option, or a click on an option, adds it, or takes it out when it's selected, and keeps the dropdown open. Selected options have a check mark and `aria-selected="true"`; the listbox has `aria-multiselectable="true"`. `hidePickedOptions` leaves them out of the list. `maxValues` disables the unselected options once that many are picked.
- **Keyboard:** ArrowDown and ArrowUp open it and move; Enter chooses; Backspace in the empty field takes out the last value; Escape and Tab close it. Disabled options are skipped.
- **Pointer:** a press in the field opens it; a press elsewhere on the box (the chevron, a pill's label) opens or closes it and focuses the field. Focus stays on the field throughout.
- **Clearing:** `clearable` replaces the chevron with a clear button (named `clearLabel`, default `Clear`) while there are values.
- **Forms:** `name` adds a hidden input per value, so the form data has every value under that name. `required` marks the field `aria-required` but doesn't make the text field required, since the values are the pills.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. The label names the field and the listbox. Without a label, pass `aria-label`.
- **Box:** a PillsInput's box, with `variant`, `leftSection` and `rightSection` (which replaces the chevron); it grows as the pills wrap, and the dropdown follows it. `disabled` and `readOnly` keep it closed; `readOnly` hides the remove buttons, and `disabled` disables them.
- **Dropdown:** under the box and as wide as it; `comboboxProps` sets `position`, `offset`, `matchTargetWidth`, `transition` and `transitionDuration`. The list scrolls past 15rem. Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts); other props, such as `aria-label` or `onBlur`, go to the field.

## Props

| Prop                  | Type                                                                     | Default           | Description                                         |
| --------------------- | ------------------------------------------------------------------------ | ----------------- | --------------------------------------------------- |
| `data`                | `MultiSelectData`                                                        | —                 | The options. Required.                              |
| `value`               | `string[]`                                                               | —                 | The selected values, when controlled.               |
| `defaultValue`        | `string[]`                                                               | `[]`              | The values it starts with, when uncontrolled.       |
| `onChange`            | `(value: string[], items: MultiSelectItem[]) => void`                    | —                 | Called when the selection changes.                  |
| `placeholder`         | `string`                                                                 | —                 | Shown while nothing is selected.                    |
| `maxValues`           | `number`                                                                 | —                 | At most this many values.                           |
| `hidePickedOptions`   | `boolean`                                                                | `false`           | Leaves the selected options out of the list.        |
| `clearable`           | `boolean`                                                                | `false`           | A button that clears the selection.                 |
| `clearLabel`          | `string`                                                                 | `'Clear'`         | The clear button's name.                            |
| `removeLabel`         | `string`                                                                 | `'Remove'`        | The first word of each pill's remove button's name. |
| `nothingFoundMessage` | `string`                                                                 | `'Nothing found'` | Shown when no option matches the search.            |
| `name`                | `string`                                                                 | —                 | Submits the values with a form.                     |
| `readOnly`            | `boolean`                                                                | `false`           | Shows the values without letting them change.       |
| `disabled`            | `boolean`                                                                | `false`           | Disables the field and the pills.                   |
| `variant`             | `'outline' \| 'soft' \| 'ghost'`                                         | `'outline'`       | The box's look.                                     |
| `leftSection`         | `JSX.Element`                                                            | —                 | Content before the pills.                           |
| `rightSection`        | `JSX.Element`                                                            | a chevron         | Content after the field.                            |
| `comboboxProps`       | `{ position, offset, matchTargetWidth, transition, transitionDuration }` | —                 | The dropdown's position and animation.              |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-multi-select`, plus `.slp-input-wrapper`, with InputWrapper's slots and attributes. The box is a PillsInput's (`[data-slot="pills-input-box"]`, also `.slp-input`), the pills are `.slp-pill`s, and the dropdown a [Combobox](../combobox/combobox.md)'s (`.slp-combobox`, `.slp-combobox-option`, …).
- Slots: `multi-select-pill`, `multi-select-chevron`, `multi-select-clear`, `multi-select-option-check`, `multi-select-option-label`, and PillsInput's `pills-input-content` and `pills-input-field`.
- Attributes on the box: PillsInput's, and `data-read-only` when read only.
- The pills' color: `--slp-pill-color` on `.slp-multi-select`.
