# Command

A search over a list of commands: an input, then the items it finds. The keyboard moves through them and Enter selects one. Use it inline, or in a `CommandDialog` for a palette over the whole app, opened with ⌘K (Ctrl+K off Apple devices).

```tsx
import { Command, CommandDialog } from '@solid-slopkit/components';
```

## Usage

```tsx
<Command>
  <Command.Input placeholder="Type a command…" />
  <Command.List>
    <Command.Empty>Nothing found</Command.Empty>
    <Command.Group heading="Pages">
      <Command.Item onSelect={() => navigate('/')}>
        <HomeIcon />
        Home
      </Command.Item>
      <Command.Item value="docs" keywords={['guide', 'manual']} onSelect={() => navigate('/docs')}>
        <BookIcon />
        Documentation
        <Command.Shortcut>⌘D</Command.Shortcut>
      </Command.Item>
    </Command.Group>
    <Command.Separator />
    <Command.Group heading="Settings">
      <Command.Item onSelect={() => navigate('/profile')}>Profile</Command.Item>
      <Command.Item disabled>Billing</Command.Item>
    </Command.Group>
  </Command.List>
</Command>
```

- **Parts:** `Command.Input` and `Command.List` inside `<Command>`; `Command.Item`, `Command.Group`, `Command.Separator` and `Command.Empty` inside the list; `Command.Shortcut` inside an item. The parts but `Command.Shortcut` throw outside `<Command>`.
- **Items:** `Command.Item` is an `option` with any content: an icon, its text, a `Command.Shortcut`. `value` is what it's searched by and what `onSelect(value)` gets, and defaults to its text, read once it's in the DOM. `keywords` are more words it's found by, not shown. `disabled` shows it but it can't be selected, and the keyboard skips it. Other props go to its `div`.
- **Search:** by default an item is found when its value or keywords contain every word of the search, ignoring case. An empty search shows every item. Items the search doesn't find get `hidden`; they stay in the DOM in the order written. `filter(value, search, keywords)` replaces the test; `shouldFilter={false}` shows every item, for results filtered elsewhere (such as on a server) and rendered as they come. `defaultCommandFilter` is exported for a filter that builds on it.
- **Groups:** `Command.Group` is a `group` named by its `heading`, hidden while the search finds none of its items. `Command.Separator` is a line, hidden during a search unless it has `alwaysRender`.
- **Nothing found:** `Command.Empty` is shown only while no item is. The list then stops being a `listbox`, and the input's `aria-expanded` turns `false`.
- **Keyboard** (focus stays in the input): ArrowDown and ArrowUp move the active item, skipping disabled ones, and wrap around unless `loop` is `false`; Enter selects it. A new search makes the first item found active. The active item has `data-active` and `aria-selected="true"`, is announced through the input's `aria-activedescendant`, and is scrolled into view. Home and End move the caret.
- **Pointer:** moving over an item makes it active; a click selects it. Pressing an item doesn't take focus from the input.
- **State:** the search is uncontrolled, or controlled with `search` and `onSearchChange`. `value` and `onValueChange` control the active item by its value. Items rendered later, such as results that arrive, make the first one active when none is.
- **Names:** `Command.Input` defaults to `aria-label="Search"`, `Command.List` to `aria-label="Suggestions"`; pass your own, or `aria-labelledby`. Other props of the input go to the [Input](../../inputs/input/input.md) (a `ghost` one, `lg`, with a search icon you can replace with `leftSection`).
- **Server:** an inline Command renders every item; with a search to start from, an item without a `value` is found until it's in the DOM.

## CommandDialog

```tsx
const [opened, setOpened] = createSignal(false);

<CommandDialog opened={opened()} onOpenedChange={setOpened}>
  <Command.Input placeholder="Search…" />
  <Command.List>
    <Command.Empty>Nothing found</Command.Empty>
    <Command.Item onSelect={() => navigate('/')}>Home</Command.Item>
  </Command.List>
</CommandDialog>;
```

- A [Modal](../../overlays/modal/modal.md) without a header, `size` `lg` by default, around a `<Command>`. Its children are the Command's parts, and it takes the Command's props (`search`, `onSearchChange`, `value`, `onValueChange`, `filter`, `shouldFilter`, `loop`).
- **Opening:** controlled: `opened`, and `onOpenedChange(opened)`, called when it asks to open or close. The shortcut (`shortcut`, default `'mod+K'`: ⌘K on Apple devices, Ctrl+K elsewhere) asks for the other state from anywhere on the page, also from a field. Pass another (`'/'`, `'alt+P'`), several as an array, or `null` for none. Modifiers are `mod`, `ctrl`, `meta`, `alt` and `shift`, and must match exactly; a letter or digit also matches by its physical key.
- **Closing:** Escape, a press on the backdrop, and selecting an item (unless `closeOnSelect` is `false`) ask it to close. Focus goes back to where it was.
- **Each opening starts fresh:** its content is rendered only while it's open, so an uncontrolled search starts empty.
- Named `'Command menu'` by default; an `aria-label` names it instead. It also takes the Modal's `size`, `centered`, `fullScreen`, `closeOnClickOutside`, `closeOnEscape`, `returnFocus`, `lockScroll`, `transition`, `transitionDuration` and `onExited`. Other props, `class` and `style` go to the `<dialog>`.

## Props

| Prop             | Type                                   | Default           | Description                                               |
| ---------------- | -------------------------------------- | ----------------- | --------------------------------------------------------- |
| `search`         | `string`                               | —                 | The search text, for a controlled one.                    |
| `onSearchChange` | `(search: string) => void`             | —                 | Called with the search text as it's typed.                |
| `value`          | `string`                               | —                 | The active item's value, for a controlled one.            |
| `onValueChange`  | `(value: string \| undefined) => void` | —                 | Called with the active item's value as it moves.          |
| `filter`         | `(value, search, keywords) => boolean` | words in the text | Whether an item is found for the search.                  |
| `shouldFilter`   | `boolean`                              | `true`            | `false` shows every item, for results filtered elsewhere. |
| `loop`           | `boolean`                              | `true`            | Whether the arrow keys wrap around.                       |

Other props go to the root `div`.

### Command.Item

| Prop       | Type                      | Default  | Description                                     |
| ---------- | ------------------------- | -------- | ----------------------------------------------- |
| `value`    | `string`                  | its text | What it's searched by and what `onSelect` gets. |
| `keywords` | `string[]`                | —        | More words it's found by, not shown.            |
| `disabled` | `boolean`                 | `false`  | Shown, but can't be selected.                   |
| `onSelect` | `(value: string) => void` | —        | Called on a click, or Enter while it's active.  |

### Command.Group and Command.Separator

`Command.Group` takes `heading` (`JSX.Element`). `Command.Separator` takes `alwaysRender` (`boolean`), to show it during a search too.

### CommandDialog

The Command's props above, the Modal's props listed above, and:

| Prop             | Type                                  | Default   | Description                                   |
| ---------------- | ------------------------------------- | --------- | --------------------------------------------- |
| `opened`         | `boolean`                             | —         | Whether it is open. Required.                 |
| `onOpenedChange` | `(opened: boolean) => void`           | —         | Called when it asks to open or close.         |
| `shortcut`       | `string \| readonly string[] \| null` | `'mod+K'` | The key press that asks it to open and close. |
| `closeOnSelect`  | `boolean`                             | `true`    | Whether selecting an item closes it.          |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-command` (`data-slot="command"`), a bordered surface; in a dialog, `.slp-command-dialog` is on the `<dialog>`, which is also a `.slp-modal`, and the modal is the surface.
- Classes and slots: `.slp-command-list` (`command-list`), `.slp-command-item` (`command-item`, with `data-active`, `data-disabled`, `data-value` when given, and `hidden` while not found), `.slp-command-group` (`command-group`), `command-group-heading`, `.slp-command-separator` (`command-separator`), `.slp-command-empty` (`command-empty`), `.slp-command-shortcut` (`command-shortcut`), and `command-input` around the input.
- An `svg` directly in an item is sized as an icon.
- The list's height: `.slp-command-list { max-height: 32rem }` (default `min(24rem, 60vh)`).
