# @solid-slopkit/components

A component library for SolidJS 2.x, styled with plain CSS and CSS variables. Solid is not React: components run once, and reactivity comes from signals.

Each link below is the reference for one component: its props, examples, and the selectors and CSS variables to customize it with. Paths are relative to this file.

Task guides live next to `dist/` in the package, at `node_modules/@solid-slopkit/components/skills/<area>/SKILL.md`:

- `skills/theming/SKILL.md`: change the look, write themes, light/dark toggle, customize one component.
- `skills/layout/SKILL.md`: pick a layout component, style props, responsive values.

## Setup

```tsx
import { SlopkitUi } from '@solid-slopkit/components';
import '@solid-slopkit/components/styles/slopkit.css';
import '@solid-slopkit/components/styles/default-theme.css';

export function Root() {
  return <SlopkitUi>{/* your app */}</SlopkitUi>;
}
```

- [SlopkitUi](components/provider/slopkit-ui.md): the provider, required at the root. Locale (`useLocale()`, read from `<I18nProvider>` when there is one) and the color scheme (`useColorScheme()`).

Server rendering with the Vite dev server (`@solidjs/vite-plugin` in start mode, `solid({ start: true, ssr: true })`): every component is unstyled for about a second after each reload in dev, because the plugin's dev CSS crawl skips `node_modules`, so each component's CSS module only arrives once the client JS loads. Add the package to the crawl in `vite.config.ts`; the object replaces `start: true` and still enables start mode. Production builds and client-only apps don't need this.

```ts
solid({
  start: { css: { filter: { include: /@solid-slopkit\/components/ } } },
  ssr: true,
  // …the app's other options
}),
```

## Conventions

- `style` takes an object with kebab-case keys, on every component: `style={{ 'max-width': '20rem' }}`. A CSS string is a type error.
- `class` takes a string, an array or an object, as on a plain element.

## Theming in one paragraph

A theme is a CSS rule that sets the `--slp-*` tokens: the default theme sets them on `:root`, and any other theme on `[data-slp-theme="<name>"]`, for the whole page or a subtree. Components read only tokens. The `color` prop of a component takes a color role: `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning` or `error`. A one-off color goes through the component's CSS variable, like `--slp-button-color`. Every component rule lives in `@layer slopkit.components`, so unlayered app CSS overrides it. The default theme's roles reach 4.5:1 against their content colors and as text on `base-100`, in light and dark. The theming skill has the full token list.

## Layout

Only layout components take style props, and each takes its own set. The Box reference documents them all, with the spacing scale and the responsive syntax.

- [Box](components/layout/box/box.md): a div with style props. Includes the style props reference.
- [Flex](components/layout/flex/flex.md): a flex container with responsive flex style props
- [Stack](components/layout/stack/stack.md): children in a column, with a gap
- [Group](components/layout/group/group.md): children in a row, with a gap, wrapping and centered vertically
- [SimpleGrid](components/layout/simple-grid/simple-grid.md): a grid of equal-width columns, one child per cell
- [Grid](components/layout/grid/grid.md): a 12-column grid of Grid.Col spans that wrap into rows
- [Container](components/layout/container/container.md): centered content with a max width and inline padding, for a page or a full-width section
- [Center](components/layout/center/center.md): centers its content horizontally and vertically
- [AspectRatio](components/layout/aspect-ratio/aspect-ratio.md): keeps its child at a width-to-height ratio, for images, videos and embeds
- [Space](components/layout/space/space.md): a one-off empty gap between elements

## Buttons

- [ActionIcon](components/button/action-icon/action-icon.md): an icon-only button, square or round, named by `label`
- [Burger](components/button/burger/burger.md): a three-line button that turns into an X while the navigation it toggles is open
- [Button](components/button/button/button.md): triggers an action; variants, sizes, colors, loading state, sections
- [CloseButton](components/button/close-button/close-button.md): a ghost button with an X, for closing what it sits in
- [CopyButton](components/button/copy-button/copy-button.md): copies a value to the clipboard and confirms it for a moment
- [FileButton](components/button/file-button/file-button.md): a Button that opens the browser's file picker and hands over the files

## Data display

- [Avatar](components/data-display/avatar/avatar.md): with Avatar.Group
- [BackgroundImage](components/data-display/background-image/background-image.md): a box with a covering image behind its content
- [Badge](components/data-display/badge/badge.md): a short label for a status, a category or a count
- [ColorSwatch](components/data-display/color-swatch/color-swatch.md): a round sample of a color, over a checkerboard for transparency
- [Divider](components/data-display/divider/divider.md): a thin line between content, horizontal or vertical
- [Image](components/data-display/image/image.md): an `img` that fills its box, with a fallback source
- [Indicator](components/data-display/indicator/indicator.md): a dot or small label pinned to a corner or edge of its child
- [NumberFormatter](components/data-display/number-formatter/number-formatter.md): a number formatted for the reader's locale
- [Table](components/data-display/table/table.md): rows and columns of data, built from Table.Thead, Table.Tbody, Table.Tr, Table.Th, Table.Td and the rest
- [ThemeIcon](components/data-display/theme-icon/theme-icon.md): an icon in a colored box
- [Timeline](components/data-display/timeline/timeline.md): events in order, joined by a line, with Timeline.Item

## Feedback

- [Alert](components/feedback/alert/alert.md): a message that needs attention, with an optional icon, title and close button
- [Loader](components/feedback/loader/loader.md): a loading spinner, dots or bars, with `role="status"`
- [Notification](components/feedback/notification/notification.md): the card of one notification: title, icon or colored bar, close button. Notifications shows them
- [Notifications](components/feedback/notifications/notifications.md): the region notifications appear in, `useNotifications()` and the `notifications` facade
- [Progress](components/feedback/progress/progress.md): a progress bar, with `role="progressbar"`
- [RingProgress](components/feedback/ring-progress/ring-progress.md): any diameter, stroke thickness, round or flat caps, stacked center
- [SemiCircleProgress](components/feedback/semi-circle-progress/semi-circle-progress.md): progress as a half ring, a gauge
- [Skeleton](components/feedback/skeleton/skeleton.md): a placeholder shown while content loads, sized by its children or by `style`

## Surfaces

- [Card](components/surfaces/card/card.md): Card.Header with Card.Title and Card.Description, Card.Image, Card.Body, Card.Footer
- [Paper](components/surfaces/paper/paper.md): a surface that groups content: background, padding, radius, optional border and shadow

## Typography

- [Anchor](components/typography/anchor/anchor.md): a link, in the primary color
- [Blockquote](components/typography/blockquote/blockquote.md): a quotation with its attribution
- [Code](components/typography/code/code.md): inline code, or a code block with `block`
- [Highlight](components/typography/highlight/highlight.md): text with every match of a term marked
- [Kbd](components/typography/kbd/kbd.md): a keyboard key, drawn as a keycap
- [List](components/typography/list/list.md): a bulleted or numbered list of List.Item
- [Mark](components/typography/mark/mark.md): highlighted text, tinted with a color role
- [Text](components/typography/text/text.md): copy and display sizes, alignment, tabular numbers, uppercase labels
- [Title](components/typography/title/title.md): a heading, `h1` to `h6`, from the heading scale
- [VisuallyHidden](components/typography/visually-hidden/visually-hidden.md): content for screen readers that the page doesn't show

## Inputs

### Picking one value

- **2–5 short options, always visible:** [SegmentedControl](components/inputs/segmented-control/segmented-control.md) (a compact row, like a view switcher) or [Radio.Group](components/inputs/radio/radio.md) (a labelled list, room for descriptions).
- **A dropdown:** [Select](components/inputs/select/select.md). The default: themed, behaves like a native select (no search, no clear button), keyboard and ARIA behavior tested, and bound with `bind(f.x)` from `@solid-slopkit/signal-forms`.
- **The operating system's own picker:** [NativeSelect](components/inputs/native-select/native-select.md), only when you want it (mobile-first forms) and accept the browser's look for the list, which can't be themed. Bound with `bind.nativeSelect(f.x)`.
- **Several values:** [MultiSelect](components/inputs/multi-select/multi-select.md) from a dropdown, [Checkbox.Group](components/inputs/checkbox/checkbox.md) or [Chip.Group](components/inputs/chip/chip.md) `multiple` from a short visible list.
- **Free text with suggestions:** [Autocomplete](components/inputs/autocomplete/autocomplete.md) for one value, [TagsInput](components/inputs/tags-input/tags-input.md) for several.
- **On or off:** [Switch](components/inputs/switch/switch.md) for a setting that applies at once, [Checkbox](components/inputs/checkbox/checkbox.md) for a choice submitted with the form.

Every input here works with `@solid-slopkit/signal-forms`: its binding reference, `node_modules/@solid-slopkit/signal-forms/dist/source/guides/binding.md`, gives the call and the field type for each one, the `dates` inputs included.

### Components

- [AngleSlider](components/inputs/angle-slider/angle-slider.md): an angle, 0° to 360°, picked on a dial with the pointer or the arrow keys
- [Autocomplete](components/inputs/autocomplete/autocomplete.md): a text field with suggestions from a list; the value is the free text typed
- [Checkbox](components/inputs/checkbox/checkbox.md): one on/off choice, with Checkbox.Group for several values from a short list and Checkbox.Card
- [Chip](components/inputs/chip/chip.md): a toggle pill, with Chip.Group for one value or several from a short, always visible list
- [ColorInput](components/inputs/color-input/color-input.md): a color as text, with a swatch, a ColorPicker dropdown and an eye dropper
- [ColorPicker](components/inputs/color-picker/color-picker.md): a color picked on an inline panel: saturation and brightness area, hue and alpha sliders, swatches. In a field, use ColorInput
- [Combobox](components/inputs/combobox/combobox.md): the building block for pickers, with createCombobox(), Combobox.Target, Combobox.Dropdown, Combobox.Search, Combobox.Options, Combobox.Option, Combobox.Group and Combobox.Empty
- [Dropzone](components/inputs/dropzone/dropzone.md): an area that takes dropped or picked files, checks them, and shows whether it would take a drag, with Dropzone.Idle, Dropzone.Accept and Dropzone.Reject
- [Fieldset](components/inputs/fieldset/fieldset.md): a group of related fields with a legend
- [FileInput](components/inputs/file-input/file-input.md): a labelled field whose control opens the browser's file picker and shows the chosen names
- [Input](components/inputs/input/input.md): the field box, with sections
- [InputWrapper](components/inputs/input-wrapper/input-wrapper.md): label (with an optional section at its row's end), description and error around a field; `useInputWrapper()`
- [JsonInput](components/inputs/json-input/json-input.md): a monospace textarea that checks and formats JSON
- [MultiSelect](components/inputs/multi-select/multi-select.md): several values from a dropdown list, shown as pills, searchable
- [NativeSelect](components/inputs/native-select/native-select.md): the browser's own select in a themed box; the open list isn't themeable. Prefer Select unless you want the operating system's picker
- [NumberInput](components/inputs/number-input/number-input.md): a number field with step buttons, in the provider's locale
- [PasswordInput](components/inputs/password-input/password-input.md): a password field with a show/hide toggle
- [Pill](components/inputs/pill/pill.md): a small tag for a chosen value, with Pill.Group and an optional remove button
- [PillsInput](components/inputs/pills-input/pills-input.md): a field box of pills and PillsInput.Field, the base of MultiSelect and TagsInput
- [PinInput](components/inputs/pin-input/pin-input.md): a one-time code or PIN, one field per character, with paste and autofill
- [Radio](components/inputs/radio/radio.md): one value from a short, always visible list: Radio.Group of Radio, and Radio.Card
- [RangeSlider](components/inputs/range-slider/range-slider.md): two values, a range, picked on a track with two thumbs
- [Rating](components/inputs/rating/rating.md): a star rating, whole or fractional stars, or read-only stars
- [SegmentedControl](components/inputs/segmented-control/segmented-control.md): one value from 2–5 short options, always visible, as a row of segments with a sliding indicator
- [Select](components/inputs/select/select.md): one value from a dropdown list, behaving like a native select. The default dropdown: themed, keyboard and ARIA tested, binds with `bind()`
- [Slider](components/inputs/slider/slider.md): one number picked on a track, with optional marks and a value bubble
- [Switch](components/inputs/switch/switch.md): one on/off setting that applies at once, with Switch.Group
- [TagsInput](components/inputs/tags-input/tags-input.md): free-text tags as pills, added with Enter or a comma, with optional suggestions
- [TextInput](components/inputs/text-input/text-input.md): a labelled one-line text field
- [Textarea](components/inputs/textarea/textarea.md): a labelled multi-line text field, with autosize

## Navigation

- [Accordion](components/navigation/accordion/accordion.md): sections that open under their headings, one at a time or several
- [AppShell](components/navigation/app-shell/app-shell.md): the app's frame, a sidebar of navigation next to the main area, collapsing on wide screens and a drawer on narrow ones; `useAppShell()`
- [Breadcrumbs](components/navigation/breadcrumbs/breadcrumbs.md): the path to the current page, its children in a list with separators
- [Command](components/navigation/command/command.md): a search over a list of commands, with Command.Input, Command.List, Command.Item, Command.Group, Command.Separator, Command.Empty and Command.Shortcut; CommandDialog puts one in a modal opened with ⌘K
- [NavLink](components/navigation/nav-link/nav-link.md): a link in a navigation list, drawn as current when the router marks it, or a parent of nested links
- [NavTabs](components/navigation/nav-tabs/nav-tabs.md): links drawn as tabs, for navigation between pages, with NavTabs.Link
- [Pagination](components/navigation/pagination/pagination.md): buttons or links to move between pages
- [Stepper](components/navigation/stepper/stepper.md): progress through steps, the current step's content under them
- [TableOfContents](components/navigation/table-of-contents/table-of-contents.md): links to the page's headings, the one being read marked as it scrolls
- [Tabs](components/navigation/tabs/tabs.md): a tablist and its panels, with Tabs.List, Tabs.Tab and Tabs.Panel; for tabs that navigate between pages, use NavTabs
- [Tree](components/navigation/tree/tree.md): a hierarchy of nodes that expand, collapse and can be selected, from data

## Overlays

- [Affix](components/overlays/affix/affix.md): content pinned to a spot in the viewport
- [Dialog](components/overlays/dialog/dialog.md): a non-modal window in a corner of the viewport
- [Drawer](components/overlays/drawer/drawer.md): a modal `<dialog>` panel against an edge
- [HoverCard](components/overlays/hover-card/hover-card.md): HoverCard.Target and HoverCard.Dropdown, shown on hover and keyboard focus
- [LoadingOverlay](components/overlays/loading-overlay/loading-overlay.md): an Overlay with a Loader, for content that's loading
- [Menu](components/overlays/menu/menu.md): Menu.Target, Menu.Dropdown, Menu.Item, Menu.Label and Menu.Divider
- [Modal](components/overlays/modal/modal.md): a modal `<dialog>` with a title and close button
- [Modals](components/overlays/modals/modals.md): open modals and confirm modals from code, with `useModals()` and the `modals` facade
- [Overlay](components/overlays/overlay/overlay.md): a layer over its parent
- [Popover](components/overlays/popover/popover.md): Popover.Target and Popover.Dropdown
- [Tooltip](components/overlays/tooltip/tooltip.md): a description shown on hover and keyboard focus

## Utilities

- [Collapse](components/utilities/collapse/collapse.md): Collapse.Title and Collapse.Content, animated in CSS
- [FloatingIndicator](components/utilities/floating-indicator/floating-indicator.md): a box that glides to the active element of a group
- [ScrollArea](components/utilities/scroll-area/scroll-area.md): a scrolling box with thin scrollbars drawn over it
- [Spoiler](components/utilities/spoiler/spoiler.md): content cut to a height, with a control to show the rest
- [Transition](components/utilities/transition/transition.md): enter and exit animations

## Carousel (`@solid-slopkit/components/carousel`)

A separate entry, because it needs `embla-carousel`, an optional peer dependency: install it next to the package (`pnpm add embla-carousel`). The main entry never imports it.

- [Carousel](carousel/carousel.md): slides moved through by dragging, buttons, arrow keys or indicators, with Carousel.Slide

## Dates (`@solid-slopkit/components/dates`)

A separate entry for dates and the date components, on native `Date` and `Intl` with no date library.

- [Dates](dates/dates.md): day arithmetic, the month grid, the locale's week, and formatting in the provider's locale
- [Calendar](dates/calendar/calendar.md): days, months or years in keyboard-navigable grids; the base of the pickers
- [MiniCalendar](dates/mini-calendar/mini-calendar.md): a strip of days, previous and next, to choose one day
- [DatePicker](dates/date-picker/date-picker.md): a Calendar that chooses one day, several, or a range
- [MonthPicker](dates/month-picker/month-picker.md): a Calendar of months that chooses one month, several, or a range
- [YearPicker](dates/year-picker/year-picker.md): a Calendar of decades that chooses one year, several, or a range
- [DatePickerInput](dates/date-picker-input/date-picker-input.md): a field that shows days and chooses them in a DatePicker dropdown
- [MonthPickerInput](dates/month-picker-input/month-picker-input.md): a field that shows months and chooses them in a MonthPicker dropdown
- [YearPickerInput](dates/year-picker-input/year-picker-input.md): a field that shows years and chooses them in a YearPicker dropdown
- [DateInput](dates/date-input/date-input.md): a text field for a day, typed or chosen in a DatePicker dropdown
- [TimeInput](dates/time-input/time-input.md): the browser's time field, with a `HH:mm` value
- [TimePicker](dates/time-picker/time-picker.md): a time field in the locale's 12 or 24 hours, with segments and a dropdown
- [TimeGrid](dates/time-grid/time-grid.md): a grid of times to choose one from, such as free slots
- [DateTimePicker](dates/date-time-picker/date-time-picker.md): a field for a date and time, chosen in a calendar and a time picker

## Primitives (`@solid-slopkit/components/primitives`)

The behavior the components are built from, for building your own: overlays that animate, position, close and handle focus like the library's, and list keyboard navigation with typeahead.

- [Primitives](primitives/primitives.md): createPresence, createFloating, createDismissal, createFocusScope with getTabbables, createScrollLock, createListNavigation, createTypeahead
