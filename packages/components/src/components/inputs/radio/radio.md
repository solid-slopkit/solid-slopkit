# Radio

A radio with a label: a native `input type="radio"` drawn as a circle, next to a label, description and error. Radios are one choice of several: put them in a Radio.Group, or use Radio.Card for bigger targets.

```tsx
import { Radio } from '@solid-slopkit/components';
```

## Usage

```tsx
const [plan, setPlan] = createSignal('monthly');

<Radio.Group label="Plan" description="Change it any time." value={plan()} onChange={setPlan}>
  <Stack gap={2}>
    <Radio value="monthly" label="Monthly" />
    <Radio value="yearly" label="Yearly" description="Two months free." />
  </Stack>
</Radio.Group>;
```

## Radio.Group

- **Value:** the chosen radio's `value`, a `string`, or `undefined` when none is. Controlled with `value` and `onChange`: passing `value` at all makes it controlled, and a choice the parent doesn't apply is undone. Uncontrolled, it starts at `defaultValue`.
- **Keyboard:** the radios share a `name` (generated unless you pass one), so the browser treats them as one group: Tab reaches the chosen radio (or the first), and the arrow keys move the choice, skipping disabled radios.
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `required`, `size`. The radios sit in a `role="radiogroup"` named by the label and described by the description and error. `required` makes the radios `required`, so a form can't be sent without a choice.
- **Layout:** the group doesn't lay out its children. Put the radios in a Stack, a Group or a SimpleGrid.
- **Shared:** `disabled` disables every radio; `size` is their default size.

## Radio

- **In a group** a radio is chosen when its `value` is the group's; its own `checked` is ignored.
- **Alone** (rare: a single radio can't be unchosen) it takes `checked`, `defaultChecked` and `onChange`, which gets `true` when it's chosen.
- **Text:** `label` next to the circle (`labelPosition="left"` puts it before), `description` and `error` under it. With the label on the left, the text fills the row and the circle sits at its end, as in a settings list; to keep the two together, give the Radio a narrower parent or `width: fit-content`. A click on the label chooses it.
- **Look:** `color` takes a color role (`primary` by default) for the chosen circle; `size` (`xs` to `xl`) sizes the circle and text.
- **Props:** `class` and `style` go to the root; every other prop goes to the `input`.

## Radio.Card

A card that is a radio: a `label` around a hidden native radio, an indicator and your content. A click anywhere on it chooses it. The content is its accessible name, so keep it short, without links or buttons. It takes `value`, `color`, `disabled` and `name`, and the group's state like a Radio.

## Props

### Radio.Group

Other props are passed to the InputWrapper root.

| Prop                                                                                      | Type                      | Default   | Description                              |
| ----------------------------------------------------------------------------------------- | ------------------------- | --------- | ---------------------------------------- |
| `value`                                                                                   | `string \| undefined`     | —         | The chosen value, controlled.            |
| `defaultValue`                                                                            | `string`                  | —         | The value chosen at first, uncontrolled. |
| `onChange`                                                                                | `(value: string) => void` | —         | Called with the newly chosen value.      |
| `name`                                                                                    | `string`                  | generated | The `name` of every radio.               |
| `disabled`                                                                                | `boolean`                 | `false`   | Disables every radio.                    |
| `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id` | —                         | —         | InputWrapper's.                          |

### Radio

Other props are passed to the `input`.

| Prop                                    | Type                                                                                               | Default         | Description                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| `value`                                 | `string`                                                                                           | —               | Its value in the group, and for forms.                                            |
| `label`                                 | `JSX.Element`                                                                                      | —               | The label next to the circle.                                                     |
| `description`                           | `JSX.Element`                                                                                      | —               | Help text under the label.                                                        |
| `error`                                 | `JSX.Element`                                                                                      | —               | Error message; marks it invalid.                                                  |
| `size`                                  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | group's, `'md'` | Size of the circle and text.                                                      |
| `color`                                 | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`     | Color of the chosen circle.                                                       |
| `labelPosition`                         | `'right' \| 'left'`                                                                                | `'right'`       | Which side of the circle the label goes; `left` puts the circle at the row's end. |
| `disabled`                              | `boolean`                                                                                          | `false`         | Disables it.                                                                      |
| `checked`, `defaultChecked`, `onChange` | —                                                                                                  | —               | Outside a group only.                                                             |

### Radio.Card

Other props are passed to the hidden `input`; `class` and `style` to the `label`.

| Prop                                    | Type                                                                                               | Default     | Description                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------- |
| `value`                                 | `string`                                                                                           | —           | Its value in the group.                         |
| `children`                              | `JSX.Element`                                                                                      | —           | The content, which is also its accessible name. |
| `color`                                 | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color of the chosen circle and border.          |
| `disabled`                              | `boolean`                                                                                          | `false`     | Disables it.                                    |
| `name`                                  | `string`                                                                                           | group's     | The input's `name`.                             |
| `checked`, `defaultChecked`, `onChange` | —                                                                                                  | —           | Outside a group only.                           |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- **Radio:** root class `.slp-radio`. Slots: `radio-control`, `radio-input` (the circle), `radio-icon` (the dot), `radio-text`, `radio-label`, `radio-description`, `radio-error`. Attributes: `data-checked`, `data-disabled`, `data-invalid`, `data-size`, `data-color`, `data-label-position`.
- **Radio.Group:** root classes `.slp-radio-group` and `.slp-input-wrapper`; the radios are in `[data-slot="radio-group-items"]`.
- **Radio.Card:** root class `.slp-radio-card`. Slots: `radio-card-input`, `radio-card-indicator`, `radio-card-content`. Attributes: `data-checked`, `data-disabled`, `data-color`.

CSS variables, set on a radio or card or any ancestor:

| Variable              | Default                            | Description                                    |
| --------------------- | ---------------------------------- | ---------------------------------------------- |
| `--slp-radio-color`   | `var(--slp-color-<color>)`         | The chosen circle, and a chosen card's border. |
| `--slp-radio-content` | `var(--slp-color-<color>-content)` | The dot.                                       |
