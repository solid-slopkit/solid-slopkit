# Slider

A value picked on a track: a thumb with `role="slider"` that the pointer drags and the keyboard steps, with optional marks and a value bubble. For two values, use RangeSlider.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Pointer**, **Keyboard** and **Screen readers** below.

```tsx
import { Slider } from '@solid-slopkit/components';
```

## Usage

```tsx
<Slider label="Volume" value={volume()} onChange={setVolume} />

<Slider
  label="Size"
  min={0}
  max={4}
  marks={[{ value: 0, label: 'XS' }, { value: 2, label: 'M' }, { value: 4, label: 'XL' }]}
  onChangeEnd={(size) => save(size)}
/>
```

- **Value:** a number from `min` (0) to `max` (100), on the `step` grid (1) counted from `min`; steps keep the step's decimals, so `0.1` steps give `0.3`, not `0.30000000000000004`. Controlled with `value` and `onChange` (passing `value` at all makes it controlled), or uncontrolled with `defaultValue`.
- **Changes:** `onChange` runs on every step, including each step of a drag; `onChangeEnd` runs when the user lets go (a drag ends, or a key is pressed), for work that shouldn't run on every step, like saving.
- **Pointer:** a press anywhere on the track (it takes the thumb's height) jumps the thumb there and starts a drag; the drag follows the pointer even outside the track.
- **Keyboard:** the thumb is a tab stop. Arrow Right and Up add a step, Left and Down take one; Page Up and Page Down change it by `largeStep` (ten steps); Home and End go to `min` and `max`.
- **Marks:** `marks` puts a dot on the track for each value, filled up to the thumb, with an optional `label` under it. Mark labels are for the eye; screen readers hear the thumb's value.
- **Value bubble:** shows the value over the thumb while it's hovered, focused with the keyboard, or dragged. `valueLabel` formats it (``(v) => `${v}%` ``); `null` hides it; `valueLabelAlwaysOn` shows it all the time.
- **Screen readers:** the thumb is named by `label`, with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`: the number in the provider's locale, or `valueText(value)`, e.g. `'21 degrees'`.
- **Forms:** with `name`, a hidden input submits the value.
- **Look:** `color` takes a color role for the bar and thumb border (`primary`). `size` sets the track and thumb sizes.
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `size`. `required` only shows the asterisk.

## Props

Other props are passed to the InputWrapper root.

| Prop                                                                                      | Type                                                                                               | Default     | Description                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------- |
| `value`                                                                                   | `number`                                                                                           | —           | The value, controlled.                      |
| `defaultValue`                                                                            | `number`                                                                                           | `min`       | The starting value, uncontrolled.           |
| `onChange`                                                                                | `(value: number) => void`                                                                          | —           | Called on every step.                       |
| `onChangeEnd`                                                                             | `(value: number) => void`                                                                          | —           | Called when the user lets go.               |
| `min`                                                                                     | `number`                                                                                           | `0`         | The smallest value.                         |
| `max`                                                                                     | `number`                                                                                           | `100`       | The largest value.                          |
| `step`                                                                                    | `number`                                                                                           | `1`         | The step, and the grid values snap to.      |
| `largeStep`                                                                               | `number`                                                                                           | ten steps   | Page Up and Page Down.                      |
| `marks`                                                                                   | `{ value: number; label?: JSX.Element }[]`                                                         | —           | Dots on the track, with optional labels.    |
| `valueLabel`                                                                              | `((value: number) => JSX.Element) \| null`                                                         | the value   | The bubble over the thumb; `null` hides it. |
| `valueLabelAlwaysOn`                                                                      | `boolean`                                                                                          | `false`     | Shows the bubble all the time.              |
| `valueText`                                                                               | `(value: number) => string`                                                                        | the number  | The value as screen readers say it.         |
| `color`                                                                                   | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color of the bar and thumb.                 |
| `disabled`                                                                                | `boolean`                                                                                          | `false`     | Disables it.                                |
| `name`                                                                                    | `string`                                                                                           | —           | Submits the value with a form.              |
| `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id` | —                                                                                                  | —           | InputWrapper's.                             |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-slider`, plus `.slp-input-wrapper`, with `data-color`.
- Slots: `slider-root` (with `data-size`, `data-disabled`, `data-dragging`, and `data-with-marks-labels` when a mark has a label), `slider-track`, `slider-bar`, `slider-mark` (with `data-filled`), `slider-mark-label`, `slider-thumb` (with `data-dragging`), `slider-value-label`, `slider-input`.

CSS variables, set on the slider or any ancestor:

| Variable             | Default                    | Description                                  |
| -------------------- | -------------------------- | -------------------------------------------- |
| `--slp-slider-color` | `var(--slp-color-<color>)` | The bar, the thumb's border, the focus ring. |
