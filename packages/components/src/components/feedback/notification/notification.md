# Notification

A short message about something that happened: a card with `role="status"`, a title, and an icon or a colored bar. The look only: [Notifications](../notifications/notifications.md) shows, stacks and dismisses them.

```tsx
import { Notification } from '@solid-slopkit/components';
```

## Usage

```tsx
<Notification title="Saved">Your changes are saved.</Notification>

<Notification color="success" icon={<Check aria-hidden="true" />} title="Deployed">
  Version 0.0.1 is live.
</Notification>

<Notification loading title="Uploading">
  3 of 5 files
</Notification>
```

- **Element:** a `div` with `role="status"`, so a notification that appears is announced politely, without interrupting. For an error the reader must hear at once, pass `role="alert"`.
- **Look:** a card on the surface color, with a border and a shadow, so it reads as floating above the page. The text keeps the base colors.
- **Color:** `color` takes a color role and defaults to `primary`. Without an icon, a bar of the color runs down the start edge; with one, the icon sits in a circle of the color. Mark the icon `aria-hidden="true"`: the text carries the meaning.
- **Icon or bar:** passing the `icon` prop at all chooses the circle, even as `icon={undefined}`; leave the prop out for the bar. The icon is created only while it's shown, so a notification that starts out loading doesn't build an icon it won't show.
- **Loading:** `loading` shows a Loader in place of the icon, in the color, and sets `aria-busy`. When it ends, the icon (or the bar) comes back.
- **Showing and dismissing:** Notification is only the card. To show notifications from anywhere, stacked in a corner and closing on their own, use [Notifications](../notifications/notifications.md) (`useNotifications()`). To place one yourself, put it where it should appear and remove it when it's done. Passing `onClose` shows a [CloseButton](../../button/close-button/close-button.md) at the end edge, and pressing it calls `onClose`; the notification doesn't remove itself. `closeButtonLabel` names the button for screen readers, `'Close'` by default.

## Props

Other props, such as `role`, are passed to the `div`.

| Prop               | Type                                                                                               | Default     | Description                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `title`            | `JSX.Element`                                                                                      | —           | A short heading above the message.                               |
| `icon`             | `JSX.Element`                                                                                      | —           | An icon in a circle of the color. A bar if the prop is left out. |
| `color`            | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color role of the circle or the bar.                             |
| `loading`          | `boolean`                                                                                          | `false`     | Shows a Loader in place of the icon; sets `aria-busy`.           |
| `onClose`          | `() => void`                                                                                       | —           | Shows a close button, and is called when it's pressed.           |
| `closeButtonLabel` | `string`                                                                                           | `'Close'`   | Accessible name of the close button.                             |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-notification`.
- Slots: `[data-slot="notification-icon"]` (the circle, or the Loader while loading), `[data-slot="notification-content"]`, `[data-slot="notification-title"]`, `[data-slot="notification-message"]`, `[data-slot="notification-close-button"]` (a CloseButton).
- State and variant attributes on the root: `data-color`, `data-loading`.
- The bar is the root's `::before`, drawn when there's no icon slot.

CSS variables, set on the notification or any ancestor:

| Variable                     | Default                            | Description                                          |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `--slp-notification-color`   | `var(--slp-color-<color>)`         | Bar and circle color. For a color that isn't a role. |
| `--slp-notification-content` | `var(--slp-color-<color>-content)` | Icon color in the circle.                            |
