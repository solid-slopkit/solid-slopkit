# Collapse

A title that shows and hides the content under it, built from `Collapse.Title` and `Collapse.Content`. The height animates in CSS.

```tsx
import { Collapse } from '@solid-slopkit/components';
```

## Usage

```tsx
<Collapse icon="arrow">
  <Collapse.Title>Shipping details</Collapse.Title>
  <Collapse.Content>
    <Text>Orders placed before 2 p.m. leave the same day.</Text>
  </Collapse.Content>
</Collapse>
```

- **Parts:** `Collapse.Title` is a `button` that toggles it, with `aria-expanded` and `aria-controls` pointing at `Collapse.Content`. Put both inside a `Collapse`; they throw outside one.
- **State:** uncontrolled by default (`defaultOpened`, read once). For a controlled one, pass `opened` and update it from `onChange`, which is called with the state the title asks for.
- **Closed:** the content stays in the DOM with `visibility: hidden`, so its content keeps its state and is out of the tab order and the accessibility tree.
- **Animation:** pure CSS, so there's nothing to measure and the server render is final. The content's grid row goes from `0fr` to `1fr` in 200ms; under `prefers-reduced-motion: reduce` it changes at once. Retime it with a selector: `.slp-collapse-content { transition-duration: 400ms; transition-timing-function: linear }`.
- **Icon:** `icon="arrow"` (a chevron that turns) or `icon="plus"` (a plus that becomes a minus) at the end of the title. None by default. It's drawn in CSS, so it adds nothing to the button's accessible name.
- **Surface:** the root has no background or border. Give it one with `class`, or put it in a Paper or Card.
- **Title's `onClick`:** runs first; `event.preventDefault()` keeps it as it is. A `disabled` title can't toggle it.

## Props

Other props are passed to the root `div`; `Collapse.Title` passes them to its `button`, and `Collapse.Content` to its `div` (its `id` is set for `aria-controls`).

| Prop            | Type                        | Default | Description                                    |
| --------------- | --------------------------- | ------- | ---------------------------------------------- |
| `opened`        | `boolean`                   | —       | Whether the content is shown, when controlled. |
| `defaultOpened` | `boolean`                   | `false` | Whether it starts open, when uncontrolled.     |
| `onChange`      | `(opened: boolean) => void` | —       | Called when the title is pressed.              |
| `icon`          | `'arrow' \| 'plus'`         | —       | An indicator at the end of the title.          |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-collapse`, `.slp-collapse-title`, `.slp-collapse-content`.
- Slot: `collapse-content-body`, inside the content: it clips while it moves and holds the padding.
- Attributes: `data-opened` on all three, `data-icon` on the root and the title.
