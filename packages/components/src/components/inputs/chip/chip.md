# Chip

A pill-shaped toggle: a `label` around a hidden native checkbox, or a radio in a single-choice Chip.Group. On, it shows a check and takes the color. For filters, tags and quick options.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see the Usage notes below.

```tsx
import { Chip } from '@solid-slopkit/components';
```

## Usage

```tsx
<Chip.Group label="Size" value={size()} onChange={setSize}>
  <Chip value="s">Small</Chip>
  <Chip value="m">Medium</Chip>
  <Chip value="l">Large</Chip>
</Chip.Group>

<Chip.Group multiple aria-label="Filters" value={filters()} onChange={setFilters}>
  <Chip value="vegan">Vegan</Chip>
  <Chip value="spicy">Spicy</Chip>
</Chip.Group>
```

- **Chip.Group:** single choice by default: the chips are radios sharing a `name`, the value is the chosen chip's `value` (a `string`), and the arrow keys move the choice. With `multiple`, they're checkboxes and the value is the array of the ones that are on, in the order they were turned on. `multiple` is read once, and the types of `value` and `onChange` follow it.
- **State:** controlled with `value` and `onChange` (passing `value` at all makes it controlled, and a change the parent doesn't apply is undone), or uncontrolled with `defaultValue`.
- **Text:** the group is an InputWrapper: `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`; the chips sit in a `role="radiogroup"` or `role="group"` named by the label. Without a visible label, pass `aria-label`. The chips wrap onto new lines, 0.5rem apart.
- **Alone,** a chip is a toggle: `checked`, `defaultChecked` and `onChange` (with a `boolean`).
- **Name:** the chip's text is its accessible name. Keep it short; don't put links or buttons inside.
- **Look:** `variant` sets how a chip looks when on: `soft` (the default, a tint), `outline` (a border of half the color, with the check in full color) or `filled`. Soft and outline keep the text in the base color, so it stays readable whatever the color; the check takes the role. `color` takes a color role (`primary` by default). Heights match Button's.
- **Focus:** the pill gets a focus ring while its hidden input has focus.

## Props

### Chip

Other props are passed to the hidden `input`.

| Prop             | Type                                                                                               | Default         | Description                            |
| ---------------- | -------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------- |
| `value`          | `string`                                                                                           | —               | Its key in a group, and for forms.     |
| `checked`        | `boolean`                                                                                          | —               | Whether it's on, alone and controlled. |
| `defaultChecked` | `boolean`                                                                                          | `false`         | Whether it starts on, alone.           |
| `onChange`       | `(checked: boolean) => void`                                                                       | —               | Called with the new state.             |
| `variant`        | `'soft' \| 'outline' \| 'filled'`                                                                  | `'soft'`        | How it looks when on.                  |
| `color`          | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`     | Color when on.                         |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | group's, `'md'` | Height and text size.                  |
| `disabled`       | `boolean`                                                                                          | `false`         | Disables it.                           |

### Chip.Group

Other props are passed to the InputWrapper root.

| Prop                                                                                        | Type                                               | Default   | Description                                   |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------- | --------------------------------------------- |
| `multiple`                                                                                  | `boolean`                                          | `false`   | Several chips can be on. Read once.           |
| `value`                                                                                     | `string \| undefined`, or `string[]` with multiple | —         | The value, controlled.                        |
| `defaultValue`                                                                              | `string`, or `string[]` with multiple              | —         | The starting value, uncontrolled.             |
| `onChange`                                                                                  | `(value: string)`, or `(value: string[])`          | —         | Called with the new value.                    |
| `name`                                                                                      | `string`                                           | generated | The `name` of every chip.                     |
| `disabled`                                                                                  | `boolean`                                          | `false`   | Disables every chip.                          |
| `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id`, `aria-label` | —                                                  | —         | InputWrapper's; `aria-label` names the group. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- **Chip:** root class `.slp-chip` (the `label`). Slots: `chip-input`, `chip-icon`, `chip-label`. Attributes: `data-checked`, `data-disabled`, `data-variant`, `data-color`, `data-size`.
- **Chip.Group:** root classes `.slp-chip-group` and `.slp-input-wrapper`; the chips are in `[data-slot="chip-group-items"]`, a wrapping flex row.

CSS variables, set on a chip or any ancestor:

| Variable             | Default                            | Description                  |
| -------------------- | ---------------------------------- | ---------------------------- |
| `--slp-chip-color`   | `var(--slp-color-<color>)`         | The color when on.           |
| `--slp-chip-content` | `var(--slp-color-<color>-content)` | Text color on a filled chip. |
