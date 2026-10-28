# Grid

A flex grid of 12 columns. Each `Grid.Col` spans some of them, and columns wrap to a new row when a row is full.

```tsx
import { Grid } from '@solid-slopkit/components';
```

`Grid.Col` is also exported as `GridCol`.

## Usage

```tsx
<Grid>
  <Grid.Col span={4}>a</Grid.Col>
  <Grid.Col span={4}>b</Grid.Col>
  <Grid.Col span={4}>c</Grid.Col>
  <Grid.Col span={8}>d</Grid.Col>
  <Grid.Col span={4}>e</Grid.Col>
</Grid>
```

- **Columns:** `Grid.Col` must be a direct child of `Grid`; it reads the gutter and column count from it. A column without `span` takes the full row. `columns` changes how many columns a row is divided into.
- **Gutter:** `gutter` is the gap between columns and rows, in spacing units (`4` is 1rem by default). It is a `gap`, so the grid never overflows its parent and needs no negative margins. A column's width accounts for the gutters it spans.
- **Auto and content:** `span="auto"` columns share the space the others leave. `span="content"` is as wide as its content.

```tsx
<Grid>
  <Grid.Col span="content">Label</Grid.Col>
  <Grid.Col span="auto">Takes the rest</Grid.Col>
</Grid>
```

- **Offset:** `offset` leaves that many columns empty before the column.
- **Order:** `order` sets the CSS `order` of the column.
- **Grow:** with `grow`, columns in a row that is not full grow to fill it.

```tsx
<Grid grow>
  <For each={['a', 'b', 'c', 'd', 'e']}>{(label) => <Grid.Col span={4}>{label}</Grid.Col>}</For>
</Grid>
```

- **Responsive:** `gutter` on Grid, and `span`, `offset` and `order` on Grid.Col, take a value per breakpoint, mobile-first. See [style props](../box/box.md#style-props) for the breakpoints. `columns`, `justify` and `align` are not responsive.

```tsx
<Grid gutter={{ base: 2, md: 6 }}>
  <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>…</Grid.Col>
</Grid>
```

- **Style props:** only the props listed below. Grid and Grid.Col do not take Box's spacing, size or display props.
- For a grid where every cell is the same width, use [SimpleGrid](../simple-grid/simple-grid.md).
- Must be rendered inside `<SlopkitUi>`.

## Props

### Grid

Other props are passed to the rendered `div`.

| Prop      | Type                                                                                                                                                   | Default | Description                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------------------------------------------------- |
| `gutter`  | `ResponsiveValue<number>`                                                                                                                              | `4`     | Space between columns and rows, in spacing units.  |
| `columns` | `number`                                                                                                                                               | `12`    | Number of columns a row is divided into.           |
| `grow`    | `boolean`                                                                                                                                              | `false` | Columns in a row that is not full grow to fill it. |
| `justify` | `'normal' \| 'start' \| 'end' \| 'center' \| 'flex-start' \| 'flex-end' \| 'space-between' \| 'space-around' \| 'space-evenly' \| 'stretch' \| string` | —       | `justify-content`.                                 |
| `align`   | `'normal' \| 'stretch' \| 'center' \| 'start' \| 'end' \| 'flex-start' \| 'flex-end' \| 'baseline' \| string`                                          | —       | `align-items`.                                     |

### Grid.Col

Other props are passed to the rendered `div`.

| Prop     | Type                                             | Default  | Description                                                                           |
| -------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------- |
| `span`   | `ResponsiveValue<number \| 'auto' \| 'content'>` | full row | Width in columns, `'auto'` to fill the space left, or `'content'` to fit the content. |
| `offset` | `ResponsiveValue<number>`                        | —        | Columns left empty before this one.                                                   |
| `order`  | `ResponsiveValue<number>`                        | —        | CSS `order`.                                                                          |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-grid`. Grid.Col has its own root class: `.slp-grid-col`.
- State attributes on the Grid root: `data-grow`.
