# Divider

A thin line between content: an `hr`, horizontal or vertical.

```tsx
import { Divider } from '@solid-slopkit/components';
```

## Usage

```tsx
<Stack>
  <Text>Account</Text>
  <Divider />
  <Text>Billing</Text>
</Stack>

<Group gap={3}>
  <Anchor href="/docs">Docs</Anchor>
  <Divider orientation="vertical" />
  <Anchor href="/blog">Blog</Anchor>
</Group>
```

- **Element:** always an `hr`, so assistive technology announces it as a separator. A vertical one also gets `aria-orientation="vertical"`. A purely decorative line can take `aria-hidden="true"`.
- **Orientation:** `horizontal` (the default) fills the width of its container, also in a Stack that centers its items. `vertical` is as tall as its row in a flex container (Group, Flex), and 1em tall next to inline content in a `div`. HTML doesn't allow an `hr` inside a `p`, so put a vertical divider in a row or a `div`, not in a paragraph.
- **Variant:** `solid` (the default), `dashed` or `dotted`.
- **Color:** `color` takes a color role. Without it, the line is the base text color at 12%, the same as Card's borders.
- **Thickness:** 1px. Divider has no margin; space it with the gap of a Stack or Group.
- Divider has no label. For a line with text in it, put two Dividers and a Text with `style={{ 'flex-shrink': '0' }}` in a Group with `wrap="nowrap"`: the Dividers share the space the text leaves.

## Props

Other props are passed to the `hr`.

| Prop          | Type                                                                                               | Default        | Description                                |
| ------------- | -------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------ |
| `orientation` | `'horizontal' \| 'vertical'`                                                                       | `'horizontal'` | Direction of the line.                     |
| `variant`     | `'solid' \| 'dashed' \| 'dotted'`                                                                  | `'solid'`      | Line style.                                |
| `color`       | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —              | Color role. Muted text color when omitted. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-divider`. No slots.
- State and variant attributes on the root: `data-orientation`, `data-variant`, `data-color`.
- The line is a border: `border-top` when horizontal, `border-inline-start` when vertical. For a thicker line, set its width with a selector, e.g. `.slp-divider { border-top-width: 2px }`.
