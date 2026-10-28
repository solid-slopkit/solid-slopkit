# ColorSwatch

A sample of a color: a round `span` filled with it, over a checkerboard that shows transparency.

```tsx
import { ColorSwatch } from '@solid-slopkit/components';
```

## Usage

```tsx
<Group gap={2}>
  <ColorSwatch value="#7048e8" />
  <Text>Grape</Text>
</Group>

<ColorSwatch value="rgb(0 0 0 / 40%)" />
<ColorSwatch value="var(--slp-color-primary)" />
```

- **Value:** `value` takes any CSS color: hex, `rgb()`, `oklch()`, a named color, or a custom property such as a palette shade (`var(--slp-grape-6)`) or a theme token. The prop isn't called `color`: on other components `color` takes a color role, and here the color is the data being shown.
- **Transparency:** the color is drawn over a checkerboard, so a translucent color looks translucent.
- **Light colors:** a faint ring keeps a color close to the surface, such as white on a light page, visible.
- **Children:** drawn on top of the color and centered, such as a check mark on the selected swatch. An SVG child is sized to 60% of the swatch. Pick its color to contrast with the swatch.
- **Sizes:** `xs` to `xl`: 16, 20, 28, 36 and 44px. A square swatch is one selector: `.slp-color-swatch { border-radius: 4px }`.
- **Accessibility:** a `span` with no role, for a swatch next to the color's name. When the swatch stands alone, give it `role="img"` and an `aria-label` that names the color. ColorSwatch isn't interactive: for a color picker, put each swatch in a button with an accessible name and `aria-pressed`.

## Props

Other props are passed to the `span`.

| Prop    | Type                                   | Default | Description              |
| ------- | -------------------------------------- | ------- | ------------------------ |
| `value` | `string`                               | —       | Any CSS color. Required. |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Size.                    |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-color-swatch`. No slots.
- State and variant attributes on the root: `data-size`.
- The color is a `::before` layer over the root's checkerboard background; its ring is that layer's inset `box-shadow`.
