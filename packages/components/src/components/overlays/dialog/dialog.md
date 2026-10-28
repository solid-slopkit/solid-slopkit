# Dialog

A small window in a corner of the viewport that leaves the page usable, such as a feedback prompt or a chat: a non-modal `role="dialog"` in the browser's top layer.

```tsx
import { Dialog } from '@solid-slopkit/components';
```

## Usage

```tsx
<Dialog opened={opened()} onClose={() => setOpened(false)} aria-label="Feedback">
  <TextInput label="Your feedback" />
</Dialog>
```

- **Not modal:** the page under it stays usable. It doesn't move focus when it opens or keep it inside; Tab reaches it where it is in the document. For a dialog that blocks the page, use [Modal](../modal/modal.md).
- **Element:** a `div` with `role="dialog"` and `popover="manual"`, rendered while open (and while its exit animation runs). Name it with `aria-label` or `aria-labelledby`. Other props go to the `div`.
- **State:** controlled: `opened`, and `onClose`, which the close button and Escape call. Set `opened` to `false` there.
- **Closing:** the close button in its top end corner (`withCloseButton`, default `true`; `closeButtonLabel`, default `'Close'`), and Escape while focus is inside it (`closeOnEscape`, default `true`), not from elsewhere on the page. With an overlay open inside it, such as a menu, Escape closes that one first.
- **Position:** `position` is a corner (`top-left`, `top-right`, `bottom-left`, `bottom-right`) or the middle of the top or bottom edge (`top`, `bottom`); default `bottom-right`. `offset` is the gap to the edges (px, default 16).
- **Size:** `size` is its width, `xs` to `xl` (16, 18, 20, 26, 32rem; default `md`), never past the viewport.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets; it fades up at the bottom and down at the top by default. `transitionDuration` (ms, default 200). None under `prefers-reduced-motion`.
- **Server:** a closed dialog renders nothing; an open one renders its `div`, which is shown once hydrated. It doesn't need a `<SlopkitUi>`.

## Props

| Prop                 | Type             | Default          | Description                                     |
| -------------------- | ---------------- | ---------------- | ----------------------------------------------- |
| `opened`             | `boolean`        | —                | Whether it is shown.                            |
| `onClose`            | `() => void`     | —                | Called when it asks to close.                   |
| `position`           | `DialogPosition` | `'bottom-right'` | Where it sits.                                  |
| `offset`             | `number`         | `16`             | Gap to the viewport's edges, in px.             |
| `size`               | `SlopSize`       | `'md'`           | Width, from 16 to 32rem.                        |
| `withCloseButton`    | `boolean`        | `true`           | Shows a close button in its corner.             |
| `closeButtonLabel`   | `string`         | `'Close'`        | Accessible name of the close button.            |
| `closeOnEscape`      | `boolean`        | `true`           | Whether Escape closes it while focus is inside. |
| `transition`         | `TransitionName` | by position      | Its animation.                                  |
| `transitionDuration` | `number`         | `200`            | Duration of the animation, in ms.               |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-dialog`.
- Attributes on it: `data-position`, `data-size`, `data-with-close-button`, `data-status`, `data-transition`.
- Slot: `[data-slot="dialog-close"]`.
