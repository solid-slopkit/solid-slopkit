# RingProgress

Shows how far a task has come as a ring: a `div` with `role="progressbar"`, with content in its center.

```tsx
import { RingProgress } from '@solid-slopkit/components';
```

## Usage

```tsx
<RingProgress value={done()} label="Course progress">
  <Text size="sm" weight="semibold">{done()}%</Text>
</RingProgress>

<RingProgress value={3} max={5} color="success" size="sm" />
<RingProgress label="Syncing" />

<RingProgress value={80} size="12rem" thickness={14} roundCaps={false} label="Savings goal">
  <Text as="span" size="2xl" weight="semibold" tabularNums>$24,000</Text>
  <Text as="span" size="xs" dimmed>80% of $30,000</Text>
</RingProgress>
```

- **Value:** `value` from 0 to `max` (100 by default), clamped to that range. The arc starts at the top and runs clockwise. At 0, no arc is drawn.
- **Indeterminate:** without `value`, a quarter arc turns around the track, for work whose length isn't known. With reduced motion, it turns slowly.
- **Center:** children are centered in the ring, such as the percentage or an icon; several children stack in a centered column. They're part of the progressbar's content; its accessible name and value come from `label` and `aria-valuenow`.
- **Accessible name:** `label`, `Progress` by default. When a visible label exists, point `aria-labelledby` at it and `label` is left out. `aria-valuetext` passes through.
- **Look:** `color` takes a color role and defaults to `primary`. `size` from `xs` to `xl` sets the diameter: 40, 56, 80, 112 or 144px; a CSS length such as `'12rem'` sets any other. `thickness` is the stroke width in hundredths of the diameter, 10 by default (1 to 48); the radius follows it, so the stroke stays inside the ring. `roundCaps` rounds the arc's ends, the default; `roundCaps={false}` cuts them flat.
- It shares `value`, `max`, `color`, `size` and `label` with Progress, so the two swap easily.

## Props

Other props are passed to the `div`.

| Prop        | Type                                                                                               | Default      | Description                                           |
| ----------- | -------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------- |
| `value`     | `number`                                                                                           | —            | From 0 to `max`. Indeterminate if omitted.            |
| `max`       | `number`                                                                                           | `100`        | The value of a full ring.                             |
| `color`     | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`  | Color role of the arc.                                |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| string`                                                   | `'md'`       | Diameter of the ring: a named size or a CSS length.   |
| `thickness` | `number`                                                                                           | `10`         | Stroke width, in hundredths of the diameter.          |
| `roundCaps` | `boolean`                                                                                          | `true`       | Rounds the arc's ends; `false` cuts them flat.        |
| `label`     | `string`                                                                                           | `'Progress'` | The accessible name, unless `aria-labelledby` is set. |
| `children`  | `JSX.Element`                                                                                      | —            | Content centered in the ring; several stack.          |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-ring-progress`.
- Slots: `[data-slot="ring-progress-track"]` and `[data-slot="ring-progress-arc"]`, the two SVG circles; `[data-slot="ring-progress-label"]`, the center.
- State and variant attributes on the root: `data-color`, `data-size` (a named size only), `data-round-caps`, `data-indeterminate`, `data-empty`.
- The stroke is SVG in a 100-unit box; prefer `thickness` to a `stroke-width` rule, since the prop also moves the radius so the stroke isn't clipped.

CSS variables, set on the ring or any ancestor:

| Variable                    | Default                    | Description                               |
| --------------------------- | -------------------------- | ----------------------------------------- |
| `--slp-ring-progress-color` | `var(--slp-color-<color>)` | Arc color. For a color that isn't a role. |
