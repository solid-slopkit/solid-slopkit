# Burger

A button with three lines that turn into an X while what it toggles, usually the navigation, is open.

```tsx
import { Burger } from '@solid-slopkit/components';
```

## Usage

```tsx
const [opened, setOpened] = createSignal(false);

<Burger opened={opened()} onChange={setOpened} aria-controls="main-nav" />
<Show when={opened()}>
  <nav id="main-nav" aria-label="Main">…</nav>
</Show>
```

- **State:** controlled with `opened` and `onChange`, which gets the new state on each press; the burger shows `opened` and changes only when you update it. Uncontrolled, it starts at `defaultOpened` and toggles itself, still calling `onChange`. Showing and hiding what it opens is up to you.
- **Name and state:** it's named `'Navigation'` by default; pass `label` to say what it opens ("Menu", "Filters"). The state is `aria-expanded`, so the name stays the same and screen readers say "expanded" or "collapsed". Point `aria-controls` at the element it toggles.
- **Look:** an [ActionIcon](../action-icon/action-icon.md), `ghost` by default, with `variant`, `color` and `size`. The lines are drawn in CSS in the current text color, so without `color` they match the text around them. Opening turns them into an X over 0.2s, at once with reduced motion.
- **Clicks:** `onClick` runs first; `event.preventDefault()` in it skips the toggle. `disabled` doesn't toggle.

## Props

Other props, such as `aria-controls`, are passed to the `button`.

| Prop            | Type                                                                                               | Default        | Description                                  |
| --------------- | -------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------- |
| `opened`        | `boolean`                                                                                          | —              | Whether it's open, for a controlled burger.  |
| `defaultOpened` | `boolean`                                                                                          | `false`        | Whether it starts open, uncontrolled.        |
| `onChange`      | `(opened: boolean) => void`                                                                        | —              | Called with the new state when it's pressed. |
| `label`         | `string`                                                                                           | `'Navigation'` | Accessible name: what it opens.              |
| `variant`       | `'ghost' \| 'solid' \| 'soft' \| 'outline' \| 'dash'`                                              | `'ghost'`      | Visual style.                                |
| `color`         | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —              | Color role. The text color when omitted.     |
| `size`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`         | Size of the button and the lines.            |
| `disabled`      | `boolean`                                                                                          | `false`        | Disables it.                                 |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-burger`, plus `.slp-action-icon` and `.slp-button`.
- Slots: `[data-slot="burger-lines"]`: the middle line, with the outer two as its `::before` and `::after`.
- State attributes on the root: `data-opened`, plus Button's (`data-variant`, `data-color`, `data-size`, `data-shape`, `data-disabled`).
