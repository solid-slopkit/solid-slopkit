# NavLink

A link in a navigation list, such as a sidebar, with the current page's link drawn in its color.

```tsx
import { NavLink } from '@solid-slopkit/components';
```

## Usage

```tsx
<nav aria-label="Main">
  <NavLink href="/" label="Dashboard" leftSection={<Gauge />} />
  <NavLink href="/inbox" label="Inbox" description="Messages from your team" rightSection={<Badge>3</Badge>} />
  <NavLink href="/reports" label="Reports" />
  <NavLink label="Settings" defaultOpened>
    <NavLink href="/settings/profile" label="Profile" />
    <NavLink href="/settings/security" label="Security" />
  </NavLink>
</nav>
```

- **Row:** as wide as its container. `label`, an optional smaller `description` under it, `leftSection` (usually an icon) and `rightSection` (such as a Badge). Text wraps unless `noWrap`, which cuts it with an ellipsis.
- **Current page:** the router marks it. Inside `@solidjs/router`, a link to the current page or to a parent of it gets `data-active`, drawn in `color` (`primary` by default), and a link to exactly the current page gets `aria-current="page"`. A link to a parent path is drawn as current on its child pages too, so give each link its own path. A disabled link has no `href`, so the router never marks it; without the router, set `data-active` and `aria-current="page"` on the current link yourself; inside it, the router decides `data-active` on every link, so one set by hand doesn't last. `variant` is `soft` (tinted, default) or `solid` (filled).
- **Link:** an `a` by default; `as` renders another link component, which gets `href` and the rest. `disabled` removes the `href`, keeps `role="link"` with `aria-disabled="true"`, and ignores clicks.
- **Parent:** passing children makes it a `button` with `aria-expanded` that shows and hides those nested NavLinks, indented under it, with a chevron that turns as it opens. A parent doesn't navigate. Uncontrolled with `defaultOpened` (read once), controlled with `opened` + `onChange(opened)`. Whether it has children is read once. Closed children stay in the DOM but out of the tab order. `chevron` replaces the chevron; `disableChevronRotation` keeps it still. A click handler that calls `preventDefault()` keeps it as it is.
- Put the links in a `nav` (with `aria-label` when the page has several). Other props go to the link, or to a parent's button.

## Props

| Prop                     | Type                        | Default     | Description                                    |
| ------------------------ | --------------------------- | ----------- | ---------------------------------------------- |
| `label`                  | `JSX.Element`               |             | The link's text.                               |
| `description`            | `JSX.Element`               |             | A second, smaller line under the label.        |
| `leftSection`            | `JSX.Element`               |             | Content before the label.                      |
| `rightSection`           | `JSX.Element`               |             | Content after the label.                       |
| `variant`                | `'soft' \| 'solid'`         | `'soft'`    | How the current page's link is drawn.          |
| `color`                  | `SlopColor`                 | `'primary'` | The current page's link's color role.          |
| `disabled`               | `boolean`                   | `false`     | Keeps it from being followed or opened.        |
| `noWrap`                 | `boolean`                   | `false`     | Cuts long text with an ellipsis.               |
| `as`                     | `ValidComponent`            | `'a'`       | Renders another link component.                |
| `children`               | `JSX.Element`               |             | Nested NavLinks, which make it a parent.       |
| `opened`                 | `boolean`                   |             | Whether a parent's children show (controlled). |
| `defaultOpened`          | `boolean`                   | `false`     | Whether they show at first.                    |
| `onChange`               | `(opened: boolean) => void` |             | Called when a parent is pressed.               |
| `chevron`                | `JSX.Element`               |             | Replaces a parent's chevron.                   |
| `disableChevronRotation` | `boolean`                   | `false`     | Keeps the chevron still.                       |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-nav-link` (the link, or a parent's button), with `data-active` (set by the router on the current page's link), `data-variant`, `data-color`, `data-disabled`, `data-no-wrap` and, on a parent, `data-opened` and `data-rotate` (unless `disableChevronRotation`).
- Slots: `nav-link-left-section`, `nav-link-body` (holding `nav-link-label` and `nav-link-description`), `nav-link-right-section`, `nav-link-chevron` (parent only).
- A parent's children follow it in `.slp-nav-link-children` (`data-opened`), whose `nav-link-children-body` slot sets the indent (`padding-inline-start`, `1rem`).
- Custom properties, on the nav link or an ancestor: `--slp-nav-link-color` (the current link's color) and `--slp-nav-link-content` (the text on a `solid` current link).
