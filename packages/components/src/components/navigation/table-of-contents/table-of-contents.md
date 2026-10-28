# TableOfContents

Links to the sections of the page, with the one being read marked as it scrolls.

```tsx
import { TableOfContents, type TableOfContentsHeading } from '@solid-slopkit/components';
```

## Usage

```tsx
// Finds the page's headings in the browser.
<TableOfContents selector="article h2, article h3" aria-label="On this page" />

// Lists the headings it's given, which also render on the server.
<TableOfContents
  headings={[
    { id: 'usage', label: 'Usage', depth: 2 },
    { id: 'options', label: 'Options', depth: 3 },
  ]}
  variant="soft"
  onActiveChange={(id) => console.log(id)}
/>
```

- **Finding headings:** without `headings`, it lists the elements matching `selector` (`h1, h2, h3, h4, h5, h6` by default) that have an id, with their trimmed text as the label and their level as the depth (`aria-level` for other elements). It looks only in the browser, and again whenever the page's content changes (e.g. a client-side navigation), so the server renders it empty and `hidden`. Give headings ids; those without one are skipped.
- **Given headings:** `headings`, each `{ id, label, depth }`, are listed as they are, and render on the server.
- **Indent:** each link is indented by how much deeper its heading is than the shallowest one listed.
- **Active:** the last heading scrolled up to its line is active, with `aria-current="location"` (the others have `"false"`); none before the first. The line is the heading's `scroll-margin-top` (where following its link puts it, so set it for a sticky header), or `offset` pixels from the top of the viewport when set. At the bottom of the page the last heading is active, even if it can't reach its line. It tracks any scrolling container. `onActiveChange(id | null)` reports each change.
- **Links:** plain `#id` links, so following one is the browser's own jump (smooth with `scroll-behavior: smooth` on the page).
- **Look:** `variant` is `line` (default: a line beside the list, colored by the active link) or `soft` (the active link tinted); `color` is the active link's color role.
- **Screen readers:** a `nav` named `Table of contents`; `aria-label` renames it. Other props go to the `nav`.

## Props

| Prop             | Type                           | Default                    | Description                                    |
| ---------------- | ------------------------------ | -------------------------- | ---------------------------------------------- |
| `headings`       | `TableOfContentsHeading[]`     |                            | The headings to list, instead of finding them. |
| `selector`       | `string`                       | `'h1, h2, h3, h4, h5, h6'` | Which elements are headings.                   |
| `offset`         | `number`                       | each `scroll-margin-top`   | Where a heading counts as reached, in pixels.  |
| `onActiveChange` | `(id: string \| null) => void` |                            | Called when the active heading changes.        |
| `variant`        | `'line' \| 'soft'`             | `'line'`                   | How the active link is drawn.                  |
| `color`          | `SlopColor`                    | `'primary'`                | The active link's color role.                  |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-table-of-contents` (the `nav`), with `data-variant` and `data-color`.
- Slots: `table-of-contents-list` (the `ol`), `table-of-contents-item` (each `li`), `table-of-contents-link` (with `data-depth` and `data-current`).
- Custom property, on the table of contents or an ancestor: `--slp-table-of-contents-color`, the active link's color.
