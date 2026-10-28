# Badge

A short label for a status, a category or a count: a `span`.

```tsx
import { Badge } from '@solid-slopkit/components';
```

## Usage

```tsx
<Badge color="success">Active</Badge>
<Badge color="warning" variant="soft">Pending</Badge>
<Badge variant="outline">Draft</Badge>
<Badge color="error" circle>3</Badge>
```

- **Element:** a `span` with no role, so assistive technology reads its text in line. Make that text make sense in context: `Inbox <Badge>3</Badge>` reads "Inbox 3". Badge is not interactive; for a clickable one, use a Button.
- **Variants:** `solid` (the default), `soft` (a light tint of the color), `outline` and `dash` (a dashed outline). Outline and dash borders are half the color, or a faint base border without one.
- **Colors:** `color` takes a color role. Without it the badge uses the base colors. Every variant works with every color.
- **Sizes:** `xs` to `xl`, 16 to 28px tall. Heights are multiples of `--slp-size-selector`.
- **Circle:** `circle` makes a badge for a single digit or character round. A longer count, like `99+`, grows into a pill.
- **Sections:** `leftSection` and `rightSection` place content, usually icons, around the label. Icons are sized to match the badge.
- **Long labels:** the label stays on one line. In a container narrower than the badge, the badge shrinks and the label ends with an ellipsis.

```tsx
<Badge color="success" variant="soft" leftSection={<Check aria-hidden="true" />}>
  Verified
</Badge>
```

## Props

Other props are passed to the `span`.

| Prop           | Type                                                                                               | Default   | Description                                         |
| -------------- | -------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------- |
| `variant`      | `'solid' \| 'soft' \| 'outline' \| 'dash'`                                                         | `'solid'` | Visual style.                                       |
| `color`        | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —         | Color role. Base colors when omitted.               |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`    | Size.                                               |
| `circle`       | `boolean`                                                                                          | `false`   | Round for a single character; a longer count grows. |
| `leftSection`  | `JSX.Element`                                                                                      | —         | Content before the label.                           |
| `rightSection` | `JSX.Element`                                                                                      | —         | Content after the label.                            |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-badge`.
- Slots: `[data-slot="badge-label"]`, the span around the children. Sections are direct children of the root, before and after it.
- State and variant attributes on the root: `data-variant`, `data-color`, `data-size`, `data-circle`.

CSS variables, set on the badge or any ancestor. A value that maps to one declaration, such as the corner radius, has no variable: use a selector (`.slp-badge { border-radius: 4px }`).

| Variable              | Default                            | Description                                                                                                                |
| --------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--slp-badge-color`   | `var(--slp-color-<color>)`         | Accent color: the background for solid, text and border for outline and dash, text and tint for soft. For a one-off color. |
| `--slp-badge-content` | `var(--slp-color-<color>-content)` | Text color on a solid accent background.                                                                                   |

```tsx
<Badge style={{ '--slp-badge-color': '#7048e8', '--slp-badge-content': '#fff' }}>Brand</Badge>
```
