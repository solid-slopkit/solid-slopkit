# RangeSlider

A range picked on a track: two thumbs with `role="slider"`, and the bar between them. Everything else works like [Slider](../slider/slider.md).

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Pointer**, **Keyboard** and **Screen readers** below.

```tsx
import { RangeSlider } from '@solid-slopkit/components';
```

## Usage

```tsx
const [price, setPrice] = createSignal<[number, number]>([20, 80]);

<RangeSlider label="Price" value={price()} onChange={setPrice} valueLabel={(value) => `$${value}`} />

<RangeSlider label="Opening hours" min={0} max={24} defaultValue={[9, 17]} minRange={1} />
```

- **Value:** `[low, high]`, from `min` (0) to `max` (100), on the `step` grid. Controlled with `value` and `onChange`, or uncontrolled with `defaultValue` (`[min, max]` by default). `onChange` runs on every step, `onChangeEnd` when the user lets go.
- **Thumbs:** they can meet but never cross; `minRange` keeps them at least that far apart. A thumb dragged or stepped into the other stops there.
- **Pointer:** a press on the track moves the nearest thumb there and starts a drag; on a tie, the one on the side of the press.
- **Keyboard:** each thumb is a tab stop, with Slider's keys. Home and End go as far as the other thumb allows.
- **Screen readers:** the thumbs are named "Minimum" and "Maximum" (change it with `thumbLabels`), inside a `role="group"` named by `label`, so they hear "Price, group, Minimum, slider, 20".
- **Forms:** with `name`, two hidden inputs submit the low and high values under that name.
- **Marks, value bubbles, colors and sizes** are Slider's.

## Props

Other props are passed to the InputWrapper root. `min`, `max`, `step`, `largeStep`, `marks`, `valueLabel`, `valueLabelAlwaysOn`, `valueText`, `color`, `disabled`, `name`, `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id` are Slider's.

| Prop           | Type                                | Default                  | Description                          |
| -------------- | ----------------------------------- | ------------------------ | ------------------------------------ |
| `value`        | `[number, number]`                  | —                        | The range, controlled.               |
| `defaultValue` | `[number, number]`                  | `[min, max]`             | The starting range, uncontrolled.    |
| `onChange`     | `(value: [number, number]) => void` | —                        | Called on every step.                |
| `onChangeEnd`  | `(value: [number, number]) => void` | —                        | Called when the user lets go.        |
| `minRange`     | `number`                            | `0`                      | The smallest gap between the thumbs. |
| `thumbLabels`  | `[string, string]`                  | `['Minimum', 'Maximum']` | The thumbs' accessible names.        |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-range-slider`, plus `.slp-input-wrapper`, with `data-color`.
- Slots and the `--slp-slider-color` variable are Slider's; each `slider-thumb` has `data-index` (0 for low, 1 for high).
