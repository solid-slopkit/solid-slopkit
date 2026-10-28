# Mark

Highlighted text: a `mark`, tinted with a color role.

```tsx
import { Mark } from '@solid-slopkit/components';
```

## Usage

```tsx
<Text>
  Results for <Mark>theme</Mark>: a <Mark>theme</Mark> sets every token.
</Text>

<Text>
  The build <Mark color="success">passed</Mark>, but two tests <Mark color="error">failed</Mark>.
</Text>
```

- **Element:** a `mark`, for text that's highlighted because it's relevant here, such as a search match. For importance, use `strong`; for decoration, CSS.
- **Color:** `color` takes a color role and defaults to `warning`. The background is a translucent tint of the role and the text keeps the color around it, so a mark reads on any surface and in both color schemes.
- **Wrapping:** a mark that spans several lines gets its padding and rounded corners on every line.
- **Screen readers:** most don't announce a `mark`. When the highlight carries meaning, say it in the text too.

## Props

Other props are passed to the `mark`.

| Prop    | Type                                                                                               | Default     | Description             |
| ------- | -------------------------------------------------------------------------------------------------- | ----------- | ----------------------- |
| `color` | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'warning'` | Color role of the tint. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-mark`. No slots.
- State and variant attributes on the root: `data-color`.

CSS variables, set on the mark or any ancestor:

| Variable           | Default                    | Description                                                                    |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------ |
| `--slp-mark-color` | `var(--slp-color-<color>)` | The color the tint is made from, at 30%. Use it for a color that isn't a role. |

```tsx
<Mark style={{ '--slp-mark-color': '#e64980' }}>pink</Mark>
```
