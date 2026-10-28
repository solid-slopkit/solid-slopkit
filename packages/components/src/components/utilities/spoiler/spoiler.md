# Spoiler

Content cut to a height, with a control under it that shows the rest and hides it again.

```tsx
import { Spoiler } from '@solid-slopkit/components';
```

## Usage

```tsx
<Spoiler maxHeight={120}>
  <Text>A long description…</Text>
</Spoiler>
```

- **Height:** collapsed, the content is cut to `maxHeight` (px, default 100) and fades out at the bottom. Expanded, it's as tall as its content. The height animates in 200ms; under `prefers-reduced-motion: reduce` it changes at once.
- **Control:** an [Anchor](../../typography/anchor/anchor.md) rendered as a `button` under the content, with `aria-expanded` and `aria-controls`. Its text is `showLabel` (default `Show more`) or `hideLabel` (default `Show less`).
- **Content that fits:** isn't cut and has no control. The content is measured once hydrated and whenever its size changes, so the control appears and goes as it grows and shrinks. The server render counts it as too tall: the control is there, so the rest can be reached as soon as the page is interactive.
- **State:** uncontrolled by default (`defaultExpanded`, read once). For a controlled one, pass `expanded` and update it from `onChange`, which is called with the state asked for.
- **Focus:** the cut content stays in the tab order and the accessibility tree. When focus goes to something below the fold, it expands (through `onChange` when controlled), so the focused element is never hidden. Screen readers read all of it, collapsed or not.
- The content box clips (`overflow: clip`) rather than scrolling, so nothing can scroll it out of place.

## Props

Other props are passed to the root `div`.

| Prop              | Type                          | Default       | Description                                          |
| ----------------- | ----------------------------- | ------------- | ---------------------------------------------------- |
| `maxHeight`       | `number`                      | `100`         | Height of the content while collapsed, in px.        |
| `expanded`        | `boolean`                     | —             | Whether it's expanded, when controlled.              |
| `defaultExpanded` | `boolean`                     | `false`       | Whether it starts expanded, when uncontrolled.       |
| `onChange`        | `(expanded: boolean) => void` | —             | Called with the state the control or focus asks for. |
| `showLabel`       | `string`                      | `'Show more'` | The control's text while collapsed.                  |
| `hideLabel`       | `string`                      | `'Show less'` | The control's text while expanded.                   |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-spoiler`; the control also has `.slp-anchor`.
- Slots: `spoiler-content` (the box that's cut), `spoiler-body` (the content inside it, which is measured), `spoiler-control`.
- Attributes on the root: `data-expanded`, and `data-overflowing` while the content is taller than `maxHeight`.
- Retime it with a selector: `.slp-spoiler [data-slot='spoiler-content'] { transition-duration: 400ms }`. Drop the fade with `mask-image: none` on the same slot.
