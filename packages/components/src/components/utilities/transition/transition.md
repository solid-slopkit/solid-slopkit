# Transition

Animates content in and out as `mounted` changes. The content stays rendered until its exit animation has finished, then unmounts.

```tsx
import { Transition } from '@solid-slopkit/components';
```

## Usage

```tsx
<Transition mounted={opened()} transition="fade-down">
  {(transition) => (
    <Paper {...transition} withBorder>
      Details
    </Paper>
  )}
</Transition>
```

- **Render function:** the child is a function that gets the transition's attributes. Spread them on the content's root element: a `ref`, a `class`, the timing as inline custom properties in `style`, `data-transition` and `data-status`. The element has to take a ref; a component used as the root must pass its ref on.
- **Your own ref, class and style:** attributes after the spread replace the transition's, so combine them: `ref={[transition.ref, myRef]}`, `class={[transition.class, 'mine']}`, `style={{ ...transition.style, color: 'red' }}`.
- **Presets:** `transition` names the animation, `fade` by default. The direction in the name is the way it moves while entering (`fade-up` rises into place): `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `scale`, `scale-x`, `scale-y`, `pop`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `rotate-left`, `rotate-right`. The `slide` presets move by the element's own size: put them in a box with `overflow: hidden`.
- **Timing:** `duration` (enter, ms, default 200), `exitDuration` (default `duration`), `timingFunction` (default `ease`).
- **keepMounted:** the hidden content stays in the DOM with `display: none` instead of unmounting, so its state survives. Read once.
- **Callbacks:** `onEntered` after the enter animation, `onExited` once the exit animation has finished and the content is gone.
- **Reduced motion:** under `prefers-reduced-motion: reduce` the presets don't animate; it shows and hides at once, and the callbacks still run.
- **No animation on first render:** content that starts mounted is shown as is, which is also what the server renders.
- **Your own animation:** `transition="none"` leaves it to your CSS, written against `data-status`: `starting` (the one frame after mounting, which the enter transition starts from), `open`, `ending` (while the exit runs) and `closed`. Keyframe animations work too, on `open` to enter and on `ending` to exit. Only the element's own transitions and animations are waited for, not its children's.

```css
.panel {
  transition:
    opacity 200ms,
    filter 200ms;

  &:is([data-status='starting'], [data-status='ending']) {
    opacity: 0;
    filter: blur(4px);
  }
}
```

## Props

| Prop             | Type                                                | Default    | Description                                                                 |
| ---------------- | --------------------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `mounted`        | `boolean`                                           | —          | Whether the content is shown.                                               |
| `transition`     | `TransitionName` (the presets above, or `'none'`)   | `'fade'`   | The animation.                                                              |
| `duration`       | `number`                                            | `200`      | Enter duration, in milliseconds.                                            |
| `exitDuration`   | `number`                                            | `duration` | Exit duration, in milliseconds.                                             |
| `timingFunction` | `string`                                            | `'ease'`   | CSS timing function of both.                                                |
| `keepMounted`    | `boolean`                                           | `false`    | Keep the content in the DOM, with `display: none`, while hidden. Read once. |
| `onEntered`      | `() => void`                                        | —          | Called when the enter animation has finished.                               |
| `onExited`       | `() => void`                                        | —          | Called when the exit animation has finished.                                |
| `children`       | `(transition: TransitionAttributes) => JSX.Element` | —          | Renders the content; spread the attributes on its root element.             |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the content's root element: `.slp-transition`.
- Attributes on it: `data-transition` (the preset) and `data-status` (`starting`, `open`, `ending`, `closed`).
