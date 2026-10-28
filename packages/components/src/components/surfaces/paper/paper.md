# Paper

A surface that groups content: a `div` with a background, padding and radius, and optionally a border and a shadow.

```tsx
import { Paper } from '@solid-slopkit/components';
```

## Usage

```tsx
<Paper>Content on a base-100 surface, padded by 1rem</Paper>
<Paper withBorder shadow="sm" padding="lg">A card-like panel</Paper>
<Paper surface="base-200" radius="none">A quieter, square panel</Paper>
<Paper padding="none"><img src="/cover.jpg" alt="" /></Paper>
```

- **Element:** always a `div`. Give it `role="region"` and an `aria-label` (or wrap it in a `section`) when it's a landmark.
- **Padding:** `none`, or `xs` to `xl`: 0.5, 0.75, 1, 1.5 and 2rem (2, 3, 4, 6 and 8 spacing units). The default is `md`. Paper doesn't take style props; a one-off padding goes through a selector or `style`.
- **Surface:** the background, from the base colors: `base-100` (the default), `base-200` or `base-300`. Nest a lighter Paper on a darker one to layer surfaces. The text color is `base-content`.
- **Radius:** `default` (1rem) or `none`. Any other radius goes through a selector or `style`.
- **Border and shadow:** `withBorder` adds a 1px border in a muted text color. `shadow` takes `xs` to `xl` from the `--slp-shadow-*` tokens; the default is `none`.

## Props

Other props are passed to the `div`.

| Prop         | Type                                             | Default      | Description                       |
| ------------ | ------------------------------------------------ | ------------ | --------------------------------- |
| `padding`    | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`       | Inner padding.                    |
| `shadow`     | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'none'`     | Drop shadow.                      |
| `withBorder` | `boolean`                                        | `false`      | A thin border around the surface. |
| `surface`    | `'base-100' \| 'base-200' \| 'base-300'`         | `'base-100'` | Background color.                 |
| `radius`     | `'default' \| 'none'`                            | `'default'`  | Corner radius.                    |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-paper`. No slots.
- State and variant attributes on the root: `data-padding`, `data-shadow`, `data-surface`, `data-radius`, `data-with-border`.

Shadow tokens, set on `:root` in `slopkit.css`. Override them there or in a theme to change every shadow:

| Variable                  | Default                                        |
| ------------------------- | ---------------------------------------------- |
| `--slp-shadow-xs` … `-xl` | black at 6–10% alpha, from 1px to 25px of blur |
