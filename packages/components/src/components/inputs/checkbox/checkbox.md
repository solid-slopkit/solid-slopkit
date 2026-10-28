# Checkbox

A checkbox with a label: a native `input type="checkbox"` drawn as a box with a check, next to a label, description and error. Alone, in a Checkbox.Group, or as a Checkbox.Card.

```tsx
import { Checkbox } from '@solid-slopkit/components';
```

## Usage

```tsx
const [accepted, setAccepted] = createSignal(false);

<Checkbox label="I accept the terms" checked={accepted()} onChange={setAccepted} />

<Checkbox.Group label="Toppings" description="Pick any." value={toppings()} onChange={setToppings}>
  <Stack gap={2}>
    <Checkbox value="cheese" label="Cheese" />
    <Checkbox value="olives" label="Olives" />
  </Stack>
</Checkbox.Group>
```

- **State:** controlled with `checked` and `onChange`, which gets the new `boolean`; a click the parent doesn't apply is undone. Uncontrolled, it starts at `defaultChecked`.
- **Indeterminate:** `indeterminate` shows a dash, for "some of these are checked", and screen readers say "mixed". It's the browser's property, not an attribute, so it's set after hydration. The next toggle checks or unchecks as usual; update `indeterminate` yourself.
- **Text:** `label` sits next to the box (`labelPosition="left"` puts it before), with `description` and `error` under it. With the label on the left, the text fills the row and the box sits at its end, as in a settings list; to keep the two together, give the Checkbox a narrower parent or `width: fit-content`. A click on the label toggles. `error` describes the checkbox and marks it invalid (`aria-invalid`, a red box border). Without `label`, give it an `aria-label`.
- **Forms:** `name` and `value` are the input's: a checked box submits `value` (or `on`).
- **Look:** `color` takes a color role (`primary` by default) for the checked box. `size` (`xs` to `xl`) sizes the box and text together.
- **Props:** `class` and `style` go to the root; every other prop goes to the `input`.

## Checkbox.Group

A labelled group with one value: the array of its checked checkboxes' `value`s, in the order they were checked.

- **State:** controlled with `value` and `onChange`, or uncontrolled with `defaultValue`. A checkbox in a group gets its checked state from the group by its `value`; its own `checked` is ignored.
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`. The checkboxes sit in a `role="group"` named by the label and described by the description and error.
- **Layout:** the group doesn't lay out its children. Put the checkboxes in a Stack, a Group or a SimpleGrid.
- **Shared:** `name` names every checkbox, `disabled` disables them all, `size` is their default size.

## Checkbox.Card

A card that is a checkbox: a `label` around a hidden native checkbox, a check indicator and your content. A click anywhere on it toggles it.

- The content is the checkbox's accessible name, so keep it short: a title and a line. Don't put links or buttons inside.
- It takes the same state props as Checkbox (`checked`, `defaultChecked`, `onChange`, `value`, `name`, `disabled`, `color`), and works in a Checkbox.Group.
- Checked, its border and background take the color; focused, it gets a focus ring.

## Props

### Checkbox

Other props are passed to the `input`.

| Prop             | Type                                                                                               | Default         | Description                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------- |
| `checked`        | `boolean`                                                                                          | —               | Whether it's checked, controlled.                                           |
| `defaultChecked` | `boolean`                                                                                          | `false`         | Whether it starts checked, uncontrolled.                                    |
| `onChange`       | `(checked: boolean) => void`                                                                       | —               | Called with the new state.                                                  |
| `indeterminate`  | `boolean`                                                                                          | `false`         | Shows a dash; the state is mixed.                                           |
| `label`          | `JSX.Element`                                                                                      | —               | The label next to the box.                                                  |
| `description`    | `JSX.Element`                                                                                      | —               | Help text under the label.                                                  |
| `error`          | `JSX.Element`                                                                                      | —               | Error message; marks it invalid.                                            |
| `value`          | `string`                                                                                           | —               | Submitted when checked; the key in a group.                                 |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | group's, `'md'` | Size of the box and text.                                                   |
| `color`          | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`     | Color of the checked box.                                                   |
| `labelPosition`  | `'right' \| 'left'`                                                                                | `'right'`       | Which side of the box the label goes; `left` puts the box at the row's end. |
| `disabled`       | `boolean`                                                                                          | `false`         | Disables it.                                                                |
| `class`, `style` | —                                                                                                  | —               | For the root.                                                               |
| `ref`            | `Ref<HTMLInputElement>`                                                                            | —               | The `input`.                                                                |

### Checkbox.Group

Other props are passed to the InputWrapper root.

| Prop                                                                          | Type                        | Default | Description                                |
| ----------------------------------------------------------------------------- | --------------------------- | ------- | ------------------------------------------ |
| `value`                                                                       | `string[]`                  | —       | The checked values, controlled.            |
| `defaultValue`                                                                | `string[]`                  | `[]`    | The values checked at first, uncontrolled. |
| `onChange`                                                                    | `(value: string[]) => void` | —       | Called with the new checked values.        |
| `name`                                                                        | `string`                    | —       | The `name` of every checkbox.              |
| `disabled`                                                                    | `boolean`                   | `false` | Disables every checkbox.                   |
| `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id` | —                           | —       | InputWrapper's.                            |

### Checkbox.Card

`checked`, `defaultChecked`, `onChange`, `value`, `name`, `disabled` and `color` as on Checkbox; `children` is the content. Other props are passed to the hidden `input`.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- **Checkbox:** root class `.slp-checkbox`. Slots: `checkbox-control`, `checkbox-input` (the box), `checkbox-icon`, `checkbox-text`, `checkbox-label`, `checkbox-description`, `checkbox-error`. Attributes: `data-checked`, `data-indeterminate`, `data-disabled`, `data-invalid`, `data-size`, `data-color`, `data-label-position`.
- **Checkbox.Group:** root classes `.slp-checkbox-group` and `.slp-input-wrapper`, with InputWrapper's slots; the checkboxes are in `[data-slot="checkbox-group-items"]`.
- **Checkbox.Card:** root class `.slp-checkbox-card`. Slots: `checkbox-card-input`, `checkbox-card-indicator`, `checkbox-card-content`. Attributes: `data-checked`, `data-disabled`, `data-color`.

CSS variables, set on a checkbox or card or any ancestor:

| Variable                 | Default                            | Description                                   |
| ------------------------ | ---------------------------------- | --------------------------------------------- |
| `--slp-checkbox-color`   | `var(--slp-color-<color>)`         | The checked box, and a checked card's border. |
| `--slp-checkbox-content` | `var(--slp-color-<color>-content)` | The check.                                    |
