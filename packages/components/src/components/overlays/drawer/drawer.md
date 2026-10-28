# Drawer

A panel that slides in from an edge of the viewport, such as navigation or filters: a modal `<dialog>` in the browser's top layer, which makes the rest of the page inert and keeps focus inside.

```tsx
import { Drawer } from '@solid-slopkit/components';
```

## Usage

```tsx
const [opened, setOpened] = createSignal(false);

<Button onClick={() => setOpened(true)}>Filters</Button>
<Drawer opened={opened()} onClose={() => setOpened(false)} title="Filters" position="right">
  <Checkbox label="In stock only" />
</Drawer>
```

It works like [Modal](../modal/modal.md), against an edge:

- **State:** controlled: `opened`, and `onClose`, which it calls when it asks to close (the close button, Escape, a press on the backdrop). Set `opened` to `false` there.
- **Element:** a `<dialog>`, opened with `showModal()`, rendered while open (and while its exit animation runs). Other props, `class`, `style` and `ref` go to the `<dialog>`, which covers the viewport; the panel inside it is `[data-slot="drawer-content"]`.
- **Edge:** `position` (`left`, `right`, `top`, `bottom`; default `left`). From the left or right, the panel is full height; from the top or bottom, full width.
- **Size:** `size` is its width from the left or right, its height from the top or bottom: `xs` to `xl` (16, 20, 24, 32, 40rem; default `md`), never past the viewport. Content taller than the panel scrolls inside it.
- **Name:** `title` renders an `h2` that names the dialog. Without one, give it `aria-label`.
- **Header:** the title and a close button (`withCloseButton`, default `true`; `closeButtonLabel`, default `'Close'`). With neither, there's no header.
- **Focus:** opening focuses the element marked `data-autofocus`, else the first focusable one (the close button, when there is one), else the panel. Closing moves focus back to where it was (`returnFocus`, default `true`).
- **Closing:** Escape (`closeOnEscape`) and a press on the backdrop (`closeOnClickOutside`), both on by default. With an overlay open inside it, that one closes first.
- **Page scroll:** the page doesn't scroll while it's open (`lockScroll`, default `true`), and a classic scrollbar's room is kept, so it doesn't shift sideways.
- **Animation:** it slides in from its edge; `transition` takes [Transition](../../utilities/transition/transition.md)'s presets instead. The backdrop fades with it over `transitionDuration` (ms, default 200). None under `prefers-reduced-motion`.
- **Needs** a `<SlopkitUi>` above it, for Escape's order among overlays.
- **Server:** a closed drawer renders nothing; an open one renders its `<dialog>`, which opens once hydrated.

## Props

| Prop                  | Type             | Default   | Description                                                |
| --------------------- | ---------------- | --------- | ---------------------------------------------------------- |
| `opened`              | `boolean`        | —         | Whether it is open.                                        |
| `onClose`             | `() => void`     | —         | Called when it asks to close.                              |
| `onExited`            | `() => void`     | —         | Called once it has closed and its exit animation finished. |
| `position`            | `DrawerPosition` | `'left'`  | The edge it comes from.                                    |
| `size`                | `SlopSize`       | `'md'`    | Width or height, from 16 to 40rem.                         |
| `title`               | `JSX.Element`    | —         | The heading, which names the dialog.                       |
| `withCloseButton`     | `boolean`        | `true`    | Shows a close button in the header.                        |
| `closeButtonLabel`    | `string`         | `'Close'` | Accessible name of the close button.                       |
| `closeOnClickOutside` | `boolean`        | `true`    | Whether a press on the backdrop closes it.                 |
| `closeOnEscape`       | `boolean`        | `true`    | Whether Escape closes it.                                  |
| `returnFocus`         | `boolean`        | `true`    | Moves focus back to where it was when it closes.           |
| `lockScroll`          | `boolean`        | `true`    | Stops the page from scrolling while it's open.             |
| `transition`          | `TransitionName` | the slide | The panel's animation.                                     |
| `transitionDuration`  | `number`         | `200`     | Duration of the animation, in ms.                          |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the `<dialog>`: `.slp-drawer`; its backdrop is `.slp-drawer::backdrop`.
- Attributes on it: `data-position`, `data-size`, `data-status`.
- Slots: `[data-slot="drawer-content"]` (the panel, with `data-transition` and `data-status`), `drawer-header`, `drawer-title`, `drawer-close`, `drawer-body`.
