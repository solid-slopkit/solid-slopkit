# SemiCircleProgress

Shows how far a task has come as a half ring, a gauge: a `div` with `role="progressbar"`.

```tsx
import { SemiCircleProgress } from '@solid-slopkit/components';
```

## Usage

```tsx
<SemiCircleProgress value={cpu()} color="warning" label="CPU usage">
  <Text weight="semibold">{cpu()}%</Text>
</SemiCircleProgress>

<SemiCircleProgress value={3} max={5} size="sm" />
```

- **Value:** `value` from 0 to `max` (100 by default), clamped to that range. The arc runs from the left end, over the top, to the right end. At 0, no arc is drawn.
- **Indeterminate:** without `value`, a band sweeps along the arc. With reduced motion, it sweeps slowly.
- **Center:** children sit centered along the bottom, inside the arc, such as the value.
- **Accessible name:** `label`, `Progress` by default. When a visible label exists, point `aria-labelledby` at it and `label` is left out. `aria-valuetext` passes through.
- **Look:** `color` takes a color role and defaults to `primary`. `size` from `xs` to `xl` sets the width: 64, 88, 128, 176 or 224px. The height is 55% of the width.
- It shares `value`, `max`, `color`, `size` and `label` with Progress and RingProgress.

## Props

Other props are passed to the `div`.

| Prop       | Type                                                                                               | Default      | Description                                           |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------- |
| `value`    | `number`                                                                                           | —            | From 0 to `max`. Indeterminate if omitted.            |
| `max`      | `number`                                                                                           | `100`        | The value of a full arc.                              |
| `color`    | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`  | Color role of the arc.                                |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`       | Width of the gauge.                                   |
| `label`    | `string`                                                                                           | `'Progress'` | The accessible name, unless `aria-labelledby` is set. |
| `children` | `JSX.Element`                                                                                      | —            | Content centered along the bottom.                    |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-semi-circle-progress`.
- Slots: `[data-slot="semi-circle-progress-track"]` and `[data-slot="semi-circle-progress-arc"]`, the two SVG paths; `[data-slot="semi-circle-progress-label"]`, the content.
- State and variant attributes on the root: `data-color`, `data-size`, `data-indeterminate`, `data-empty`.
- The stroke is SVG, in a 100-unit-wide box: `.slp-semi-circle-progress path { stroke-width: 6 }` for a thinner arc.

CSS variables, set on the gauge or any ancestor:

| Variable                           | Default                    | Description                               |
| ---------------------------------- | -------------------------- | ----------------------------------------- |
| `--slp-semi-circle-progress-color` | `var(--slp-color-<color>)` | Arc color. For a color that isn't a role. |
