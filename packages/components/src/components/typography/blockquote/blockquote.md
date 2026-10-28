# Blockquote

A quotation set off from the text: a `figure` with the `blockquote` and its attribution.

```tsx
import { Blockquote } from '@solid-slopkit/components';
```

## Usage

```tsx
<Blockquote attribution="— Ada Lovelace" cite="https://example.com/notes">
  The engine weaves algebraic patterns, just as the loom weaves flowers and leaves.
</Blockquote>

<Blockquote color="primary">
  <Stack gap={2}>
    <Text>First paragraph.</Text>
    <Text>Second paragraph.</Text>
  </Stack>
</Blockquote>
```

- **Elements:** a `figure` holds the `blockquote` and, with `attribution`, a `figcaption` below it. The attribution stays outside the `blockquote`, so it isn't read as part of the quote.
- **Attribution:** any content, such as a name and a linked source. Write the dash yourself if you want one (`— Ada Lovelace`). It's 0.875em and muted.
- **Cite:** `cite` is the URL of the source, set as the `blockquote`'s `cite` attribute. Browsers don't show it; link the source in `attribution` for readers.
- **Color:** a 4px bar on the start side. `color` takes a color role; without it the bar is the base text color at 20%.
- **Content:** a string, or block content such as Text paragraphs in a Stack. The first and last child's outer margins are removed, so a plain `p` sits flush too. Blockquote has no margin; space it with a Stack.

## Props

Other props are passed to the `figure`.

| Prop          | Type                                                                                               | Default | Description                                         |
| ------------- | -------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------- |
| `attribution` | `JSX.Element`                                                                                      | —       | Who said it, shown below the quote.                 |
| `cite`        | `string`                                                                                           | —       | URL of the source, on the `blockquote`.             |
| `color`       | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —       | Color role of the bar. Muted text color if omitted. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-blockquote`, on the `figure`.
- Slots: `[data-slot="blockquote-quote"]` (the `blockquote`), `[data-slot="blockquote-attribution"]` (the `figcaption`).
- State and variant attributes on the root: `data-color`.
- The bar is the root's `border-inline-start`. For a thicker one, `.slp-blockquote { border-inline-start-width: 6px }`.
