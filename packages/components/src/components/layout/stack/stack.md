# Stack

Stacks children vertically: a column [Flex](../flex/flex.md) with a gap.

```tsx
import { Stack } from '@solid-slopkit/components';
```

## Usage

```tsx
<Stack>
  <Box p={2}>a</Box>
  <Box p={2}>b</Box>
</Stack>
<Stack gap={2} align="center">…</Stack>
<Stack justify="space-between" style={{ height: '10rem' }}>…</Stack>
<Stack gap={3}>
  <Group justify="space-between">…</Group>
  <Divider />
  <Group justify="space-between">…</Group>
</Stack>
```

- **Defaults:** a `gap` of 4 (1rem), children stretched to the full width (`align="stretch"`), packed at the top.
- **Lines between children:** put a [Divider](../../data-display/divider/divider.md) between them. Stack only spaces its children and never changes their padding, margin or borders; each Divider is a child too, so it sits a `gap` from the rows on either side.
- **Not responsive:** `gap`, `align` and `justify` take single values. For a layout that changes per breakpoint, use Flex with `direction="column"`.
- **No other style props:** Stack doesn't take `p`, `m`, `w` and the like. Wrap it in a [Box](../box/box.md) for spacing and size.
- Must be rendered inside `<SlopkitUi>`.

## Props

Other props are passed to the `div`.

| Prop      | Type          | Default        | Description                                                    |
| --------- | ------------- | -------------- | -------------------------------------------------------------- |
| `gap`     | `number`      | `4`            | Space between children, in spacing units.                      |
| `align`   | `FlexAlign`   | `'stretch'`    | `align-items`. See [Flex props](../box/box.md#flex-props).     |
| `justify` | `FlexJustify` | `'flex-start'` | `justify-content`. See [Flex props](../box/box.md#flex-props). |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-stack`, plus `.slp-flex`.
- No data attributes.
