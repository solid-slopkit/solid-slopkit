# Title

A heading, `h1` to `h6`, sized from the heading scale tokens.

```tsx
import { Title } from '@solid-slopkit/components';
```

## Usage

```tsx
<Title>Page title</Title>
<Title order={2}>Section</Title>
<Title order={2} size="h4">A section heading that looks smaller</Title>
<Title order={3} color="primary">Colored</Title>
```

- **Order:** `order` from `1` to `6` renders `h1` to `h6` and gives it that level's look. The default is `1`. Pick it for the document outline, not for the look.
- **Size:** `size="h1"` … `"h6"` changes only the look, so an `h2` can look like an `h4` and the outline stays correct.
- **Scale:** from `--slp-heading-size-*` and `--slp-heading-line-height-*` (34/40, 26/32, 22/28, 18/28, 16/24 and 14/20px with the default root size). The weight is `--slp-heading-weight` (700) unless `weight` overrides it.
- **Alignment:** `align` takes `'start'`, `'center'`, `'end'` or `'justify'`, e.g. for a centered empty state. Without it, the alignment is inherited.
- **Color:** `color` takes a color role. Without it, Title inherits its parent's color. `dimmed` mutes it: without `color` it takes the theme's `--slp-color-muted-content`, with one it fades the role's color.
- The margin is reset to `0`, so space headings with a Stack. Long headings wrap with balanced lines (`text-wrap: balance`).
- For a part of a heading in another style, nest `<Text as="span" inherit>`.
- Title doesn't take style props.

## Props

Other props are passed to the heading element.

| Prop     | Type                                                                                               | Default        | Description                                           |
| -------- | -------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------- |
| `order`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                                                       | `1`            | Heading level: the element, and its look by default.  |
| `size`   | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'`                                                     | the order's    | The look of another level.                            |
| `color`  | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —              | Color role. Inherits the parent's color when omitted. |
| `dimmed` | `boolean`                                                                                          | `false`        | Mutes the heading (`--slp-color-muted-content`).      |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                                     | heading weight | Font weight.                                          |
| `align`  | `'start' \| 'center' \| 'end' \| 'justify'`                                                        | —              | Text alignment. Inherited when omitted.               |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-title`. No slots.
- State and variant attributes on the root: `data-order`, `data-size` (the order's level unless `size` is set), `data-color`, `data-dimmed`, `data-weight`, `data-align`.

Heading tokens, set on `:root` in `slopkit.css`. Override them there or in a theme to change every Title:

| Variable                               | Default                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| `--slp-heading-weight`                 | `700`                                                              |
| `--slp-heading-size-h1` … `-h6`        | `2.125rem`, `1.625rem`, `1.375rem`, `1.125rem`, `1rem`, `0.875rem` |
| `--slp-heading-line-height-h1` … `-h6` | `2.5rem`, `2rem`, `1.75rem`, `1.75rem`, `1.5rem`, `1.25rem`        |
