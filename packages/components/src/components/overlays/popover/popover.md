# Popover

Floating content anchored to a target, such as a small form or details: a non-modal dialog in the browser's top layer.

```tsx
import { Popover } from '@solid-slopkit/components';
```

## Usage

```tsx
<Popover withArrow>
  <Popover.Target>{(target) => <Button {...target}>Rename</Button>}</Popover.Target>
  <Popover.Dropdown aria-label="Rename the project">
    <TextInput label="Project name" />
  </Popover.Dropdown>
</Popover>
```

- **Parts:** `Popover.Target` and `Popover.Dropdown`, inside `<Popover>`, inside `<SlopkitUi>`.
- **Target:** its child is a function that gets the target's attributes; spread them on the element that opens it (`ref`, `onClick`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`). It must take a ref. To add your own click handler, call `target.onClick(event)` from it; your ref goes in an array: `ref={[target.ref, mine]}`. The function runs once: values that change go in JSX expressions (`aria-label={label()}`), not in variables read before the JSX. Spread `target` in the JSX itself; an object spread (`{ ...target }`) reads its getters once.
- **Dropdown:** a `div` with `popover="manual"` and `role="dialog"`, rendered only while open (and while its exit animation runs). Name it with `aria-label` or `aria-labelledby`. Other props go to the `div`.
- **Focus:** opening moves focus into the dropdown (an element marked `data-autofocus`, else the first focusable one, else the dropdown); closing moves it back to the target (`returnFocus`, default `true`). `trapFocus` keeps Tab inside.
- **Closing:** the target toggles it; Escape and a press outside the target and the dropdown close it (`closeOnEscape`, `closeOnClickOutside`). With nested popovers, the innermost closes first.
- **Position:** `position` is a side (`top`, `right`, `bottom`, `left`), optionally with `-start` or `-end`; default `bottom`. It flips when there's no room, slides to stay in the viewport, and follows the target on scroll. `offset` (px, default 8), `withArrow`, `matchTargetWidth`.
- **State:** uncontrolled with `defaultOpened`, or controlled with `opened` and `onChange(opened)`, which is called whenever it would open or close itself.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets (default `fade`), `transitionDuration` (ms, default 150). None under `prefers-reduced-motion`.
- **Rendering in place:** the dropdown stays in its owner's DOM, so it keeps the theme and context around it; the top layer puts it above everything without a z-index or a portal.
- **Server:** a closed popover renders only its target; one with `defaultOpened` renders its dropdown, which is shown once hydrated.

## Props

| Prop                  | Type                        | Default    | Description                                     |
| --------------------- | --------------------------- | ---------- | ----------------------------------------------- |
| `opened`              | `boolean`                   | —          | Whether it is open, for a controlled popover.   |
| `defaultOpened`       | `boolean`                   | `false`    | Whether it starts open. Read once.              |
| `onChange`            | `(opened: boolean) => void` | —          | Called when it opens or closes itself.          |
| `position`            | `PopoverPosition`           | `'bottom'` | Where the dropdown goes against the target.     |
| `offset`              | `number`                    | `8`        | Gap between the target and the dropdown, in px. |
| `withArrow`           | `boolean`                   | `false`    | Shows an arrow pointing at the target.          |
| `matchTargetWidth`    | `boolean`                   | `false`    | Makes the dropdown as wide as the target.       |
| `closeOnEscape`       | `boolean`                   | `true`     | Whether Escape closes it.                       |
| `closeOnClickOutside` | `boolean`                   | `true`     | Whether a press outside closes it.              |
| `trapFocus`           | `boolean`                   | `false`    | Keeps Tab inside the dropdown.                  |
| `returnFocus`         | `boolean`                   | `true`     | Moves focus back to the target on close.        |
| `transition`          | `TransitionName`            | `'fade'`   | The dropdown's animation.                       |
| `transitionDuration`  | `number`                    | `150`      | Duration of the animation, in ms.               |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the dropdown: `.slp-popover`, slot `[data-slot="popover-dropdown"]`.
- Attributes on it: `data-placement` (the side it actually took, after flipping), `data-status`, `data-transition`.
- Slot: `[data-slot="popover-arrow"]`.
