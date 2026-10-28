# Anchor

A link: [Text](../text/text.md) rendered as an `a`, in the primary color.

```tsx
import { Anchor } from '@solid-slopkit/components';
```

## Usage

```tsx
<Text>
  Read the <Anchor href="/terms">terms</Anchor> first.
</Text>
<Anchor href="/blog" underline="hover" size="sm" weight="medium">Blog</Anchor>
<Anchor href="https://example.com" target="_blank" rel="noreferrer">External</Anchor>
```

- **Size:** without `size`, Anchor takes the surrounding font size and line height, so it fits inside any text. With `size`, it uses the type scale like Text.
- **Color:** `primary` unless `color` names another color role. `dimmed` mutes it.
- **Underline:** `always` (the default), `hover` or `never`. Keep `always` for links inside body text, so they stand out without relying on color. Use `hover` for navigation-style links.
- **Text props:** `weight`, `dimmed`, `align`, `tabularNums`, `transform`, `truncate` and `lineClamp` work as on Text.
- **Router links:** `as` renders another link component and passes it every other prop, e.g. `<Anchor as={A} href="/settings">` with a router's `A`.
- Links open as the browser decides. For a new tab, pass `target="_blank"` and `rel="noreferrer"` yourself.

## Props

Other props, such as `href`, `target` and `rel`, are passed to the link.

| Prop          | Type                                                                                               | Default     | Description                                                        |
| ------------- | -------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `as`          | `ValidComponent`                                                                                   | `'a'`       | Element or component to render.                                    |
| `dynamicAs`   | `boolean`                                                                                          | `false`     | Set when `as` changes after the first render.                      |
| `underline`   | `'always' \| 'hover' \| 'never'`                                                                   | `'always'`  | When the link is underlined.                                       |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'`                         | inherited   | Font size and line height. Inherited from the parent when omitted. |
| `color`       | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color role.                                                        |
| `dimmed`      | `boolean`                                                                                          | `false`     | Mutes the link.                                                    |
| `weight`      | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                                     | —           | Font weight. Inherited when omitted.                               |
| `align`       | `'start' \| 'center' \| 'end' \| 'justify'`                                                        | —           | Text alignment. Inherited when omitted.                            |
| `tabularNums` | `boolean`                                                                                          | `false`     | Digits of equal width.                                             |
| `transform`   | `'uppercase' \| 'lowercase' \| 'capitalize'`                                                       | —           | Changes the case; `uppercase` also spaces the letters.             |
| `truncate`    | `boolean`                                                                                          | `false`     | One line, with an ellipsis. Needs a block display.                 |
| `lineClamp`   | `number`                                                                                           | —           | Cuts the text after this many lines.                               |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-anchor`, plus `.slp-text`. No slots.
- State and variant attributes on the root: `data-underline`, plus Text's (`data-color`, `data-size` or `data-inherit`, `data-dimmed`, `data-weight`, `data-align`, `data-tabular-nums`, `data-transform`, `data-truncate`, `data-line-clamp`).
