# ScrollArea

A box that scrolls its content, with thin scrollbars drawn over it that look the same in every browser and color scheme.

```tsx
import { ScrollArea } from '@solid-slopkit/components';
```

## Usage

```tsx
<ScrollArea style={{ height: '250px' }}>
  <Text>Long content…</Text>
</ScrollArea>
```

- **Size:** give it a `height` or `max-height` with `style` or `class`. With `max-height` it grows with its content up to that height, then scrolls. Without either it's as tall as its content and only scrolls across. Across, it's as wide as its parent gives it; in a flex or grid item, give that item `min-width: 0`, or the item grows to the content's width instead of letting it scroll.
- **Scrolling:** the browser's own (wheel, touch, keys, find in page, `scrollIntoView`); its native scrollbars are hidden and thin ones are drawn over the edges instead. Drag a thumb to scroll, press the track to page toward the pointer; a wheel over a scrollbar scrolls the content.
- **Directions:** `scrollbars` is `x`, `y` or `xy` (default). The content is as wide as the box, and wider when something in it can't wrap; with `y` alone the overflow across is clipped. A scrollbar shows only along a direction whose content overflows.
- **When they show** (`type`): `hover` (default) while the pointer is over it or it scrolls; `scroll` only while it scrolls; `always`; `never` (it still scrolls). They fade out `scrollHideDelay` ms (default 800) after the pointer leaves or scrolling stops; a scrollbar under the pointer or being dragged stays.
- **Covering content:** the scrollbars sit over the content's edges. `offsetScrollbars` pads the content by `scrollbarSize` on the side of each scrollbar that's shown.
- **Keyboard:** the viewport takes a tab stop while it has something to scroll, so arrow keys and Page Up/Down scroll it; with nothing to scroll it takes none. The scrollbars are `aria-hidden`: the viewport is what assistive technology scrolls.
- **Scrolling from code:** `viewportRef` gives the scrolling element (`scrollTo`, `scrollTop`). `onScrollPositionChange` is called on each scroll with `{ x, y }` in px.
- **Server:** it renders with the scrollbars hidden; they're measured once hydrated, and again whenever the box or its content changes size.

## Props

Other props are passed to the root `div`.

| Prop                     | Type                                           | Default   | Description                                                   |
| ------------------------ | ---------------------------------------------- | --------- | ------------------------------------------------------------- |
| `type`                   | `'hover' \| 'scroll' \| 'always' \| 'never'`   | `'hover'` | When the scrollbars show.                                     |
| `scrollbars`             | `'x' \| 'y' \| 'xy'`                           | `'xy'`    | The directions it scrolls in.                                 |
| `scrollbarSize`          | `number`                                       | `10`      | Thickness of a scrollbar, in px.                              |
| `scrollHideDelay`        | `number`                                       | `800`     | How long the scrollbars stay after the pointer leaves, in ms. |
| `offsetScrollbars`       | `boolean`                                      | `false`   | Pads the content on the side of a shown scrollbar.            |
| `viewportRef`            | `Ref<HTMLDivElement>`                          | —         | The element that scrolls.                                     |
| `onScrollPositionChange` | `(position: { x: number; y: number }) => void` | —         | Called as it scrolls, with the scroll offsets in px.          |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-scroll-area`.
- Slots: `scroll-area-viewport` (the scroller), `scroll-area-content` (the content's box in it), `scroll-area-scrollbar` (one per direction, with `data-orientation="vertical" | "horizontal"`, and `data-dragging` while its thumb is dragged), `scroll-area-thumb`.
- Attributes on the root: `data-type`, `data-scrollbars`, `data-offset-scrollbars`, and `data-overflow-x`, `data-overflow-y` and `data-scrolling` while those hold.
- Custom property: `--slp-scroll-area-thumb-color` (default: the base content color); the thumb's idle, hover and pressed tints mix from it.
