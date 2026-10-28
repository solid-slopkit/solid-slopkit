# HoverCard

Rich content about a target, such as a profile behind a username, shown in the browser's top layer while the target is hovered or has keyboard focus.

```tsx
import { HoverCard } from '@solid-slopkit/components';
```

## Usage

```tsx
<HoverCard withArrow openDelay={200}>
  <HoverCard.Target>
    {(target) => (
      <Anchor {...target} href="/ada">
        @ada
      </Anchor>
    )}
  </HoverCard.Target>
  <HoverCard.Dropdown aria-label="Ada's profile">
    <Text>Ada Lovelace</Text>
    <Button>Follow</Button>
  </HoverCard.Dropdown>
</HoverCard>
```

- **Parts:** `HoverCard.Target` and `HoverCard.Dropdown`, inside `<HoverCard>`, inside `<SlopkitUi>`. Put the dropdown right after the target, so Tab moves from the target into it.
- **Target:** its child is a function that gets the target's attributes; spread them on one focusable element, usually a link (`ref`, `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur`). It must take a ref. To add your own handler, call the target's from it; your ref goes in an array: `ref={[target.ref, mine]}`. The function runs once: values that change go in JSX expressions (`href={url()}`), not in variables read before the JSX. Spread `target` in the JSX itself; an object spread (`{ ...target }`) reads its getters once.
- **Dropdown:** a `div` with `popover="manual"`, rendered only while shown (and while its exit animation runs). It has no role of its own; give it one, or `aria-label`, when its content needs it. Other props go to the `div`. A paragraph can't hold a `div`, so for a target inside running text, render the text as a `div` (`<Text as="div">`).
- **Showing:** hovering the target with a mouse or pen shows it after `openDelay` (ms, default 0); keyboard focus on the target shows it at once. A tap doesn't, so a link target still navigates on touch.
- **Hiding:** the pointer leaving the target or the dropdown hides it after `closeDelay` (ms, default 150), the time the pointer has to move between them. Focus on the target from the keyboard, or anywhere inside the dropdown, keeps it shown; focus leaving both hides it. Escape (`closeOnEscape`, default `true`) and a press outside close it; with focus inside, Escape moves it back to the target. Nested overlays close innermost first.
- **Not the only way in:** a hover card is supplementary. Keep what's in it reachable elsewhere too, such as the profile page the link goes to.
- **State:** uncontrolled, or controlled with `opened` and `onChange(opened)`, which is called whenever it would show or hide itself.
- **Position:** `position` is a side (`top`, `right`, `bottom`, `left`), optionally with `-start` or `-end`; default `bottom`. It flips when there's no room, slides to stay in the viewport, and follows the target on scroll. `offset` (px, default 8), `withArrow`.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets (default `fade`), `transitionDuration` (ms, default 150). None under `prefers-reduced-motion`.
- **Server:** a closed hover card renders only its target; one with `opened` renders its dropdown, which is shown once hydrated.

## Props

| Prop                 | Type                        | Default    | Description                                              |
| -------------------- | --------------------------- | ---------- | -------------------------------------------------------- |
| `opened`             | `boolean`                   | —          | Whether it is shown, for a controlled hover card.        |
| `onChange`           | `(opened: boolean) => void` | —          | Called when it would show or hide itself.                |
| `position`           | `HoverCardPosition`         | `'bottom'` | Where the dropdown goes against the target.              |
| `offset`             | `number`                    | `8`        | Gap between the target and the dropdown, in px.          |
| `withArrow`          | `boolean`                   | `false`    | Shows an arrow pointing at the target.                   |
| `openDelay`          | `number`                    | `0`        | Delay before showing it on hover, in ms.                 |
| `closeDelay`         | `number`                    | `150`      | Delay before hiding it once the pointer has left, in ms. |
| `closeOnEscape`      | `boolean`                   | `true`     | Whether Escape closes it.                                |
| `transition`         | `TransitionName`            | `'fade'`   | The dropdown's animation.                                |
| `transitionDuration` | `number`                    | `150`      | Duration of the animation, in ms.                        |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the dropdown: `.slp-hover-card`, slot `[data-slot="hover-card-dropdown"]`.
- Attributes on it: `data-placement` (the side it actually took, after flipping), `data-status`, `data-transition`.
- Slot: `[data-slot="hover-card-arrow"]`.
