# Fieldset

A group of related fields: a `fieldset`, with its `legend` as a caption inside the box.

```tsx
import { Fieldset } from '@solid-slopkit/components';
```

## Usage

```tsx
<Fieldset legend="Shipping address">
  <TextInput label="Street" />
  <TextInput label="City" />
</Fieldset>

<Fieldset legend="Payment" variant="soft" disabled={!ready()}>
  …
</Fieldset>
```

- **Name:** the `legend` names the group, so screen readers say "Shipping address, group" before its first field. Without a legend, give the fieldset an `aria-label`.
- **Layout:** the fields stack in a column, 1rem apart. The legend is a caption at the top inside the box, not cut into the border.
- **Variants:** `outline` (the default) is a bordered box on the base surface; `soft` is filled with `base-200`; `ghost` has no box and no padding, for grouping without a frame.
- **Disabled:** `disabled` disables every control inside, natively, including ones that aren't from this library. Inputs inside look disabled too.
- Nest fieldsets for groups within a group; a radio or checkbox group gets its own label from its group component (`Radio.Group`, `Checkbox.Group`).

## Props

Other props are passed to the `fieldset`.

| Prop       | Type                             | Default     | Description                              |
| ---------- | -------------------------------- | ----------- | ---------------------------------------- |
| `legend`   | `JSX.Element`                    | —           | The group's caption and name.            |
| `variant`  | `'outline' \| 'soft' \| 'ghost'` | `'outline'` | Visual style.                            |
| `disabled` | `boolean`                        | `false`     | Disables every control inside, natively. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-fieldset`.
- Slots: `[data-slot="fieldset-legend"]`.
- State and variant attributes on the root: `data-variant`, `data-disabled`.
- The gap between fields is the root's `gap`.
