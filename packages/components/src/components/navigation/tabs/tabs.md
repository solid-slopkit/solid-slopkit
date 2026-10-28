# Tabs

Tabs that switch between panels of content: a `tablist` of tab buttons, and a `tabpanel` for each.

**Not for navigation.** When each tab goes to its own page or URL (a route, a link, a section of the app), use [NavTabs](../nav-tabs/nav-tabs.md) instead: it renders real links in a `nav`, with the current page marked, and looks the same. Tabs are only for panels on the same page; don't put links in Tabs.Tab or change the route from `onChange`.

```tsx
import { Tabs } from '@solid-slopkit/components';
```

## Usage

```tsx
<Tabs defaultValue="gallery">
  <Tabs.List aria-label="Project">
    <Tabs.Tab value="gallery" leftSection={<Image />}>
      Gallery
    </Tabs.Tab>
    <Tabs.Tab value="messages" rightSection={<Badge size="xs">3</Badge>}>
      Messages
    </Tabs.Tab>
    <Tabs.Tab value="settings" disabled>
      Settings
    </Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="gallery">…</Tabs.Panel>
  <Tabs.Panel value="messages">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
</Tabs>
```

- **Parts:** `Tabs.List` (the `tablist`) holds the `Tabs.Tab`s; each `Tabs.Panel` belongs to the tab with the same `value`. The panels can go anywhere inside `<Tabs>`. The parts throw outside it.
- **Value:** uncontrolled with `defaultValue` (read once), or controlled with `value` (`null` for none). `onChange(value)` is called when a tab is selected. With no tab selected, no panel shows and every tab is a tab stop.
- **Panels:** only the selected tab's panel is rendered. `keepMounted` (on Tabs, or on one panel) keeps the others in the DOM with `hidden`, so their state survives switching. A panel is a `tabpanel` labelled by its tab and a tab stop, so the keyboard reaches its content even when it holds nothing focusable. A tab's `aria-controls` points at its panel while the panel is in the DOM.
- **Keyboard:** the selected tab is the list's one tab stop. The arrows move between the tabs (Left and Right, or Up and Down when `orientation="vertical"`), Home and End to the first and last, skipping disabled tabs and looping (`loop={false}` stops at the ends). With `activation="automatic"` (the default) a tab is selected as the arrows reach it; with `manual`, only on Enter, Space or a click, for panels that are slow to show.
- **Tabs:** `button`s with the `tab` role. `leftSection` and `rightSection` hold an icon or a count. `disabled` makes one unreachable. Other props go to the `button`.
- **List:** `grow` shares its width between the tabs. Name it with `aria-label` when the page has more than one. Other props go to its `div`.
- **Look:** `variant` is `underline` (a bar under the selected tab, the default), `outline` (the selected tab is a bordered tab joined to the content), `pills` (the selected tab is filled) or `soft` (the selected tab is tinted with the color). `color` is the selected tab's color role (default `primary`), `size` from `xs` to `xl` (default `md`, as tall as a Button).
- **Orientation:** `horizontal` puts the list above the panels; `vertical` puts it beside them, as a column.
- The values become part of the ids, so any string works, spaces included.

## Props

| Prop           | Type                                            | Default        | Description                                    |
| -------------- | ----------------------------------------------- | -------------- | ---------------------------------------------- |
| `value`        | `string \| null`                                | —              | The selected tab, when controlled.             |
| `defaultValue` | `string \| null`                                | `null`         | The tab selected at first, when uncontrolled.  |
| `onChange`     | `(value: string) => void`                       | —              | Called when a tab is selected.                 |
| `variant`      | `'underline' \| 'outline' \| 'pills' \| 'soft'` | `'underline'`  | How the selected tab is marked.                |
| `color`        | `SlopColor`                                     | `'primary'`    | The selected tab's color role.                 |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`          | `'md'`         | The tabs' height and text.                     |
| `orientation`  | `'horizontal' \| 'vertical'`                    | `'horizontal'` | The list above the panels, or beside them.     |
| `activation`   | `'automatic' \| 'manual'`                       | `'automatic'`  | Whether the arrows select, or only move focus. |
| `loop`         | `boolean`                                       | `true`         | Whether the arrows wrap around.                |
| `keepMounted`  | `boolean`                                       | `false`        | Keeps the other panels in the DOM, hidden.     |

Tabs passes other props to its `div`.

Tabs.List: `grow`. Tabs.Tab: `value` (required), `leftSection`, `rightSection`, `disabled`. Tabs.Panel: `value` (required), `keepMounted`.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-tabs` (with `data-variant`, `data-color`, `data-size`, `data-orientation`), `.slp-tabs-list` (`[data-slot="tabs-list"]`, with `data-grow`), `.slp-tabs-tab` (`[data-slot="tabs-tab"]`, with `data-value`, `data-active` on the selected one, and `data-disabled`), `.slp-tabs-panel` (`[data-slot="tabs-panel"]`, with `data-value`).
- Slots in a tab: `tabs-tab-label`, and `tabs-tab-section` with `data-position="left"` or `"right"`.
- Custom properties, on the tabs or an ancestor: `--slp-tabs-color` (the selected tab's color), `--slp-tabs-content` (the text on a selected pill).
