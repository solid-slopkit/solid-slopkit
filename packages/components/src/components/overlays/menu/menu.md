# Menu

A list of actions behind a button, in the browser's top layer: the menu button pattern.

```tsx
import { Menu } from '@solid-slopkit/components';
```

## Usage

```tsx
<Menu>
  <Menu.Target>{(target) => <Button {...target}>Actions</Button>}</Menu.Target>
  <Menu.Dropdown>
    <Menu.Label>Project</Menu.Label>
    <Menu.Item leftSection={<Pencil />} rightSection={<Kbd>R</Kbd>} onClick={rename}>
      Rename
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item color="error" onClick={remove}>
      Delete
    </Menu.Item>
  </Menu.Dropdown>
</Menu>
```

- **Parts:** `Menu.Target` and `Menu.Dropdown`, inside `<Menu>`, inside `<SlopkitUi>`; `Menu.Item`, `Menu.Label` and `Menu.Divider` inside the dropdown.
- **Target:** its child is a function that gets the target's attributes; spread them on the button that opens it (`ref`, `id`, `onClick`, `onKeyDown`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`). It must take a ref, and its `id` labels the menu. To add your own handler, call the target's from it; your ref goes in an array: `ref={[target.ref, mine]}`. The function runs once: values that change go in JSX expressions (`aria-label={label()}`), not in variables read before the JSX. Spread `target` in the JSX itself; an object spread (`{ ...target }`) reads its getters once.
- **Dropdown:** a `div` with `popover="manual"` and `role="menu"`, labelled by the target, rendered only while open (and while its exit animation runs). Other props go to the `div`.
- **Items:** `Menu.Item` is a `button` with `role="menuitem"`, or a link with `as="a"` (or any component). `leftSection` (an icon) and `rightSection` (a shortcut), `color` (a color role for its text, e.g. `error`), `disabled`. Choosing an item runs its `onClick`, then closes the menu, unless the handler calls `event.preventDefault()` or `closeMenuOnClick` (or the menu's `closeOnItemClick`) is `false`.
- **Label and divider:** `Menu.Label` is a heading over a group (arrow keys skip it); `Menu.Divider` is a `role="separator"` line.
- **Opening:** a click opens it with focus on the menu; Enter, Space or ArrowDown on the target open it on the first item, ArrowUp on the last. A menu open on the first render (`defaultOpened`) leaves focus where it is.
- **Keyboard:** ArrowUp and ArrowDown move between items, skipping disabled ones, and wrap around unless `loop` is `false`; Home and End go to the first and last; typing jumps to the item whose label starts with it. The pointer moves focus too, so the keyboard picks up where it is.
- **Closing:** choosing an item, Escape, the target, or a press outside close it and move focus back to the target. Tab closes it, and focus moves on from the target. `closeOnEscape`, `closeOnClickOutside`. Nested overlays close innermost first.
- **State:** uncontrolled with `defaultOpened`, or controlled with `opened` and `onChange(opened)`, which is called whenever it would open or close itself.
- **Position:** `position` is a side (`top`, `right`, `bottom`, `left`), optionally with `-start` or `-end`; default `bottom-start`. It flips when there's no room, slides to stay in the viewport, and follows the target on scroll. `offset` (px, default 4), `withArrow`.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets (default `fade`), `transitionDuration` (ms, default 150). None under `prefers-reduced-motion`.
- **Not yet:** submenus, and checkbox or radio items.
- **Server:** a closed menu renders only its target; one with `defaultOpened` renders its dropdown, which is shown once hydrated.

## Props

| Prop                  | Type                        | Default          | Description                                     |
| --------------------- | --------------------------- | ---------------- | ----------------------------------------------- |
| `opened`              | `boolean`                   | —                | Whether it is open, for a controlled menu.      |
| `defaultOpened`       | `boolean`                   | `false`          | Whether it starts open. Read once.              |
| `onChange`            | `(opened: boolean) => void` | —                | Called when it opens or closes itself.          |
| `position`            | `MenuPosition`              | `'bottom-start'` | Where the dropdown goes against the target.     |
| `offset`              | `number`                    | `4`              | Gap between the target and the dropdown, in px. |
| `withArrow`           | `boolean`                   | `false`          | Shows an arrow pointing at the target.          |
| `closeOnItemClick`    | `boolean`                   | `true`           | Whether choosing an item closes it.             |
| `closeOnEscape`       | `boolean`                   | `true`           | Whether Escape closes it.                       |
| `closeOnClickOutside` | `boolean`                   | `true`           | Whether a press outside closes it.              |
| `loop`                | `boolean`                   | `true`           | Whether the arrow keys wrap around.             |
| `transition`          | `TransitionName`            | `'fade'`         | The dropdown's animation.                       |
| `transitionDuration`  | `number`                    | `150`            | Duration of the animation, in ms.               |

### Menu.Item

Other props go to the item's element.

| Prop               | Type             | Default    | Description                                        |
| ------------------ | ---------------- | ---------- | -------------------------------------------------- |
| `as`               | `ValidComponent` | `'button'` | The element or component it renders.               |
| `leftSection`      | `JSX.Element`    | —          | Content before the label, such as an icon.         |
| `rightSection`     | `JSX.Element`    | —          | Content after the label, such as a shortcut.       |
| `color`            | `SlopColor`      | —          | Color role of its text.                            |
| `disabled`         | `boolean`        | `false`    | Whether it can't be chosen.                        |
| `closeMenuOnClick` | `boolean`        | —          | Whether choosing it closes the menu, for this one. |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class, on the dropdown: `.slp-menu`, slot `[data-slot="menu-dropdown"]`, with `data-placement` (the side it actually took, after flipping), `data-status`, `data-transition`. Arrow slot: `[data-slot="menu-arrow"]`.
- Items: `.slp-menu-item`, with `data-color` and `data-disabled`; focused, it matches `:focus`. Slots inside: `[data-slot="menu-item-label"]`, and `[data-slot="menu-item-section"]` with `data-position` (`left`, `right`).
- `.slp-menu-label` and `.slp-menu-divider`.
