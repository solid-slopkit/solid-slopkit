# Alert

A message that needs the reader's attention: a `div` with `role="alert"`, an optional icon and title, and a close button with `onClose`.

```tsx
import { Alert } from '@solid-slopkit/components';
```

## Usage

```tsx
<Alert color="error" title="Payment failed" icon={<CircleAlert aria-hidden="true" />}>
  Your card was declined. Try another card or contact your bank.
</Alert>

<Alert color="success" variant="outline" role="status">
  Your changes are saved.
</Alert>

<Show when={open()}>
  <Alert color="warning" title="Unsaved changes" onClose={() => setOpen(false)}>
    You have changes that aren't saved yet.
  </Alert>
</Show>
```

- **Element:** a `div` with `role="alert"`, so an alert that appears after something the user did, such as a failed form submit, is announced right away. Change the role for other cases: `role="status"` for a polite update, such as "Saved", or `role="note"` for information that's on the page from the start.
- **Content:** `title`, a short line above the message, and the children, the message. The message takes text or block content; the outer margins of its first and last child are removed.
- **Icon:** `icon` goes on the start side, centered on the first line. Mark it `aria-hidden="true"`: the text carries the meaning.
- **Color:** `color` takes a color role and defaults to `info`.
- **Variants:** `soft` (the default) is a light tint with an edge; `outline` only the edge; `solid` fills the box with the role. In `soft` and `outline` the role color is in the icon and the edge, and the text keeps the base color, so it stays readable whatever the role.
- **Dismissing:** passing `onClose` shows a [CloseButton](../../button/close-button/close-button.md) at the end edge, centered on the first line, and pressing it calls `onClose`. The alert doesn't remove itself: render it conditionally and hide it there. `closeButtonLabel` names the button for screen readers, `'Close'` by default.
- Alert has no margin; space it with a Stack.

## Props

Other props, such as `role`, are passed to the `div`.

| Prop               | Type                                                                                               | Default   | Description                                            |
| ------------------ | -------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------ |
| `title`            | `JSX.Element`                                                                                      | —         | A short heading above the message.                     |
| `icon`             | `JSX.Element`                                                                                      | —         | An icon on the start side.                             |
| `color`            | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'info'`  | Color role.                                            |
| `variant`          | `'soft' \| 'solid' \| 'outline'`                                                                   | `'soft'`  | Visual style.                                          |
| `onClose`          | `() => void`                                                                                       | —         | Shows a close button, and is called when it's pressed. |
| `closeButtonLabel` | `string`                                                                                           | `'Close'` | Accessible name of the close button.                   |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-alert`.
- Slots: `[data-slot="alert-icon"]`, `[data-slot="alert-content"]` (title and message), `[data-slot="alert-title"]`, `[data-slot="alert-message"]`, `[data-slot="alert-close-button"]` (a CloseButton).
- State and variant attributes on the root: `data-color`, `data-variant`, `data-with-icon`.

CSS variables, set on the alert or any ancestor:

| Variable              | Default                            | Description                                                            |
| --------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `--slp-alert-color`   | `var(--slp-color-<color>)`         | Accent color: tint, edge and icon, or the background of a solid alert. |
| `--slp-alert-content` | `var(--slp-color-<color>-content)` | Text color on a solid alert.                                           |
