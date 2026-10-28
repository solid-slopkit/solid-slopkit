# SimpleGrid

A `div` grid of equal-width columns. Each child takes one cell, and rows are added as needed.

```tsx
import { SimpleGrid } from '@solid-slopkit/components';
```

## Usage

```tsx
<SimpleGrid cols={3}>
  <For each={items()}>{(item) => <Card item={item} />}</For>
</SimpleGrid>
```

- **Columns:** `cols` sets the number of equal-width columns (`repeat(n, minmax(0, 1fr))`). One column by default.
- **Spacing:** `spacing` is the gap between columns, and between rows unless `verticalSpacing` is set. Values are spacing units: `4` is `calc(var(--slp-spacing) * 4)`, 1rem by default.
- **Responsive:** `cols`, `spacing` and `verticalSpacing` take a value per breakpoint, mobile-first. See [style props](../box/box.md#style-props) for the breakpoints.

```tsx
<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 2, sm: 4 }} verticalSpacing={{ base: 4, sm: 8 }}>
  …
</SimpleGrid>
```

- **Style props:** only the three props above. SimpleGrid does not take Box's spacing, size or display props; wrap it in a `Box` for those.
- For columns of different widths, use [Grid](../grid/grid.md).
- Must be rendered inside `<SlopkitUi>`.

## Props

Other props are passed to the rendered `div`.

| Prop              | Type                      | Default   | Description                                                                                 |
| ----------------- | ------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `cols`            | `ResponsiveValue<number>` | `1`       | Number of equal-width columns.                                                              |
| `spacing`         | `ResponsiveValue<number>` | `4`       | Space between columns, in spacing units. Also between rows unless `verticalSpacing` is set. |
| `verticalSpacing` | `ResponsiveValue<number>` | `spacing` | Space between rows, in spacing units.                                                       |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-simple-grid`.
