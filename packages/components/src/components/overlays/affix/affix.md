# Affix

Pins its content to a spot in the viewport, such as a button back to the top.

```tsx
import { Affix } from '@solid-slopkit/components';
```

## Usage

```tsx
<Affix position="bottom-right">
  <Transition mounted={scrolled()} transition="fade-up">
    {(transition) => (
      <Button {...transition} onClick={() => window.scrollTo({ top: 0 })}>
        Back to top
      </Button>
    )}
  </Transition>
</Affix>
```

- **Element:** a `div` with `popover="manual"`, shown in the browser's top layer as soon as it's mounted. It stays fixed to the viewport whatever its parents' transforms or overflow, and sits above the page without a `z-index`. A modal opened later still covers it. Other props go to the `div`.
- **Position:** `position` is a corner (`top-left`, `top-right`, `bottom-left`, `bottom-right`) or the middle of the top or bottom edge (`top`, `bottom`); default `bottom-right`. `offset` is the gap to the edges (px, default 20).
- **Size:** as big as its content, so only its content catches the pointer.
- **Focus:** Tab reaches its content where the Affix is in the document.
- **Showing and hiding:** it's always shown while mounted; put a [Transition](../../utilities/transition/transition.md) inside it to animate its content in and out.
- **Server:** it renders in place, hidden, and is shown once hydrated.

## Props

Other props are passed to the `div`.

| Prop       | Type            | Default          | Description                         |
| ---------- | --------------- | ---------------- | ----------------------------------- |
| `position` | `AffixPosition` | `'bottom-right'` | Where it's pinned.                  |
| `offset`   | `number`        | `20`             | Gap to the viewport's edges, in px. |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-affix`.
- Attribute on it: `data-position`.
