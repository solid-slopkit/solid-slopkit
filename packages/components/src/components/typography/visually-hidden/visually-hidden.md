# VisuallyHidden

Content that screen readers announce but the page doesn't show: a `span` by default, or any element with `as`.

```tsx
import { VisuallyHidden } from '@solid-slopkit/components';
```

## Usage

```tsx
<button type="button">
  <XIcon aria-hidden="true" />
  <VisuallyHidden>Close</VisuallyHidden>
</button>

<Badge>
  3 <VisuallyHidden>unread messages</VisuallyHidden>
</Badge>

<section aria-labelledby="results">
  <VisuallyHidden as="h2" id="results">Search results</VisuallyHidden>
  …
</section>
```

- **What it's for:** text that the layout already says visually, such as an icon's meaning, the unit after a number, or a heading for a section whose purpose is clear on screen. Screen readers read it, and it names the control it sits in.
- **How it hides:** the element is clipped to nothing and taken out of the flow, so it takes no space. It stays rendered, which keeps it in the accessibility tree; `display: none` or `hidden` would remove it from there too.
- **Element:** a `span`, which fits anywhere text does. For block content or a heading, pass `as` (`'div'`, `'h2'`, …). `as` is read once; set `dynamicAs` to change it later.
- **Not for focusable content:** a link or button inside stays hidden when it gets focus, so a keyboard user would lose sight of where they are. Name the control with `aria-label` or put the hidden text inside it instead.
- **`aria-label` instead:** on a control with no visible text, `aria-label` does the same job. VisuallyHidden is for text that's part of the content, such as a hidden heading or the end of a sentence, and it gets translated with the page.

## Props

Other props are passed to the element.

| Prop        | Type             | Default  | Description                                   |
| ----------- | ---------------- | -------- | --------------------------------------------- |
| `as`        | `ValidComponent` | `'span'` | Element or component to render.               |
| `dynamicAs` | `boolean`        | `false`  | Set when `as` changes after the first render. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins: an app rule that sets `position`, `clip-path` or `overflow` on the same element can make it show.

- Root class: `.slp-visually-hidden`. No slots, no state attributes.
