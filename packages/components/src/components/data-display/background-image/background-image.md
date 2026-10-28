# BackgroundImage

A box with an image behind its content: a `div` whose background covers it.

```tsx
import { BackgroundImage } from '@solid-slopkit/components';
```

## Usage

```tsx
<BackgroundImage src="/hero.jpg" style={{ 'min-height': '16rem' }}>
  <Title order={2}>Ship faster</Title>
</BackgroundImage>
```

- **Element:** a `div`. Its children sit on top of the image. It has no size of its own: its content, a `min-height` or the layout around it sizes it.
- **Image:** covers the box and stays centered, whatever the box's size, so the edges are cropped. Change that with the style prop or a selector, e.g. `style={{ 'background-size': 'contain' }}`. Your `background-*` styles win. The `background` shorthand resets the image too, so set a fallback color with `background-color`.
- **URL:** any URL. It's quoted for CSS, with quotes and backslashes escaped, so a file name with a space or a quote works.
- **Accessibility:** a background image has no text alternative, so it should be decorative. When the picture carries meaning, use an [Image](../image/image.md), or give the box `role="img"` and an `aria-label` when it holds no content.
- **Readable text on top:** the image can be light or dark anywhere. Put the text on a surface of its own, or lay a gradient between, such as a child with `background: linear-gradient(transparent, rgb(0 0 0 / 0.6))`.

## Props

Other props are passed to the `div`.

| Prop  | Type     | Default | Description              |
| ----- | -------- | ------- | ------------------------ |
| `src` | `string` | —       | The image URL. Required. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-background-image`. No slots.
- The image is the root's `background-image`; `background-size: cover`, `background-position: center` and `background-repeat: no-repeat` are set, and each can be overridden with a selector or the style prop.
