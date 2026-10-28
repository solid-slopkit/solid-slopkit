# Indicator

Pins a dot or a small label to a corner or edge of its child. A `span` around the child.

```tsx
import { Indicator } from '@solid-slopkit/components';
```

## Usage

```tsx
<Indicator label={unread()} color="error">
  <Button aria-label={`Inbox, ${unread()} unread`} leftSection={<Inbox />}>
    Inbox
  </Button>
</Indicator>

<Indicator position="bottom-end" color="success" offset={4}>
  <Avatar src={user.photo} name={user.name} />
</Indicator>
```

- **Element:** a `span` that hugs its child and anchors the mark. Wrap one element: a Button, an Avatar, an icon.
- **Mark:** a dot without `label`; a pill with one, such as a count. It's centered on the chosen point and ringed in the surface color, so it stands apart from the child.
- **Position:** `top-start`, `top-center`, `top-end` (the default), `middle-start`, `middle-end`, `bottom-start`, `bottom-center` or `bottom-end`.
- **Offset:** moves the mark toward the child's center, in px. A round child, such as an Avatar, needs a few px so the mark sits on its edge rather than off its corner.
- **Color and size:** `color` takes a color role and defaults to `primary`. `size` from `xs` to `xl` sets the dot (6 to 14px) and the pill's height (14 to 22px).
- **Processing:** `processing` animates a ping around the mark, for something in progress. It doesn't move when the user asks for reduced motion.
- **Disabled:** `disabled` hides the mark and keeps the child.
- **Accessibility:** the mark is hidden from assistive technology: a count beside a button would be read without context. Put what it means in the child's accessible name, such as `aria-label="Inbox, 3 unread"`, or in a status message elsewhere.

## Props

Other props are passed to the root `span`.

| Prop         | Type                                                                                                                              | Default     | Description                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------- |
| `position`   | `'top-start' \| 'top-center' \| 'top-end' \| 'middle-start' \| 'middle-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'top-end'` | Where the mark sits on the child.        |
| `label`      | `JSX.Element`                                                                                                                     | —           | Content of the mark. A dot without one.  |
| `color`      | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'`                                | `'primary'` | Color role of the mark.                  |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                                            | `'md'`      | Size of the mark.                        |
| `offset`     | `number`                                                                                                                          | `0`         | Moves the mark toward the center, in px. |
| `processing` | `boolean`                                                                                                                         | `false`     | Animates a ping around the mark.         |
| `disabled`   | `boolean`                                                                                                                         | `false`     | Hides the mark.                          |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-indicator`.
- Slots: `[data-slot="indicator-mark"]`, the dot or pill. Its attributes: `data-position`, `data-color`, `data-size`, `data-with-label`, `data-processing`.
- The ring is the mark's `box-shadow`, in `--slp-color-base-100`. On another surface: `.slp-indicator [data-slot='indicator-mark'] { box-shadow: 0 0 0 2px var(--slp-color-base-200) }`.

CSS variables, set on the indicator or any ancestor:

| Variable                  | Default                            | Description                                |
| ------------------------- | ---------------------------------- | ------------------------------------------ |
| `--slp-indicator-color`   | `var(--slp-color-<color>)`         | Mark color. For a color that isn't a role. |
| `--slp-indicator-content` | `var(--slp-color-<color>-content)` | Label color on the mark.                   |
