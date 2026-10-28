# Overlay

A layer over its parent, such as behind a loader or a message.

```tsx
import { Overlay } from '@solid-slopkit/components';
```

## Usage

```tsx
<Paper style={{ position: 'relative' }}>
  <Text>Content under the layer</Text>
  <Show when={busy()}>
    <Overlay blur={2} center>
      <Loader />
    </Overlay>
  </Show>
</Paper>
```

- **Fills its parent:** a `div` with `position: absolute; inset: 0`, so give the parent `position: relative` (or any positioning). It covers the parent inside its border, and takes its rounded corners. `fixed` covers the viewport instead.
- **On top:** it has no `z-index`, so it covers what comes before it in the parent; render it last. Content that sets its own `z-index` can still show through: give the overlay one with `style` or a class.
- **Pointer only:** it catches clicks, so what's under it can't be pressed, but Tab still reaches it. To take that content out of use, make it `inert`.
- **Color:** black at `backgroundOpacity` (0 to 1, default 0.6) by default; `color` takes a color role instead, and `--slp-overlay-color` any color. The opacity is the color's only: its children stay opaque.
- **Blur:** `blur` (px) blurs what's behind it with a backdrop filter, only when it's set.
- **Children:** drawn on top of the layer; `center` centers them.
- **Showing and hiding:** render it while needed, with `<Show>`, or with [Transition](../../utilities/transition/transition.md) to fade it.

## Props

Other props are passed to the `div`.

| Prop                | Type        | Default | Description                                      |
| ------------------- | ----------- | ------- | ------------------------------------------------ |
| `color`             | `SlopColor` | —       | Color role of the layer. Without one it's black. |
| `backgroundOpacity` | `number`    | `0.6`   | Opacity of the layer's color, from 0 to 1.       |
| `blur`              | `number`    | `0`     | Blurs what's behind it, in px.                   |
| `fixed`             | `boolean`   | `false` | Covers the viewport instead of its parent.       |
| `center`            | `boolean`   | `false` | Centers its children on it.                      |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-overlay`.
- Attributes on it: `data-color`, `data-blur`, `data-fixed`, `data-center`.
- Public custom property: `--slp-overlay-color`, the layer's color before its opacity.
