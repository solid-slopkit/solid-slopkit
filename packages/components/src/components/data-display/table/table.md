# Table

Rows and columns of data: a `table`, built from `Table.Thead`, `Table.Tbody`, `Table.Tfoot`, `Table.Tr`, `Table.Th`, `Table.Td` and `Table.Caption`.

```tsx
import { Table } from '@solid-slopkit/components';
```

## Usage

```tsx
<Table striped hover>
  <Table.Caption>Team members</Table.Caption>
  <Table.Thead>
    <Table.Tr>
      <Table.Th scope="col">Name</Table.Th>
      <Table.Th scope="col">Role</Table.Th>
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    <For each={people()}>
      {(person) => (
        <Table.Tr>
          <Table.Th scope="row">{person.name}</Table.Th>
          <Table.Td>{person.role}</Table.Td>
        </Table.Tr>
      )}
    </For>
  </Table.Tbody>
</Table>
```

- **Elements:** each part renders its native element (`thead`, `tr`, `th`, …) with a root class. The styles target the table's elements, so a table written with plain `thead`/`tr`/`td` looks the same.
- **Headers:** use `Table.Th` with `scope="col"` in the header row, and with `scope="row"` for a cell that names its row. Header text is bold and starts each column.
- **Caption:** `Table.Caption` names the table for assistive technology and shows below it, muted. Put it first in the table. Without one, give the table an `aria-label` or `aria-labelledby`.
- **Look:** a line between rows (none under the last body row), numbers in tabular figures so columns line up, full width. `striped` tints every other body row; `hover` highlights the row under the pointer; `bordered` adds a rounded outer border and lines between columns. `size` from `xs` to `xl` sets cell padding and font size.
- **Footer:** `Table.Tfoot` rows, such as totals, are bold, with a line above.
- **Sticky header:** `stickyHeader` keeps the header row at the top of the nearest scrolling ancestor: the page, or a container with a height and `overflow: auto`.
- **Wide tables:** wrap the table in `Table.ScrollContainer`, a `div` that scrolls it sideways instead of letting it overflow, and give the table a `min-width`. The container takes a tab stop so the keyboard can scroll it; give it `role="region"` and an `aria-label`, or pass `tabindex={-1}` when it can't scroll.
- Table has no margin; space it with a Stack.

## Props

### Table

Other props are passed to the `table`.

| Prop           | Type                                   | Default | Description                                   |
| -------------- | -------------------------------------- | ------- | --------------------------------------------- |
| `striped`      | `boolean`                              | `false` | Tints every other body row.                   |
| `hover`        | `boolean`                              | `false` | Highlights the body row under the pointer.    |
| `bordered`     | `boolean`                              | `false` | Outer border and lines between columns.       |
| `stickyHeader` | `boolean`                              | `false` | Keeps the header row in view while scrolling. |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Cell padding and font size.                   |

### Parts

`Table.Thead`, `Table.Tbody`, `Table.Tfoot`, `Table.Tr`, `Table.Th`, `Table.Td`, `Table.Caption`: no props of their own; their attributes, such as `scope` and `colspan`, pass to the element.

### Table.ScrollContainer

Other props are passed to the `div`. `tabindex` defaults to `0`.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-table`, `.slp-table-thead`, `.slp-table-tbody`, `.slp-table-tfoot`, `.slp-table-tr`, `.slp-table-th`, `.slp-table-td`, `.slp-table-caption`, `.slp-table-scroll-container`. No slots.
- State and variant attributes on the table: `data-size`, `data-striped`, `data-hover`, `data-bordered`, `data-sticky-header`.
- Align a numeric column with a selector or the `style` of its cells, e.g. `.slp-table td:nth-child(3) { text-align: end }`.
