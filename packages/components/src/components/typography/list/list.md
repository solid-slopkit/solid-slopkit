# List

A list of items: a `ul`, or an `ol` with `ordered`. Its children are `List.Item`.

```tsx
import { List } from '@solid-slopkit/components';
```

## Usage

```tsx
<List spacing="xs">
  <List.Item>Install the package</List.Item>
  <List.Item>Add the provider</List.Item>
</List>

<List ordered start={3}>
  <List.Item>Third</List.Item>
  <List.Item>Fourth</List.Item>
</List>

<List icon={<Check aria-hidden="true" />} spacing="sm">
  <List.Item>Keyboard support</List.Item>
  <List.Item icon={<X aria-hidden="true" />}>Right-to-left layouts</List.Item>
</List>
```

- **Elements:** a `ul`, or an `ol` with `ordered`, of `li` items. `ordered` is read once, when the list renders. The native `ol` attributes pass through: `start`, `reversed`, and `type` for the numbering (`'1'`, `'a'`, `'A'`, `'i'`, `'I'`).
- **Markers:** plain items keep the browser's bullets or numbers, in an indent on the start side.
- **Icons:** `icon` on the List replaces every item's marker; `icon` on a List.Item replaces its own, and `icon={null}` gives an item its marker back. The icon sits beside the content, centered on its first line, and an SVG is sized to 1em. A list whose items all have icons has no indent. Mark decorative icons `aria-hidden="true"`.
- **Size:** without `size`, a list inherits font size and line height, so it matches the text around it. `size` (`xs` to `xl`) takes them from the type scale.
- **Spacing:** without `spacing`, items sit on consecutive lines. `spacing` (`xs` to `xl`) adds a gap of 1, 2, 3, 4 or 6 spacing units between them.
- **Nesting:** put a List inside a List.Item, after the item's text.
- List has no margin; space it with a Stack.

## Props

### List

Other props are passed to the `ul` or `ol`.

| Prop       | Type                                   | Default | Description                                      |
| ---------- | -------------------------------------- | ------- | ------------------------------------------------ |
| `ordered`  | `boolean`                              | `false` | Renders a numbered `ol`.                         |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | —       | Font size and line height. Inherited if omitted. |
| `spacing`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | —       | Gap between items. None if omitted.              |
| `icon`     | `JSX.Element`                          | —       | Replaces every item's marker.                    |
| `start`    | `number`                               | —       | `ol` only. The first number.                     |
| `reversed` | `boolean`                              | `false` | `ol` only. Counts down.                          |
| `type`     | `'1' \| 'a' \| 'A' \| 'i' \| 'I'`      | `'1'`   | `ol` only. Numbering style.                      |

### List.Item

Other props are passed to the `li`.

| Prop   | Type          | Default | Description                                                           |
| ------ | ------------- | ------- | --------------------------------------------------------------------- |
| `icon` | `JSX.Element` | —       | Replaces this item's marker. Overrides the List's; `null` removes it. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-list` on the `ul`/`ol`, `.slp-list-item` on each `li`.
- Slots, only on an item with an icon: `[data-slot="list-item-icon"]` and `[data-slot="list-item-content"]`.
- State and variant attributes: `data-size` and `data-spacing` on the list, `data-with-icon` on an item with an icon.
- Markers are the native `::marker`. Restyle them with `.slp-list-item::marker { color: … }`, or change the bullet with `list-style-type` on the list.
