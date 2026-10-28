# Progress

Shows how far a task has come: a `div` with `role="progressbar"`, a track and a bar.

```tsx
import { Progress } from '@solid-slopkit/components';
```

## Usage

```tsx
<Progress value={uploaded()} label="Uploading photos" />
<Progress value={3} max={5} color="success" />
<Progress label="Preparing" />

<Text id="disk-label">Disk space</Text>
<Progress value={70} aria-labelledby="disk-label" aria-valuetext="7 of 10 GB" />
```

- **Value:** `value` from 0 to `max` (100 by default). Values outside that range are clamped. The bar's width follows, with a short transition.
- **Indeterminate:** without `value`, a band slides across the track, for work whose length isn't known. With reduced motion, the bar pulses instead.
- **Accessible name:** `label`, `Progress` by default, names the progressbar. When a visible label exists, point `aria-labelledby` at it and `label` is left out. `aria-valuetext` passes through, for a value that reads better as text.
- **Look:** a full-width, rounded track. `color` takes a color role and defaults to `primary`. `size` from `xs` to `xl` sets the height (4 to 16px). `striped` draws diagonal stripes on the bar; `animated` moves them, and implies `striped`. Moving stripes stop with reduced motion.
- Progress has no margin and no visible text. Put the label and the percentage next to it, in a Group or Stack.

## Props

Other props are passed to the `div`.

| Prop       | Type                                                                                               | Default      | Description                                           |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------- |
| `value`    | `number`                                                                                           | —            | From 0 to `max`. Indeterminate if omitted.            |
| `max`      | `number`                                                                                           | `100`        | The value of a full bar.                              |
| `color`    | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`  | Color role of the bar.                                |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`       | Height of the track.                                  |
| `striped`  | `boolean`                                                                                          | `false`      | Diagonal stripes on the bar.                          |
| `animated` | `boolean`                                                                                          | `false`      | Moves the stripes. Implies `striped`.                 |
| `label`    | `string`                                                                                           | `'Progress'` | The accessible name, unless `aria-labelledby` is set. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-progress`, the track.
- Slots: `[data-slot="progress-bar"]`, the filled part.
- State and variant attributes on the root: `data-color`, `data-size`, `data-indeterminate`, `data-striped`, `data-animated`.
- Square ends are one selector: `.slp-progress, .slp-progress [data-slot='progress-bar'] { border-radius: 0 }`.

CSS variables, set on the progress or any ancestor:

| Variable               | Default                    | Description                               |
| ---------------------- | -------------------------- | ----------------------------------------- |
| `--slp-progress-color` | `var(--slp-color-<color>)` | Bar color. For a color that isn't a role. |
