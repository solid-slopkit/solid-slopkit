# ThemeIcon

An icon in a colored box: a `span` that centers its child and sizes an SVG to fit.

```tsx
import { ThemeIcon } from '@solid-slopkit/components';
```

## Usage

```tsx
<ThemeIcon color="success">
  <Check aria-hidden="true" />
</ThemeIcon>

<ThemeIcon color="primary" variant="soft" size="lg">
  <Rocket aria-hidden="true" />
</ThemeIcon>
```

- **Element:** a `span` with no role. Next to a label, such as a feature title or a list item, the icon is decoration: mark the SVG `aria-hidden="true"`. When the icon alone carries meaning, give the ThemeIcon `role="img"` and an `aria-label`.
- **Child:** usually one SVG icon, sized to 60% of the box and centered. Text, such as a digit, works too and is sized to the box.
- **Variants:** `solid` (the default), `soft` (a light tint of the color) and `outline`, whose border is half the color, or a faint base border without one.
- **Colors:** `color` takes a color role. Without it, the box uses the base colors.
- **Sizes:** `xs` to `xl`: 20, 26, 32, 40 and 48px. The corners scale with the box.
- ThemeIcon isn't interactive. For a clickable icon, use a Button with `shape="square"`.

## Props

Other props are passed to the `span`.

| Prop      | Type                                                                                               | Default   | Description                           |
| --------- | -------------------------------------------------------------------------------------------------- | --------- | ------------------------------------- |
| `variant` | `'solid' \| 'soft' \| 'outline'`                                                                   | `'solid'` | Visual style.                         |
| `color`   | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —         | Color role. Base colors when omitted. |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`    | Size.                                 |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-theme-icon`. No slots: the icon is your own child element.
- State and variant attributes on the root: `data-variant`, `data-color`, `data-size`.
- A round box is one selector: `.slp-theme-icon { border-radius: 50% }`.

CSS variables, set on the box or any ancestor:

| Variable                   | Default                            | Description                                                                |
| -------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `--slp-theme-icon-color`   | `var(--slp-color-<color>)`         | Accent color: the background for solid, icon and tint or border otherwise. |
| `--slp-theme-icon-content` | `var(--slp-color-<color>-content)` | Icon color on a solid background.                                          |
