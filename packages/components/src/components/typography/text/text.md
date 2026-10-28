# Text

Body text: a paragraph by default, or any element with `as`. Sizes come from the type scale tokens.

```tsx
import { Text } from '@solid-slopkit/components';
```

## Usage

```tsx
<Text>A paragraph of body text.</Text>
<Text size="sm" dimmed>Secondary copy</Text>
<Text color="error" weight="medium">Something went wrong</Text>
<Text as="span" size="xs">inline</Text>
```

- **Element:** a `p` by default. `as` renders another element, such as `span`, `label`, `div` or `li`, and takes that element's attributes (`<Text as="label" for="email">`). The margin is reset to `0`, so space paragraphs with a Stack.
- **Sizes:** `xs` to `xl` for copy, from `--slp-font-size-*` and `--slp-line-height-*` (12/16, 14/20, 16/24, 18/28 and 20/28px with the default root size). `2xl` to `5xl` are display sizes for figures such as a balance or a total (24/32, 30/36, 36/40 and 48/48px), tracked slightly tighter. The default is `md`.
- **Color:** `color` takes a color role. Without it, Text inherits the color of its parent, so it works on colored surfaces too. `dimmed` mutes the text: without `color` it takes the theme's `--slp-color-muted-content`, with one it fades the role's color. On a colored surface, pair `dimmed` with a `color` or set the color in CSS.
- **Weight:** `'normal'`, `'medium'`, `'semibold'` or `'bold'`. Without it, the weight is inherited.
- **Alignment:** `align` takes `'start'`, `'center'`, `'end'` or `'justify'`. Without it, the alignment is inherited.
- **Figures and labels:** `tabularNums` gives every digit the same width, so amounts line up in a column and don't shift as they change. `transform` changes the case: `uppercase` also spaces the letters by 0.05em, for small labels over a figure; `lowercase` and `capitalize` only change the case.
- **Truncation:** `truncate` cuts the text to one line with an ellipsis. `lineClamp={n}` cuts it after `n` lines. Both need a block element, such as the default `p` or `as="div"`; give the element or its parent a width.
- **Inherit:** `inherit` takes font size and line height from the parent and ignores `size`, for Text inside a Title, a Button or another Text.

```tsx
<Text truncate>A long single line…</Text>
<Text lineClamp={3}>A long description…</Text>
<Text size="lg">
  Total: <Text as="span" inherit weight="bold">€42</Text>
</Text>
<Text size="xs" weight="medium" transform="uppercase" dimmed>Claimable balance</Text>
<Text size="5xl" weight="semibold" tabularNums>$1,240.00</Text>
<Text size="sm" tabularNums align="end">$988.40</Text>
```

- Text doesn't take style props. Space it with a Stack or Group, or wrap it in a Box.

## Props

Other props are passed to the rendered element.

| Prop          | Type                                                                                               | Default | Description                                            |
| ------------- | -------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| `as`          | `ValidComponent`                                                                                   | `'p'`   | Element or component to render.                        |
| `dynamicAs`   | `boolean`                                                                                          | `false` | Set when `as` changes after the first render.          |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'`                         | `'md'`  | Font size and line height. Ignored with `inherit`.     |
| `color`       | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —       | Color role. Inherits the parent's color when omitted.  |
| `dimmed`      | `boolean`                                                                                          | `false` | Mutes the text (`--slp-color-muted-content`).          |
| `weight`      | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                                     | —       | Font weight. Inherited when omitted.                   |
| `align`       | `'start' \| 'center' \| 'end' \| 'justify'`                                                        | —       | Text alignment. Inherited when omitted.                |
| `tabularNums` | `boolean`                                                                                          | `false` | Digits of equal width.                                 |
| `transform`   | `'uppercase' \| 'lowercase' \| 'capitalize'`                                                       | —       | Changes the case; `uppercase` also spaces the letters. |
| `truncate`    | `boolean`                                                                                          | `false` | One line, with an ellipsis.                            |
| `lineClamp`   | `number`                                                                                           | —       | Cuts the text after this many lines.                   |
| `inherit`     | `boolean`                                                                                          | `false` | Takes font size and line height from the parent.       |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-text`. No slots.
- State and variant attributes on the root: `data-size` (absent with `inherit`), `data-color`, `data-dimmed`, `data-weight`, `data-align`, `data-tabular-nums`, `data-transform`, `data-truncate`, `data-line-clamp`, `data-inherit`.

Type scale tokens, set on `:root` in `slopkit.css`. Override them there or in a theme to change every Text (and the components that share the scale):

| Variable                         | Default                                              |
| -------------------------------- | ---------------------------------------------------- |
| `--slp-font-size-xs` … `-xl`     | `0.75rem`, `0.875rem`, `1rem`, `1.125rem`, `1.25rem` |
| `--slp-line-height-xs` … `-xl`   | `1rem`, `1.25rem`, `1.5rem`, `1.75rem`, `1.75rem`    |
| `--slp-font-size-2xl` … `-5xl`   | `1.5rem`, `1.875rem`, `2.25rem`, `3rem`              |
| `--slp-line-height-2xl` … `-5xl` | `2rem`, `2.25rem`, `2.5rem`, `3rem`                  |
