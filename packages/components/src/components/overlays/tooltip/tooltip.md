# Tooltip

A short description of its target, shown in the browser's top layer while the target is hovered or has keyboard focus.

```tsx
import { Tooltip } from '@solid-slopkit/components';
```

## Usage

```tsx
<Tooltip label="Copies the link to this page">
  {(target) => (
    <ActionIcon {...target} label="Copy link">
      <Copy />
    </ActionIcon>
  )}
</Tooltip>
```

- **Target:** the child is a function that gets the target's attributes; spread them on one element (`ref`, `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur`, `aria-describedby`). It must take a ref and be focusable, usually a button or a link. To add your own handler, call the target's from it, e.g. `target.onFocus(event)`; your ref goes in an array: `ref={[target.ref, mine]}`. A disabled button gets no pointer events: wrap it in a focusable `span`.
- **Description, not name:** the tooltip describes the target through `aria-describedby`. An icon-only button still needs its own name (`label` on an ActionIcon).
- **Element:** a `span` with `role="tooltip"` and `popover="manual"`, rendered right after the target and hidden while it's not shown, so `aria-describedby` always points at it (it works inside a paragraph too). `label` is its content; other props go to the `span`.
- **Showing:** hovering the target with a mouse or pen shows it after `openDelay` (ms, default 0); keyboard focus shows it at once. A click or a tap doesn't. It stays shown while the target has keyboard focus.
- **Hiding:** the pointer leaving hides it after `closeDelay` (ms, default 100), which is the time it has to move onto the tooltip: hovering the tooltip keeps it shown, so it can be read under a magnifier. Blurring the target hides it, and so does Escape, which goes to the innermost overlay first (a tooltip inside a popover hides before the popover closes).
- **State:** uncontrolled, or controlled with `opened` and `onChange(opened)`, which is called whenever it would show or hide itself. `disabled` never shows it.
- **Position:** `position` is a side (`top`, `right`, `bottom`, `left`), optionally with `-start` or `-end`; default `top`. It flips when there's no room, slides to stay in the viewport, and follows the target on scroll. `offset` (px, default 6), `withArrow`.
- **Look:** `color` is a color role for the background, `neutral` by default, with its content color for the text. Text wraps at 20rem.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets (default `fade`), `transitionDuration` (ms, default 100). None under `prefers-reduced-motion`.
- **Needs** a `<SlopkitUi>` above it, for Escape's order among overlays.
- **Server:** it renders hidden; a controlled one with `opened` is shown once hydrated.

## Props

| Prop                 | Type                        | Default     | Description                                              |
| -------------------- | --------------------------- | ----------- | -------------------------------------------------------- |
| `label`              | `JSX.Element`               | —           | The tooltip's content.                                   |
| `children`           | `(target) => JSX.Element`   | —           | Renders the target with the attributes spread on it.     |
| `opened`             | `boolean`                   | —           | Whether it is shown, for a controlled tooltip.           |
| `onChange`           | `(opened: boolean) => void` | —           | Called when it would show or hide itself.                |
| `disabled`           | `boolean`                   | `false`     | Never shows it.                                          |
| `position`           | `TooltipPosition`           | `'top'`     | Where it goes against the target.                        |
| `offset`             | `number`                    | `6`         | Gap between the target and the tooltip, in px.           |
| `withArrow`          | `boolean`                   | `false`     | Shows an arrow pointing at the target.                   |
| `color`              | `SlopColor`                 | `'neutral'` | Color role of its background.                            |
| `openDelay`          | `number`                    | `0`         | Delay before showing it on hover, in ms.                 |
| `closeDelay`         | `number`                    | `100`       | Delay before hiding it once the pointer has left, in ms. |
| `transition`         | `TransitionName`            | `'fade'`    | Its animation.                                           |
| `transitionDuration` | `number`                    | `100`       | Duration of the animation, in ms.                        |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the tooltip: `.slp-tooltip`.
- Attributes on it: `data-color`, `data-placement` (the side it actually took, after flipping), `data-status`, `data-transition`.
- Slot: `[data-slot="tooltip-arrow"]`.
- Public custom properties: `--slp-tooltip-color` (background and arrow) and `--slp-tooltip-content` (text), for a color outside the roles.
