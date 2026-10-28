# Pagination

A row of buttons, or links, to move between pages of content: the first and last pages, the pages around the current one, a gap where pages are left out, and previous and next.

```tsx
import { Pagination } from '@solid-slopkit/components';
```

## Usage

```tsx
const [page, setPage] = createSignal(1);

<Pagination total={20} value={page()} onChange={setPage} />

<Pagination total={pages()} value={page()} getPageHref={(page) => `/orders?page=${page}`} withEdges />
```

- **Pages:** `total` pages, numbered from 1. The value is the current page: uncontrolled with `defaultValue` (read once, default 1), or controlled with `value`; out of range values show as the nearest page. `onChange(page)` is called when another page is chosen.
- **Which pages show:** the first and last `boundaries` pages (default 1), `siblings` pages on each side of the current one (default 1), and a gap (`…`) where pages are left out. While there are more pages than fit, the row keeps the same number of items on every page (2 × boundaries + 2 × siblings + 3), so it doesn't jump as the current page moves.
- **Controls:** previous and next (`withControls`, default `true`), and first and last with `withEdges`. A control that would go nowhere, such as previous on the first page, is disabled.
- **Buttons or links:** buttons by default. `getPageHref(page)` makes every item a link to that address, for pages a router or the server renders; a click still calls `onChange`. A link that goes nowhere has no `href` and `aria-disabled="true"`.
- **Screen readers:** a `nav` named `Pagination` (`aria-label` renames it) holding a list. The current page has `aria-current="page"`; as links, the others have `aria-current="false"`. Pages are named `Page 3` (`pageLabel`), and the controls `Previous page`, `Next page`, `First page` and `Last page` (`previousLabel`, `nextLabel`, `firstLabel`, `lastLabel`). The gap is hidden from them.
- **Focus:** each page keeps its element as the row changes, so the page you pressed keeps focus.
- **Look:** square items as tall as a Button of the same `size` (`xs` to `xl`, default `md`), outlined on the base surface; the current page is filled with `color` (default `primary`). The row wraps when it doesn't fit. `disabled` dims and disables every item. `hideWithOnePage` renders nothing while there's one page or none.
- Other props go to the `nav`.

## Props

| Prop              | Type                                   | Default           | Description                               |
| ----------------- | -------------------------------------- | ----------------- | ----------------------------------------- |
| `total`           | `number`                               | —                 | How many pages there are. Required.       |
| `value`           | `number`                               | —                 | The current page, when controlled.        |
| `defaultValue`    | `number`                               | `1`               | The page it starts on, when uncontrolled. |
| `onChange`        | `(page: number) => void`               | —                 | Called when another page is chosen.       |
| `siblings`        | `number`                               | `1`               | Pages on each side of the current one.    |
| `boundaries`      | `number`                               | `1`               | Pages always shown at each end.           |
| `withControls`    | `boolean`                              | `true`            | Shows previous and next.                  |
| `withEdges`       | `boolean`                              | `false`           | Shows first and last.                     |
| `getPageHref`     | `(page: number) => string`             | —                 | Makes the items links.                    |
| `hideWithOnePage` | `boolean`                              | `false`           | Hides it with one page or none.           |
| `disabled`        | `boolean`                              | `false`           | Disables every item.                      |
| `color`           | `SlopColor`                            | `'primary'`       | The current page's color role.            |
| `size`            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`            | The items' size.                          |
| `previousLabel`   | `string`                               | `'Previous page'` | The previous button's name.               |
| `nextLabel`       | `string`                               | `'Next page'`     | The next button's name.                   |
| `firstLabel`      | `string`                               | `'First page'`    | The first page button's name.             |
| `lastLabel`       | `string`                               | `'Last page'`     | The last page button's name.              |
| `pageLabel`       | `(page: number) => string`             | `` `Page ${n}` `` | A page's name.                            |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-pagination` (the `nav`), with `data-size`, `data-color` and `data-disabled`.
- Slots: `pagination-list` (the `ul`), `pagination-page`, `pagination-previous`, `pagination-next`, `pagination-first`, `pagination-last`, `pagination-dots`. An item has `data-current` when it's the current page and `data-disabled` when it goes nowhere.
- Custom properties, on the pagination or an ancestor: `--slp-pagination-color`, `--slp-pagination-content` (the current page's text), `--slp-pagination-radius` (`0.5rem`).
