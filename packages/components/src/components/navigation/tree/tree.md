# Tree

A hierarchy of nodes, such as files in folders, that expand, collapse and can be selected.

```tsx
import { Tree, type TreeNodeData } from '@solid-slopkit/components';
```

## Usage

```tsx
const files: TreeNodeData[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'src/app.tsx', label: 'app.tsx' },
      { value: 'src/lib', label: 'lib', children: [{ value: 'src/lib/util.ts', label: 'util.ts' }] },
    ],
  },
  { value: 'package.json', label: 'package.json' },
];

<Tree data={files} aria-label="Files" defaultExpanded={['src']} />

<Tree
  data={files}
  aria-label="Pick files"
  multiple
  expanded={expanded()}
  onExpandedChange={setExpanded}
  selected={selected()}
  onSelectedChange={setSelected}
  renderNode={(payload) => (
    <>
      {payload.hasChildren ? <Folder /> : <File />}
      {payload.node.label}
    </>
  )}
/>
```

- **Data:** each `TreeNodeData` has a `value` (unique in the whole tree), a `label` (any element) and optional `children`. Only expanded nodes' children are rendered.
- **Expanding:** uncontrolled with `defaultExpanded` (read once), controlled with `expanded` + `onExpandedChange(values)`. To expand everything, pass every value that has children.
- **Selecting:** a click, Enter or Space selects a node, and also expands or collapses one with children. One node is selected (`selected: string | null`, `onSelectedChange(value)`), or several with `multiple` (read once; `selected: string[]`, `onSelectedChange(values)`, toggling each), uncontrolled with `defaultSelected`. Selected nodes are tinted with `color` (`primary` by default).
- **Keyboard:** one tab stop, on the node last focused (or the first selected, or the first). Up/Down move through the visible nodes, Home/End to the first and last; Right expands a node, then moves to its first child; Left collapses it, or moves to its parent; `*` expands every sibling; typing jumps to a node by its label. Keys pressed in an element inside a node (e.g. an input from `renderNode`) are left alone.
- **Custom nodes:** `renderNode(payload)` replaces each label; `payload` has `node`, `level` (1 at the top), `hasChildren`, and `expanded` and `selected` getters that stay current.
- **Screen readers:** a `ul` with `role="tree"` (name it with `aria-label`), `treeitem`s with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` and `aria-selected`, children in a `group`; `aria-multiselectable` with `multiple`.
- Other props go to the `ul`.

## Props

| Prop               | Type                                              | Default     | Description                              |
| ------------------ | ------------------------------------------------- | ----------- | ---------------------------------------- |
| `data`             | `TreeNodeData[]`                                  |             | The nodes at the top level. Required.    |
| `expanded`         | `string[]`                                        |             | The expanded nodes (controlled).         |
| `defaultExpanded`  | `string[]`                                        | `[]`        | The nodes expanded at first.             |
| `onExpandedChange` | `(expanded: string[]) => void`                    |             | Called when a node expands or collapses. |
| `multiple`         | `boolean`                                         | `false`     | Lets several nodes be selected.          |
| `selected`         | `string \| null` (`string[]` with `multiple`)     |             | The selection (controlled).              |
| `defaultSelected`  | `string \| null` (`string[]` with `multiple`)     |             | The selection at first.                  |
| `onSelectedChange` | `(selected: string \| null) => void` (`string[]`) |             | Called when the selection changes.       |
| `renderNode`       | `(payload: TreeRenderNodePayload) => JSX.Element` |             | Replaces each label.                     |
| `color`            | `SlopColor`                                       | `'primary'` | The selected nodes' color role.          |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-tree` (the `ul`), with `data-color`.
- Slots: `tree-item` (each `li`, with `data-value`, `data-expanded`, `data-selected`), `tree-node` (its row), `tree-chevron`, `tree-label`, `tree-group` (an expanded node's children).
- Custom properties, on the tree or an ancestor: `--slp-tree-color` (the selected color) and `--slp-tree-level-offset` (the indent per level, `1.25rem`).
