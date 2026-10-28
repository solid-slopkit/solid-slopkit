# AngleSlider

An angle picked on a dial: a circle with `role="slider"`, 0° at the top and clockwise, with a thumb on its ring that the pointer drags around the center and the keyboard steps. It wraps around.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Pointer**, **Keyboard** and **Screen readers** below.

```tsx
import { AngleSlider } from '@solid-slopkit/components';
```

## Usage

```tsx
<AngleSlider label="Gradient angle" value={angle()} onChange={setAngle} />

<AngleSlider label="Wind" step={45} marks={[0, 90, 180, 270]} valueText={(angle) => compass(angle)} />
```

- **Value:** degrees in `[0, 360)`, from the top, clockwise: right is 90, bottom 180, left 270. Values snap to `step` (1) and wrap, so `370` is `10`. Controlled with `value` and `onChange`, or uncontrolled with `defaultValue` (0). `onChange` runs on every step, `onChangeEnd` when the user lets go.
- **Pointer:** a press anywhere on the dial points the angle at it and starts a drag around the center.
- **Keyboard:** the dial is a tab stop. Arrow Right and Up turn it clockwise a step, Left and Down back; Page Up and Page Down turn `largeStep` (15°); Home goes to 0, End to the last step before 360. It wraps around in both directions.
- **Look:** a ring filled from the top to the angle in the `color` (`primary`), a thumb on the ring, and the angle in the middle (`valueLabel` formats it; `null` hides it). `marks` puts a dot on the ring at each angle. `size` from `xs` (3rem) to `xl` (7.5rem).
- **Screen readers** hear `90 degrees`; `valueText` changes it, e.g. to compass points.
- **Forms:** with `name`, a hidden input submits the angle.
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id`.

## Props

Other props are passed to the InputWrapper root.

| Prop                                                                          | Type                                                                                               | Default      | Description                            |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------- |
| `value`                                                                       | `number`                                                                                           | —            | The angle, controlled.                 |
| `defaultValue`                                                                | `number`                                                                                           | `0`          | The starting angle, uncontrolled.      |
| `onChange`                                                                    | `(value: number) => void`                                                                          | —            | Called on every step.                  |
| `onChangeEnd`                                                                 | `(value: number) => void`                                                                          | —            | Called when the user lets go.          |
| `step`                                                                        | `number`                                                                                           | `1`          | The step, and the grid angles snap to. |
| `largeStep`                                                                   | `number`                                                                                           | `15`         | Page Up and Page Down.                 |
| `marks`                                                                       | `number[]`                                                                                         | —            | Angles to mark with a dot.             |
| `valueLabel`                                                                  | `((value: number) => JSX.Element) \| null`                                                         | `90°`        | The text in the middle.                |
| `valueText`                                                                   | `(value: number) => string`                                                                        | `90 degrees` | The angle as screen readers say it.    |
| `color`                                                                       | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`  | Color of the arc and thumb.            |
| `disabled`                                                                    | `boolean`                                                                                          | `false`      | Disables it.                           |
| `name`                                                                        | `string`                                                                                           | —            | Submits the angle with a form.         |
| `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id` | —                                                                                                  | —            | InputWrapper's.                        |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-angle-slider`, plus `.slp-input-wrapper`, with `data-color` and `data-disabled`.
- Slots: `angle-slider-dial` (with `data-dragging`, and the angle in `--_angle`), `angle-slider-thumb`, `angle-slider-mark`, `angle-slider-label`, `angle-slider-input`.

CSS variables, set on the slider or any ancestor:

| Variable                   | Default                    | Description            |
| -------------------------- | -------------------------- | ---------------------- |
| `--slp-angle-slider-color` | `var(--slp-color-<color>)` | The arc and the thumb. |
