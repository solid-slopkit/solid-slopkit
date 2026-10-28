# Pill

A small rounded tag for a value someone chose, such as a tag or a picked option, optionally with a button that removes it. PillsInput, MultiSelect and TagsInput show their values as pills.

```tsx
import { Pill } from '@solid-slopkit/components';
```

## Usage

```tsx
<Pill.Group>
  <For each={tags()}>
    {(tag) => (
      <Pill withRemoveButton onRemove={() => setTags((list) => list.filter((other) => other !== tag))}>
        {tag}
      </Pill>
    )}
  </For>
</Pill.Group>
```

- **Element:** a `span` with the label in `[data-slot="pill-label"]`, which truncates with an ellipsis when the pill doesn't fit. Other props go to the `span`.
- **Remove button:** `withRemoveButton` adds a small round `button` at the end that calls `onRemove`. It's named after the pill, through `aria-labelledby` on itself and the label: `Remove Apple`. `removeLabel` changes the first word (default `Remove`). It's a tab stop, and Enter and Space press it.
- **Size:** `xs` to `xl` (default `md`), each sized to sit inside an input of the same size with room around it.
- **Color:** `color` takes a color role: a 15% tint of it behind text in it. Without one, the pill is on the base surface's second shade. `--slp-pill-color` sets any color, on the pill or an ancestor.
- **Disabled:** dims it and disables the remove button.
- **Pill.Group:** a `div` that lays pills out in a row that wraps, with a gap that follows its `size`. Its `size`, `color` and `disabled` apply to every pill in it; a pill's own value wins.
- **Look:** fully rounded. Restyle it with `.slp-pill`.

## Props

| Prop               | Type                                   | Default    | Description                                 |
| ------------------ | -------------------------------------- | ---------- | ------------------------------------------- |
| `size`             | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     | Its size. Defaults to the group's.          |
| `color`            | `SlopColor`                            | —          | Color role. Defaults to the group's.        |
| `withRemoveButton` | `boolean`                              | `false`    | Shows a button that removes it.             |
| `onRemove`         | `() => void`                           | —          | Called when the remove button is pressed.   |
| `removeLabel`      | `string`                               | `'Remove'` | The first word of the remove button's name. |
| `disabled`         | `boolean`                              | `false`    | Dims it and disables the remove button.     |

Pill.Group takes `size`, `color` and `disabled`, and passes other props to its `div`.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-pill`, `.slp-pill-group`.
- Slots: `pill-label`, `pill-remove`.
- Attributes: `data-size` and `data-disabled` on both, `data-color` and `data-with-remove` on a pill.
- Custom property: `--slp-pill-color` (default: the `color` role's token); the tint and the text come from it.
