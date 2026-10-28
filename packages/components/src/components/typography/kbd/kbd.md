# Kbd

A keyboard key: a `kbd`, drawn as a keycap.

```tsx
import { Kbd } from '@solid-slopkit/components';
```

## Usage

```tsx
<Text>
  Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.
</Text>

<Kbd size="lg">Esc</Kbd>
```

- **Element:** a `kbd`, so assistive technology reads its text as it is. One Kbd is one key; for a shortcut, put the keys next to each other with a separator such as `+` between them.
- **Size:** without `size`, a Kbd scales with the text around it (0.85em), so it fits a Text or Title of any size. `size` (`xs` to `xl`) sets a fixed font size from the type scale instead.
- **Look:** monospace (`--slp-font-family-monospace`), bold, on the base surface with a thicker bottom border. A single character is at least as wide as it is tall.

## Props

Other props are passed to the `kbd`.

| Prop   | Type                                   | Default | Description                                                   |
| ------ | -------------------------------------- | ------- | ------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | —       | Fixed font size. Scales with the surrounding text if omitted. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-kbd`. No slots.
- State and variant attributes on the root: `data-size` (absent without `size`).
- The font is `--slp-font-family-monospace`, set on `:root` in `slopkit.css`. Override it there to change the font of every key.
