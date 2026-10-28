# Notifications

Show notifications from anywhere in the app. They stack in a corner of the screen and close on their own. `<Notifications>` is the region they appear in; `useNotifications()` and the `notifications` facade show them.

```tsx
import { Notifications, useNotifications, notifications } from '@solid-slopkit/components';
```

## Setup

Render the region once, inside `<SlopkitUi>`:

```tsx
<SlopkitUi>
  <App />
  <Notifications position="bottom-end" />
</SlopkitUi>
```

## Usage

```tsx
const notifications = useNotifications();

notifications.show({ title: 'Saved', message: 'Your changes are saved.', color: 'success', icon: <Check aria-hidden="true" /> });

// A long task: loading, then done.
const id = notifications.show({ title: 'Uploading', message: '3 files', loading: true });
await upload();
notifications.update(id, { title: 'Uploaded', loading: false, color: 'success' });

// Errors interrupt the screen reader.
notifications.show({ message: 'Not saved', color: 'error', role: 'alert' });
```

- **Hook:** `useNotifications()` returns `show(data) → id`, `update(id, data)`, `hide(id)`, `clean()` and `notifications` (an accessor of the list, shown and waiting, oldest first). It reaches the nearest `<SlopkitUi>`; a nested provider shares its root's notifications. It throws outside a provider.
- **Facade:** `notifications.show / update / hide / clean`, importable anywhere, such as a fetch helper. It forwards to the most recently mounted `<SlopkitUi>`, and back to the one before when that unmounts. On the server it does nothing (with a dev-mode warning): notifications are shown in the browser only. Inside components, prefer the hook.
- **Data:** `message` (required), and a [Notification](../notification/notification.md)'s look: `title`, `icon` (a circle of the color; a bar without one), `color`, `loading`. Plus `autoClose`, `withCloseButton` (default `true`), `closeButtonLabel`, `role: 'alert'`, `class`, `id`, `onOpen(id)`, `onClose(id)`.
- **Ids:** `show` returns a generated id, or the `id` you pass. Showing an id that's already shown updates it instead of adding another. `update` merges the fields you give.
- **Closing:** after `autoClose` milliseconds (the region's `4000` by default; `false` keeps it), when its close button is pressed, or with `hide(id)` / `clean()`. The countdown pauses while the pointer or focus is in the region, and a loading notification waits until it's done. `onClose` is called once it has gone.
- **Region:** a `section` named `Notifications` (`label`), fixed to `position` (`top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`), in the top layer as a manual popover that's always open. Presses go through it except on the notifications. At most `limit` (5) show at once; the rest wait their turn. One that arrives while a modal is open is drawn above it, but like the rest of the page outside the modal it can't be clicked until the modal closes (it still closes on its own).
- **Screen readers:** the list is a polite live region, so each new notification is announced once; `role: 'alert'` announces it at once.
- **Motion:** each grows in and fades in, and shrinks and fades out, so the others slide into place. Nothing moves under `prefers-reduced-motion`.
- Without a mounted `<Notifications>`, `show` warns in development and nothing appears.

## Props

`<Notifications>`; other props go to the `section`.

| Prop        | Type                                                                                            | Default           | Description                                  |
| ----------- | ----------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------- |
| `position`  | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'`    | Where they appear.                           |
| `limit`     | `number`                                                                                        | `5`               | How many show at once.                       |
| `autoClose` | `number \| false`                                                                               | `4000`            | How long each stays, unless it sets its own. |
| `label`     | `string`                                                                                        | `'Notifications'` | The region's accessible name.                |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-notifications` (the region), with `data-position`.
- Slots: `notifications-list` (the `ol`), `notifications-item` (each `li`, with `data-status`: `closed`, `starting`, `open`, `ending`), `notifications-item-body`.
- Each notification is a `.slp-notification`, styled as [Notification](../notification/notification.md); `class` in the data adds a class to it.
