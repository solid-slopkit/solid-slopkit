# FloatingIndicator

A box that covers one element of a group and glides to another when the target changes, such as the active tab or the selected option.

```tsx
import { FloatingIndicator } from '@solid-slopkit/components';
```

## Usage

```tsx
const [parent, setParent] = createSignal<HTMLElement | null>(null);
const [active, setActive] = createSignal(0);
// In a signal, so the indicator finds a button that's created after it.
const [buttons, setButtons] = createSignal<HTMLButtonElement[]>([]);

<div ref={setParent} style={{ position: 'relative', display: 'flex' }}>
  <FloatingIndicator parent={parent()} target={buttons()[active()]} />
  <For each={['Day', 'Week', 'Month']}>
    {(label, index) => (
      <button
        ref={(el) => setButtons((list) => Object.assign([...list], { [index()]: el }))}
        type="button"
        aria-pressed={active() === index() ? 'true' : 'false'}
        style={{ position: 'relative' }}
        onClick={() => setActive(index())}
      >
        {label}
      </button>
    )}
  </For>
</div>;
```

- **Placement:** render it inside `parent`, which needs `position: relative` (or another positioning). It covers `target` exactly: its position is measured from the parent's padding box and scroll, so borders, padding and a scrolled parent are fine.
- **Stacking:** put it before the targets and give them `position: relative`, so they paint over it. The pointer goes through it.
- **Moving:** when `target` changes, it glides there in 200ms (position and size); under `prefers-reduced-motion: reduce` it jumps. The first placement jumps, so it doesn't slide in from the corner.
- **Following:** it's placed again whenever the target, the parent or another child of the parent changes size, and when the parent scrolls. A child added to the parent later isn't watched until the target changes.
- **Targets:** keep them in signals, as above: the indicator is created before the targets, and a plain array or variable read then is still empty.
- **No target:** without `target` or `parent` (`null`, or before the refs are set) it's hidden; with the next target it jumps there.
- **Server:** it renders hidden and is placed once hydrated.
- **Accessibility:** it's decoration, `aria-hidden`. Mark the state on the targets themselves (`aria-pressed`, `aria-selected`, `aria-current`).
- **Look:** the base surface color, a small shadow and a 0.5rem radius. Restyle it with `class` or `.slp-floating-indicator`; match the radius to the targets'.

## Props

Other props are passed to the `div`.

| Prop     | Type                  | Default | Description                                                |
| -------- | --------------------- | ------- | ---------------------------------------------------------- |
| `target` | `HTMLElement \| null` | —       | The element it covers. Hidden without one.                 |
| `parent` | `HTMLElement \| null` | —       | The element it's positioned in, with `position: relative`. |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-floating-indicator`.
- Attributes on it: `data-hidden` without a target, `data-placed` once placed (the transition applies only then).
- Retime it with a selector: `.slp-floating-indicator[data-placed] { transition-duration: 300ms }`.
