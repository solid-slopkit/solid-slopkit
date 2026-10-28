# Modal

A dialog over the page: a modal `<dialog>` in the browser's top layer, which makes the rest of the page inert and keeps focus inside.

```tsx
import { Modal } from '@solid-slopkit/components';
```

## Usage

```tsx
const [opened, setOpened] = createSignal(false);

<Button onClick={() => setOpened(true)}>Edit profile</Button>
<Modal opened={opened()} onClose={() => setOpened(false)} title="Edit profile">
  <TextInput label="Name" data-autofocus />
</Modal>
```

- **State:** controlled: `opened`, and `onClose`, which it calls when it asks to close (the close button, Escape, a press on the backdrop). Set `opened` to `false` there.
- **Element:** a `<dialog>`, opened with `showModal()`, rendered while open (and while its exit animation runs). The rest of the page is inert, so focus stays inside without a trap. Other props, `class`, `style` and `ref` go to the `<dialog>`, which covers the viewport; the visible box inside it is `[data-slot="modal-content"]`.
- **Name:** `title` renders an `h2` that names the dialog. Without one, give it `aria-label`.
- **Header:** the title and a close button (`withCloseButton`, default `true`; `closeButtonLabel`, default `'Close'`). With neither, there's no header.
- **Focus:** opening focuses the element marked `data-autofocus`, else the first focusable one (the close button, when there is one), else the content. Closing moves focus back to where it was (`returnFocus`, default `true`).
- **Closing:** Escape (`closeOnEscape`, default `true`) and a press on the backdrop (`closeOnClickOutside`, default `true`). With an overlay open inside it, such as a popover, that one closes first. A cancel from the browser (without a key) follows `closeOnEscape` too.
- **Size:** `size` (`xs` to `xl`: 20, 24, 28, 38, 48rem; default `md`), never wider than the viewport. `centered` centers it vertically, rather than near the top; `fullScreen` fills the viewport. Content taller than the viewport scrolls inside the modal.
- **Page scroll:** the page doesn't scroll while it's open (`lockScroll`, default `true`). A classic scrollbar's room is kept, so the page doesn't shift sideways.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets for the content (default `pop`); the backdrop fades with it. `transitionDuration` (ms, default 200). None under `prefers-reduced-motion`.
- **From code:** to open modals and confirm modals without keeping their state, see [Modals](../modals/modals.md).
- **Needs** a `<SlopkitUi>` above it, for Escape's order among overlays.
- **Server:** a closed modal renders nothing; an open one renders its `<dialog>`, which opens once hydrated.

## Props

| Prop                  | Type             | Default   | Description                                                |
| --------------------- | ---------------- | --------- | ---------------------------------------------------------- |
| `opened`              | `boolean`        | —         | Whether it is open.                                        |
| `onClose`             | `() => void`     | —         | Called when it asks to close.                              |
| `onExited`            | `() => void`     | —         | Called once it has closed and its exit animation finished. |
| `title`               | `JSX.Element`    | —         | The heading, which names the dialog.                       |
| `withCloseButton`     | `boolean`        | `true`    | Shows a close button in the header.                        |
| `closeButtonLabel`    | `string`         | `'Close'` | Accessible name of the close button.                       |
| `size`                | `SlopSize`       | `'md'`    | Width, from 20 to 48rem.                                   |
| `centered`            | `boolean`        | `false`   | Centers it vertically.                                     |
| `fullScreen`          | `boolean`        | `false`   | Fills the viewport.                                        |
| `closeOnClickOutside` | `boolean`        | `true`    | Whether a press on the backdrop closes it.                 |
| `closeOnEscape`       | `boolean`        | `true`    | Whether Escape closes it.                                  |
| `returnFocus`         | `boolean`        | `true`    | Moves focus back to where it was when it closes.           |
| `lockScroll`          | `boolean`        | `true`    | Stops the page from scrolling while it's open.             |
| `transition`          | `TransitionName` | `'pop'`   | The content's animation.                                   |
| `transitionDuration`  | `number`         | `200`     | Duration of the animation, in ms.                          |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the `<dialog>`: `.slp-modal`; its backdrop is `.slp-modal::backdrop`.
- Attributes on it: `data-size`, `data-centered`, `data-full-screen`, `data-status`.
- Slots: `[data-slot="modal-content"]` (the box, with `data-transition` and `data-status`), `modal-header`, `modal-title`, `modal-close`, `modal-body`.
