# Select

A labelled field that picks one value from a list in a dropdown, and behaves like a native select: no search and no clear button. Built on [Combobox](../combobox/combobox.md).

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** and **Pointer** below.

The default for a dropdown: themed like the rest of the library, and bound with `bind(f.x)` from `@solid-slopkit/signal-forms`. Use [NativeSelect](../native-select/native-select.md) instead only when you want the operating system's own picker (a wheel or a sheet on phones) and accept the browser's look for the list. For two to five options that stay in view, use [SegmentedControl](../segmented-control/segmented-control.md) or [Radio.Group](../radio/radio.md). To pick from a list by typing to filter it, build the picker from [Combobox](../combobox/combobox.md).

```tsx
import { Select } from '@solid-slopkit/components';
```

## Usage

```tsx
<Select label="Country" placeholder="Pick one" data={['Austria', 'Belgium', 'Croatia']} />

<Select
  label="City"
  value={city()}
  onChange={(value) => setCity(value)}
  data={[
    { group: 'Nordics', items: ['Copenhagen', 'Oslo', 'Stockholm'] },
    { group: 'Baltics', items: [{ value: 'rix', label: 'Riga' }, { value: 'tll', label: 'Tallinn', disabled: true }] },
  ]}
/>
```

- **Data:** strings, `{ value, label?, disabled? }` items, and `{ group, items }` groups, in the order shown. A label defaults to its value. Options before the first group show without a heading.
- **Value:** uncontrolled with `defaultValue` (read once), or controlled with `value` (`null` for none, which shows the `placeholder`). `onChange(value, item)` is called when another option is chosen. Once there's a value, the select can't clear it; only a controlled `value` of `null` can.
- **Field:** a `button` with `role="combobox"` showing the selected label, or the `placeholder`.
- **Keyboard:** ArrowDown and ArrowUp open it on the selected option, else the first or last, and move; Home and End go to the ends. Enter and Space open it, and choose the active option and close it; Escape and Tab close it. Typing a letter opens it on the first option that starts with what was typed. Disabled options are skipped.
- **Pointer:** a press anywhere on the field (the chevron included) opens and closes it; a click on the label only focuses it. A click on an option chooses it. Focus stays on the field throughout.
- **Selected option:** marked with a check mark at the end and the primary color, and `aria-selected="true"`. Choosing it again keeps it, without calling `onChange`.
- **Forms:** `name` adds a hidden input with the value (empty for none). With `@solid-slopkit/signal-forms`, spread `bind(f.x)` on a `string | null` field: `<Select label="Plan" data={plans} {...bind(f.plan)} />`.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. The label names the field and the listbox. Without a label, pass `aria-label`.
- **Box:** an [Input](../input/input.md)'s box, with `variant`, `leftSection` and `rightSection` (which replaces the chevron). `disabled` and `readOnly` keep it closed.
- **Dropdown:** under the field and as wide as it; `comboboxProps` sets `position`, `offset`, `matchTargetWidth`, `transition` and `transitionDuration`. The list scrolls past 15rem. Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts); other props, such as `aria-label` or `onBlur`, go to the field.

## Props

| Prop            | Type                                                                     | Default     | Description                                  |
| --------------- | ------------------------------------------------------------------------ | ----------- | -------------------------------------------- |
| `data`          | `SelectData`                                                             | —           | The options. Required.                       |
| `value`         | `string \| null`                                                         | —           | The selected value, when controlled.         |
| `defaultValue`  | `string \| null`                                                         | `null`      | The value it starts with, when uncontrolled. |
| `onChange`      | `(value: string, item: SelectItem) => void`                              | —           | Called when another option is chosen.        |
| `placeholder`   | `string`                                                                 | —           | Shown while nothing is selected.             |
| `name`          | `string`                                                                 | —           | Submits the value with a form.               |
| `readOnly`      | `boolean`                                                                | `false`     | Shows the value without letting it change.   |
| `disabled`      | `boolean`                                                                | `false`     | Disables the field.                          |
| `variant`       | `'outline' \| 'soft' \| 'ghost'`                                         | `'outline'` | The box's look.                              |
| `leftSection`   | `JSX.Element`                                                            | —           | Content before the value.                    |
| `rightSection`  | `JSX.Element`                                                            | a chevron   | Content after the value.                     |
| `comboboxProps` | `{ position, offset, matchTargetWidth, transition, transitionDuration }` | —           | The dropdown's position and animation.       |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-select`, plus `.slp-input-wrapper`, with InputWrapper's slots and attributes. The field box is an `.slp-input`, and the dropdown a [Combobox](../combobox/combobox.md)'s (`.slp-combobox`, `.slp-combobox-option`, …).
- Slots: `select-value` (with `data-placeholder` while nothing is selected), `select-option-check`, `select-option-label`.
