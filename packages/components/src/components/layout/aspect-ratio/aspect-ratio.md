# AspectRatio

Keeps its child at a width-to-height ratio, filling the available width. Use it for images, videos and embeds whose height should follow their width.

```tsx
import { AspectRatio } from '@solid-slopkit/components';
```

## Usage

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="/landscape.jpg" alt="Mountains at sunset" />
</AspectRatio>

<AspectRatio ratio={16 / 9}>
  <iframe src="https://www.youtube.com/embed/…" title="Video" />
</AspectRatio>
```

- **Ratio:** `ratio` is width divided by height, e.g. `16 / 9`. The default is `1`. It is not responsive.
- **Children:** the ratio and `width: 100%` are set on each child, not on the wrapper, so an `img`, `video`, `iframe` or any other element gets it directly. Images and videos are cropped to fit (`object-fit: cover`).
- **Width:** AspectRatio fills the width it is given (`max-width: 100%`). As a flex item, or anywhere else it would shrink to its content, give it a width.

```tsx
<Flex>
  <AspectRatio ratio={1} style={{ width: '8rem' }}>
    <img src="/avatar.jpg" alt="" />
  </AspectRatio>
</Flex>
```

- **Style props:** only `ratio`. AspectRatio does not take Box's spacing, size or display props.

## Props

Other props are passed to the rendered `div`.

| Prop    | Type     | Default | Description                             |
| ------- | -------- | ------- | --------------------------------------- |
| `ratio` | `number` | `1`     | Width divided by height, e.g. `16 / 9`. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-aspect-ratio`. The child rules use zero-specificity selectors, so a child's own classes win over them, e.g. to replace `object-fit: cover`.
