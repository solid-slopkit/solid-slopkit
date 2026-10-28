# Code

Code in a monospace font: inline `code`, or a `pre` block with `block`.

```tsx
import { Code } from '@solid-slopkit/components';
```

## Usage

```tsx
<Text>
  Run <Code>pnpm install</Code> first.
</Text>

<Code block>{`import { Code } from '@solid-slopkit/components';

export const answer = 42;`}</Code>
```

- **Inline:** a `code` element on the base surface, sized at 0.85em, so it fits text of any size.
- **Block:** `block` renders a `pre` with a `code` inside. It keeps line breaks and indentation, and a long line scrolls sideways instead of wrapping. Pass the source as a string, in a template literal for several lines: JSX collapses whitespace in plain text children. HTML doesn't allow a `pre` inside a `p`, so put a block in a Stack or a `div`, not in a Text.
- **Keyboard:** a block has `tabindex={0}`, so keyboard users can focus it and scroll a long line with the arrow keys; not every supported browser does that for scrollers on its own. Pass `tabindex={-1}` to drop the tab stop when the block can't scroll.
- Code doesn't highlight syntax. Its children can be any elements, so highlighted markup from a highlighter goes inside a block as it is.

## Props

Other props are passed to the `code` (inline) or the `pre` (block).

| Prop       | Type      | Default | Description                                                |
| ---------- | --------- | ------- | ---------------------------------------------------------- |
| `block`    | `boolean` | `false` | A `pre` block that keeps line breaks and scrolls sideways. |
| `tabindex` | `number`  | `0`     | Block only. The tab stop that lets the keyboard scroll it. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-code`, on the `code` (inline) or the `pre` (block).
- Slots: `[data-slot="code-content"]`, the `code` inside a block. It inherits the font from the `pre`, which draws the surface.
- State and variant attributes on the root: `data-block`.
- The font is `--slp-font-family-monospace`, set on `:root` in `slopkit.css`.
