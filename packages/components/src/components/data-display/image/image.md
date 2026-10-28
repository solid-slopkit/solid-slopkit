# Image

An image: an `img` that fills its box and can fall back to another source when it fails to load.

```tsx
import { Image } from '@solid-slopkit/components';
```

## Usage

```tsx
<Image src="/cover.jpg" alt="A mountain at dawn" />

<Image src={user.photo} alt="" fallbackSrc="/avatar-placeholder.png" width={96} height={96} />

<Image src="/logo.svg" alt="slopkit" fit="contain" style={{ height: '4rem' }} />
```

- **Element:** an `img`. `alt` is required: describe the picture, or pass `alt=""` for a decorative one. The native attributes pass through: `width`, `height`, `loading`, `decoding`, `srcset`, `sizes`.
- **Box:** a block that never gets wider than its container. With only a width, or neither, the picture keeps its own aspect ratio.
- **Fit:** when a width and a height give the box another aspect ratio, `fit` decides how the picture fills it (`object-fit`). `cover` (the default) fills the box and crops; `contain` shows all of it, leaving space; `fill` stretches; `none` keeps the natural size; `scale-down` is the smaller of `none` and `contain`.
- **Fallback:** when `src` fails to load, `fallbackSrc` is shown instead, and the image gets `data-fallback`. A failing fallback isn't retried. A new `src` gets its own try. Your `onError` still runs.
- **Server rendering:** an image that fails before hydration attaches its error listener still falls back once the page hydrates.
- For a fixed aspect ratio, put the Image in an AspectRatio and give it `style={{ width: '100%', height: '100%' }}`. Corners are a selector away: `.slp-image { border-radius: 8px }`.

## Props

Other props are passed to the `img`.

| Prop          | Type                                                       | Default   | Description                                      |
| ------------- | ---------------------------------------------------------- | --------- | ------------------------------------------------ |
| `src`         | `string`                                                   | —         | The image URL.                                   |
| `alt`         | `string`                                                   | —         | Text alternative. Required; `""` for decoration. |
| `fit`         | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | How the picture fills a box of another ratio.    |
| `fallbackSrc` | `string`                                                   | —         | Shown instead of `src` when it fails to load.    |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-image`. No slots.
- State and variant attributes on the root: `data-fit`, `data-fallback` (while the fallback is shown).
