# Group

Lays children out in a row: a [Flex](../flex/flex.md) with a gap that wraps and centers its children vertically.

```tsx
import { Group } from '@solid-slopkit/components';
```

## Usage

```tsx
<Group>
  <Button>Cancel</Button>
  <Button color="primary">Save</Button>
</Group>
<Group gap={2} justify="space-between">…</Group>
<Group wrap="nowrap">…</Group>
```

- **Defaults:** a `gap` of 4 (1rem), children centered vertically (`align="center"`), packed at the start, wrapping onto new lines.
- **Grow:** `grow` makes children fill the row. By default they share it equally and their content cannot widen them. Set `preventGrowOverflow={false}` to let wider content take more.

```tsx
<Group grow>
  <Box p={2}>a</Box>
  <Box p={2}>equal share however long this is</Box>
</Group>
<Group grow preventGrowOverflow={false}>…</Group>
```

- The grow rules have zero specificity, so a child's own classes (for example a Box `miw`) still win.
- **Not responsive:** Group's props take single values. For a layout that changes per breakpoint, use Flex.
- **No other style props:** Group doesn't take `p`, `m`, `w` and the like. Wrap it in a [Box](../box/box.md) for spacing and size.
- Must be rendered inside `<SlopkitUi>`.

## Props

Other props are passed to the `div`.

| Prop                  | Type                                   | Default        | Description                                                                      |
| --------------------- | -------------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| `gap`                 | `number`                               | `4`            | Space between children, in spacing units.                                        |
| `align`               | `FlexAlign`                            | `'center'`     | `align-items`. See [Flex props](../box/box.md#flex-props).                       |
| `justify`             | `FlexJustify`                          | `'flex-start'` | `justify-content`. See [Flex props](../box/box.md#flex-props).                   |
| `wrap`                | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'wrap'`       | `flex-wrap`.                                                                     |
| `grow`                | `boolean`                              | `false`        | Children grow to fill the row.                                                   |
| `preventGrowOverflow` | `boolean`                              | `true`         | With `grow`, children share the row equally and their content cannot widen them. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-group`, plus `.slp-flex`.
- State attributes on the root: `data-grow` (when `grow` is set), `data-prevent-grow-overflow` (unless `preventGrowOverflow` is `false`).
