# Highlight

Text with every match of a term wrapped in a [Mark](../mark/mark.md): a `span`.

```tsx
import { Highlight } from '@solid-slopkit/components';
```

## Usage

```tsx
<Text>
  <Highlight highlight={query()}>{item.title}</Highlight>
</Text>

<Highlight highlight={['color', 'role']} color="info">
  A color role names the purpose of a color.
</Highlight>
```

- **Element:** a `span` holding the text, with each match in a Mark. Put it inside a Text, a Title or a link to give it a size and an element; Highlight only adds the marks.
- **Children:** a string. Highlight searches it as plain text.
- **Terms:** `highlight` takes one term or an array. Matching ignores case unless `caseSensitive` is set. Where terms overlap, the longer one wins. Characters such as `.` or `(` match literally. Empty and blank terms match nothing, so an empty search shows the text unmarked.
- **Color:** `color` goes to every Mark and defaults to `warning`, like Mark. Restyle the marks with Mark's selectors and `--slp-mark-color`.
- **Updates:** a new term updates the text in place instead of recreating it, so it's cheap to drive from a search input.

## Props

Other props are passed to the `span`.

| Prop            | Type                                                                                               | Default     | Description                          |
| --------------- | -------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------ |
| `children`      | `string`                                                                                           | —           | The text to search. Required.        |
| `highlight`     | `string \| string[]`                                                                               | —           | The term or terms to mark. Required. |
| `color`         | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'warning'` | Color role of the marks.             |
| `caseSensitive` | `boolean`                                                                                          | `false`     | Matches only the same case.          |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-highlight`, on the `span`. No slots: the marks are Mark components, `.slp-mark` with `data-color`.
- Scope a mark style to highlights with `.slp-highlight .slp-mark`.
