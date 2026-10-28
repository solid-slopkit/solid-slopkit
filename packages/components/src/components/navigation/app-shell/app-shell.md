# AppShell

The frame of an app: a sidebar of navigation next to the main area. On a wide screen the sidebar collapses, off the canvas or down to its icons; on a narrow one (below 48em) it opens as a drawer over the page.

```tsx
import { AppShell, useAppShell } from '@solid-slopkit/components';
```

## Usage

```tsx
<AppShell>
  <AppShell.Sidebar collapsible="icon">
    <AppShell.SidebarHeader>
      <TeamSwitcher />
    </AppShell.SidebarHeader>
    <AppShell.SidebarContent>
      <nav aria-label="Main">
        <AppShell.Group label="Platform">
          <AppShell.Menu>
            <AppShell.MenuItem>
              <AppShell.MenuButton href="/" icon={<House />} tooltip="Home">
                Home
              </AppShell.MenuButton>
            </AppShell.MenuItem>
            <AppShell.MenuItem>
              <AppShell.MenuButton href="/inbox" icon={<Inbox />} tooltip="Inbox">
                Inbox
              </AppShell.MenuButton>
              <AppShell.MenuBadge>12</AppShell.MenuBadge>
            </AppShell.MenuItem>
          </AppShell.Menu>
        </AppShell.Group>
        <AppShell.Group label="Projects">
          <AppShell.GroupAction label="Add project">
            <Plus />
          </AppShell.GroupAction>
          <AppShell.Menu>
            <AppShell.MenuItem>
              <AppShell.MenuButton as={A} href="/projects/design" icon={<Folder />} tooltip="Design">
                Design
              </AppShell.MenuButton>
              <AppShell.MenuAction label="More for Design" showOnHover>
                <Ellipsis />
              </AppShell.MenuAction>
            </AppShell.MenuItem>
          </AppShell.Menu>
        </AppShell.Group>
      </nav>
    </AppShell.SidebarContent>
    <AppShell.SidebarFooter>
      <UserMenu />
    </AppShell.SidebarFooter>
    <AppShell.Rail />
  </AppShell.Sidebar>
  <AppShell.Main>
    <header>
      <AppShell.Trigger />
    </header>
    {props.children}
  </AppShell.Main>
</AppShell>
```

- **Structure:** `AppShell` is a row; put one `AppShell.Sidebar` and one `AppShell.Main` in it. The sidebar holds `SidebarHeader` and `SidebarFooter`, which stay put, and `SidebarContent`, which scrolls between them. Put the groups in a `nav` with an `aria-label`.
- **Height:** the shell is at least the viewport's height (`100svh`), and on a wide screen the sidebar is that tall and sticks to the top as the page scrolls. `--slp-app-shell-height` changes both, e.g. to frame a shell inside a page.
- **Wide screens:** `collapsible` on the sidebar says what collapsing does: `offcanvas` (default) slides it out of the layout, `icon` shrinks it to a column of icons, `none` keeps it expanded. The width animates; collapsed off the canvas, the sidebar is hidden and out of the tab order.
- **Narrow screens** (below 48em, fixed): the sidebar leaves the layout. The trigger opens it as a modal drawer from its edge, over a backdrop, in the browser's top layer: focus moves in and is kept inside, the rest of the shell is inert, and the page doesn't scroll. Escape, a press on the backdrop, and a press on a link inside (`closeOnLinkClick`, default `true`) close it, and focus goes back. Its accessible name is `label` (default `'Sidebar'`). Widening the screen closes it.
- **State:** uncontrolled with `defaultOpened` (read once, default `true`), or controlled with `opened` + `onChange(opened)`. That's the wide-screen state; the drawer has its own, which starts closed. `useAppShell()`, anywhere inside, reads and changes both: `opened`, `setOpened`, `mobile` (whether the screen is narrow; `false` on the server and until hydrated), `mobileOpened`, `setMobileOpened`, and `toggle()`, which toggles the drawer on a narrow screen and the sidebar on a wide one.
- **Toggling:** `AppShell.Trigger` (an ActionIcon with `aria-expanded` and `aria-controls`; `label` default `'Toggle sidebar'`; children replace its icon), `AppShell.Rail` (a strip along the sidebar's inner edge, for the pointer only), and the shortcut, `mod+B` (⌘B on Apple devices, Ctrl+B elsewhere), which works anywhere on the page unless a handler has already prevented the key. `shortcut` takes another key or a list, or `null` for none; give only one shell on a page a shortcut.
- **Look:** `variant` is `sidebar` (default: a full-height panel with a border), `floating` (a card with a gap around it), or `inset` (part of the background, with the main area as a raised card next to it). `position` is `left` (default) or `right`.
- **Groups:** `AppShell.Group` is a section with an optional `label`, which names it (`role="group"`); `AppShell.GroupAction` is a small icon button at the end of the label, named by its required `label`.
- **Menus:** `AppShell.Menu` is a `ul` of `AppShell.MenuItem` rows (`li`). In a row, `AppShell.MenuButton` is the row itself, `AppShell.MenuAction` an icon button at its end (`label` required; `showOnHover` shows it only while the row is hovered or has focus inside, always on touch screens), `AppShell.MenuBadge` a count at its end, and `AppShell.MenuSub` a nested, indented `ul` of `AppShell.MenuSubItem` rows holding `AppShell.MenuSubButton`s. To make a row open its sub menu, give its button `aria-expanded` and an `onClick`, and render the `MenuSub` while it's open.
- **Rows:** `MenuButton` and `MenuSubButton` are a link with `href`, else a `button`; `as` renders another link component. `icon` goes before the label (the children, which can hold more than text: two lines, a chevron). The router marks the current page: inside `@solidjs/router`, a row that links to the current page or to a parent of it gets `data-active`, drawn highlighted, and one that links to exactly the current page gets `aria-current="page"`. A link to a parent path is highlighted on its child pages too, so give each row its own path. A button row, or a disabled link, which has no `href`, is never marked by the router; without the router, or on a button row, set `data-active` and `aria-current="page"` yourself; on a link inside the router, the router decides `data-active`, so one set by hand doesn't last. `disabled` removes a link's `href` (keeping `role="link"` with `aria-disabled`) or disables a button. `size`: `sm`, `md` (default) or `lg` for a menu button (1.75, 2, 3rem), `sm` or `md` for a sub button (1.5, 1.75rem).
- **Collapsed to icons:** rows become squares around their icon, their labels hidden from sight but still their accessible name. `tooltip` on a MenuButton is shown beside it then, on hover and keyboard focus, and describes it; otherwise it isn't shown. Group labels fade out; group actions, menu actions, badges and sub menus hide. The header and footer keep their content, so put rows there too.
- **Persisting the state:** keep `opened` in a cookie that the server reads, so the first render is already right:

```tsx
const [opened, setOpened] = createSignal(readCookie('sidebar') !== 'collapsed');

<AppShell
  opened={opened()}
  onChange={(next) => {
    setOpened(next);
    document.cookie = `sidebar=${next ? 'expanded' : 'collapsed'}; path=/; max-age=31536000`;
  }}
>
  …
</AppShell>;
```

- **Needs** a `<SlopkitUi>` above it, for Escape's order among overlays and the tooltips. Parts throw outside their parent (`AppShell`, or `AppShell.Sidebar` for the rows).
- **Server:** it renders the wide-screen layout in the state `opened` gives; under 48em the CSS hides the sidebar until the drawer opens, so a phone gets no flash either.

## Props

### AppShell

Other props go to the root `div`.

| Prop            | Type                                  | Default   | Description                                             |
| --------------- | ------------------------------------- | --------- | ------------------------------------------------------- |
| `opened`        | `boolean`                             | —         | Whether the sidebar is expanded on a wide screen.       |
| `defaultOpened` | `boolean`                             | `true`    | Whether it starts expanded, when uncontrolled.          |
| `onChange`      | `(opened: boolean) => void`           | —         | Called when it asks to expand or collapse.              |
| `shortcut`      | `string \| readonly string[] \| null` | `'mod+B'` | The keys that toggle it from anywhere; `null` for none. |

### AppShell.Sidebar

Other props go to the sidebar's `div`.

| Prop               | Type                                 | Default       | Description                                         |
| ------------------ | ------------------------------------ | ------------- | --------------------------------------------------- |
| `position`         | `'left' \| 'right'`                  | `'left'`      | The edge it sits against.                           |
| `variant`          | `'sidebar' \| 'floating' \| 'inset'` | `'sidebar'`   | How it looks.                                       |
| `collapsible`      | `'offcanvas' \| 'icon' \| 'none'`    | `'offcanvas'` | What collapsing does on a wide screen.              |
| `label`            | `string`                             | `'Sidebar'`   | Accessible name of the drawer on a narrow screen.   |
| `closeOnLinkClick` | `boolean`                            | `true`        | Whether a press on a link inside closes the drawer. |

### AppShell.MenuButton and AppShell.MenuSubButton

Other props go to the link or button.

| Prop       | Type                   | Default | Description                                             |
| ---------- | ---------------------- | ------- | ------------------------------------------------------- |
| `href`     | `string`               | —       | Makes it a link; without it, it's a button.             |
| `as`       | `ValidComponent`       | —       | Renders another link component.                         |
| `icon`     | `JSX.Element`          | —       | An icon before the label.                               |
| `disabled` | `boolean`              | `false` | Keeps it from being followed or pressed.                |
| `size`     | `'sm' \| 'md' \| 'lg'` | `'md'`  | Row height; a sub button takes `sm` or `md`.            |
| `tooltip`  | `JSX.Element`          | —       | MenuButton only: shown beside it while only icons show. |

### The other parts

- `AppShell.Group`: `label` (`JSX.Element`), the heading that names it. Other props go to its `div`.
- `AppShell.GroupAction`, `AppShell.MenuAction`: `label` (`string`, required), the accessible name; the icon is the children. MenuAction also takes `showOnHover` (`boolean`). Other props go to the `button`.
- `AppShell.Trigger`: `label` (`string`, default `'Toggle sidebar'`), `variant` (default `ghost`), `color`, `size` (default `sm`), `disabled`; children replace the icon.
- `AppShell.Main`: `as` (default `'main'`), for a page that has its own `main`.
- `AppShell.SidebarHeader`, `SidebarContent`, `SidebarFooter`, `Menu`, `MenuItem`, `MenuBadge`, `MenuSub`, `MenuSubItem`, `Rail`: their element's attributes.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes, one per part: `.slp-app-shell` (with `data-state`), `.slp-app-shell-sidebar`, `-sidebar-header`, `-sidebar-content`, `-sidebar-footer`, `-group`, `-group-action`, `-menu`, `-menu-item`, `-menu-button`, `-menu-action`, `-menu-badge`, `-menu-sub`, `-menu-sub-item`, `-menu-sub-button`, `-trigger`, `-rail`, `-main`.
- Attributes on the sidebar: `data-state` (`expanded`, `collapsed`), `data-position`, `data-variant`, `data-collapsible`, `data-status` (the drawer's presence). Its backdrop on a narrow screen is `.slp-app-shell-sidebar::backdrop`.
- On a row: `data-size`, `data-active` (set by the router on the current page's row), `data-disabled`. On a menu action: `data-show-on-hover`.
- Slots: `app-shell-sidebar-panel` (the visible panel inside the sidebar), `app-shell-group-label`, `app-shell-menu-button-icon`, `app-shell-menu-button-label`, `app-shell-menu-sub-button-icon`, `app-shell-menu-sub-button-label`, `app-shell-trigger-icon`.
- Custom properties, on the shell or an ancestor: `--slp-app-shell-height` (default `100svh`), `--slp-app-shell-sidebar-width` (`16rem`), `--slp-app-shell-sidebar-width-icon` (`3rem`), `--slp-app-shell-drawer-width` (`18rem`, never wider than the screen minus 3rem).
