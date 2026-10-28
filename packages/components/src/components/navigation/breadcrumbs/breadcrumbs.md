# Breadcrumbs

Where the current page sits in the site's hierarchy: links to the pages above it, in order, then the page itself.

```tsx
import { Breadcrumbs } from '@solid-slopkit/components';
```

## Usage

```tsx
<Breadcrumbs>
  <Anchor href="/" underline="hover">Home</Anchor>
  <Anchor href="/docs" underline="hover">Docs</Anchor>
  <Text as="span" aria-current="page">
    Breadcrumbs
  </Text>
</Breadcrumbs>

<Breadcrumbs separator={<ChevronRight />}>
  <For each={path()}>{(page) => <Anchor href={page.href}>{page.title}</Anchor>}</For>
</Breadcrumbs>
```

- **Items:** each child becomes an item of an ordered list, in order: links (an [Anchor](../../typography/anchor/anchor.md), or a router's link through Anchor's `as`) to the pages above, then the current page. Children from a `For` or a `Show` work, and the list follows them as they change.
- **Current page:** mark it with `aria-current="page"`, on its link or on a `span`; Breadcrumbs doesn't, since it doesn't know which child is current. It's usually last.
- **Separator:** `/` between the items by default; `separator` takes any element, such as an icon, and each gap gets its own. Separators are hidden from screen readers, which announce the list's structure instead.
- **Screen readers:** a `nav` named `Breadcrumb`; `aria-label` renames it.
- **Layout:** a row that wraps when it doesn't fit. The text takes the surrounding font; set `size` on the Anchors for another.
- Other props go to the `nav`.

## Props

| Prop        | Type          | Default | Description              |
| ----------- | ------------- | ------- | ------------------------ |
| `separator` | `JSX.Element` | `'/'`   | Shown between the items. |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-breadcrumbs` (the `nav`).
- Slots: `breadcrumbs-list` (the `ol`), `breadcrumbs-item` (each `li`), `breadcrumbs-separator` (in every item but the first).
- Custom property, on the breadcrumbs or an ancestor: `--slp-breadcrumbs-gap`, the space on each side of a separator (`0.5rem`).
