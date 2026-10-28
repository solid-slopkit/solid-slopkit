# NavTabs

Navigation drawn as tabs: a `nav` of links, with the current page's link marked as the selected tab.

```tsx
import { NavTabs } from '@solid-slopkit/components';
```

## Usage

```tsx
<NavTabs aria-label="Project">
  <NavTabs.Link href="/project/overview">Overview</NavTabs.Link>
  <NavTabs.Link href="/project/activity" rightSection={<Badge size="xs">3</Badge>}>
    Activity
  </NavTabs.Link>
  <NavTabs.Link href="/project/settings" disabled>
    Settings
  </NavTabs.Link>
</NavTabs>
```

- **When:** NavTabs is for tabs that go to pages: each link has its own URL and the page it leads to is the content. For tabs that switch panels on the same page, use [Tabs](../tabs/tabs.md). The two look the same.
- **Parts:** `NavTabs` is a `nav` holding the links in a list; name it with `aria-label` when the page has more than one `nav`. `NavTabs.Link` is a link in it.
- **Current page:** the router marks it. Inside `@solidjs/router`, every link it manages gets `data-active` while its path is the current page's or a parent of it, and `aria-current="page"` while it's exactly the current page; NavTabs draws a link with `data-active` as the selected tab. A link to a parent path is marked on its child pages too: on `/project/activity`, a link to `/project` is selected along with the link to `/project/activity`, so give each tab its own path (`/project/overview`). A disabled link has no `href`, so the router never marks it. Without the router, set `data-active` and `aria-current="page"` on the current link yourself; inside it, the router decides `data-active` on every link, so one set by hand doesn't last.
- **Links:** an `a` by default; `as` renders another link component, which gets `href` and the rest. `leftSection` and `rightSection` hold an icon or a count. `disabled` removes the `href`, keeps `role="link"` with `aria-disabled="true"`, and ignores clicks. Other props go to the link.
- **Keyboard:** the links are ordinary links: Tab moves between them and Enter follows one. There are no arrow keys and no `tablist` role, since the links aren't tabs of a panel.
- **Look:** the same as Tabs. `variant` is `underline` (the default), `outline`, `pills` or `soft`; `color` is the current link's color role (default `primary`); `size` from `xs` to `xl` (default `md`); `orientation="vertical"` stacks the links in a column; `grow` shares the row's width between them.

## Props

| Prop          | Type                                            | Default        | Description                               |
| ------------- | ----------------------------------------------- | -------------- | ----------------------------------------- |
| `variant`     | `'underline' \| 'outline' \| 'pills' \| 'soft'` | `'underline'`  | How the current link is marked.           |
| `color`       | `SlopColor`                                     | `'primary'`    | The current link's color role.            |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`          | `'md'`         | The links' height and text.               |
| `orientation` | `'horizontal' \| 'vertical'`                    | `'horizontal'` | A row of links, or a column.              |
| `grow`        | `boolean`                                       | `false`        | Shares the row's width between the links. |

NavTabs passes other props to its `nav`.

NavTabs.Link: `leftSection`, `rightSection`, `disabled`, and `as` (default `'a'`) for another link component.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-nav-tabs` (the `nav`, with `data-variant`, `data-color`, `data-size`, `data-orientation`), holding the `nav-tabs-list` slot (with `data-grow`); `.slp-nav-tabs-link` (`[data-slot="nav-tabs-link"]`, with `data-active` on the link the router marks as current, and `data-disabled`).
- Slots in a link: `nav-tabs-link-label`, and `nav-tabs-link-section` with `data-position="left"` or `"right"`.
- Custom properties, shared with Tabs, on the nav tabs or an ancestor: `--slp-tabs-color` (the current link's color), `--slp-tabs-content` (the text on a current pill).
