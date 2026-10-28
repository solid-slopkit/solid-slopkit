# LoadingOverlay

Covers its parent while something in it loads: an [Overlay](../overlay/overlay.md) with a [Loader](../../feedback/loader/loader.md) centered on it.

```tsx
import { LoadingOverlay } from '@solid-slopkit/components';
```

## Usage

```tsx
<Paper style={{ position: 'relative' }}>
  <form inert={saving()}>…</form>
  <LoadingOverlay visible={saving()} label="Saving the project" />
</Paper>
```

- **Fills its parent:** like Overlay, it fills the nearest positioned ancestor inside its border, with its rounded corners, so give the parent `position: relative`. Render it last in the parent. Other props go to its `div`.
- **Showing:** `visible`; it fades in and out (`transitionDuration`, ms, default 150) and is rendered only while shown. None under `prefers-reduced-motion`.
- **Pointer only:** it catches clicks, but Tab still reaches what's under it. Make the covered content `inert` while it's shown, as above, or disable its controls.
- **Loader:** a `primary` spinner of size `md`, named by `label` (`'Loading'` by default), which is announced when it appears. `loaderVariant`, `loaderSize` and `loaderColor` change it; `loader` replaces it with anything, such as a message.
- **Layer:** the base surface color at `backgroundOpacity` (0 to 1, default 0.7), so the content shows through faintly in both color schemes, with `blur` (px, default 2). `--slp-overlay-color` sets another color.

## Props

| Prop                 | Type            | Default     | Description                                |
| -------------------- | --------------- | ----------- | ------------------------------------------ |
| `visible`            | `boolean`       | —           | Whether it's shown.                        |
| `label`              | `string`        | `'Loading'` | The loader's accessible name.              |
| `loaderVariant`      | `LoaderVariant` | `'spinner'` | Shape of the loader.                       |
| `loaderSize`         | `SlopSize`      | `'md'`      | Size of the loader.                        |
| `loaderColor`        | `SlopColor`     | `'primary'` | Color role of the loader.                  |
| `loader`             | `JSX.Element`   | —           | Replaces the loader.                       |
| `backgroundOpacity`  | `number`        | `0.7`       | Opacity of the layer's color, from 0 to 1. |
| `blur`               | `number`        | `2`         | Blurs what's behind it, in px.             |
| `transitionDuration` | `number`        | `150`       | Duration of the fade, in ms.               |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-loading-overlay`, on the Overlay (which is also `.slp-overlay`).
- Attributes on it: Overlay's (`data-blur`, `data-center`), and `data-status` and `data-transition` while it fades.
- Slot: `[data-slot="loading-overlay-loader"]`, the default Loader.
- Public custom property: `--slp-overlay-color`, the layer's color before its opacity.
