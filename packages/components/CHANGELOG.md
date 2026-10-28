# @solid-slopkit/components

## 0.7.0

### Minor Changes

- 70e9de3: **Breaking:** `@solid-slopkit/i18n` is now a peer dependency; install it next to the components. `<SlopkitUi>` formats with the active locale of the nearest `<I18nProvider>` when its `locale` prop is not set, so an app that uses both sets the locale once, on the i18n provider. The `locale` prop still wins.

## 0.6.0

### Minor Changes

- 648b7b0: **Breaking:** Stack no longer takes `divided` or sets `data-divided`. A Stack only spaces its children and never changes their padding, margin or borders; for lines between children, put a Divider between them.

### Patch Changes

- b70dceb: Radio.Card's and Checkbox.Card's indicators are now 16px instead of 20px, centered on the first line of the content.

## 0.5.0

### Minor Changes

- d9cf523: Combobox has a search field for the dropdown: `Combobox.Search`, for a target that can't take text, such as a button. It takes focus when the dropdown opens, makes the selected option active (else the first), takes the same keys as the target, and makes the first option active as you type. Closing brings focus back to the target, and focus leaving the dropdown closes it. Its box has the class `.slp-combobox-search` (slot `combobox-search`).
- 4f037e1: Select behaves like a native select: the field is always a button, choosing the selected option again keeps it without calling `onChange`, and the check mark on the selected option moves to the end of the row. **Breaking:** Select no longer takes `searchable`, `clearable`, `clearLabel`, `allowDeselect` or `nothingFoundMessage`, and drops the `select-clear` slot. `onChange` is now `(value: string, item: SelectItem) => void`, since the select can't clear its value; a controlled `value` of `null` still shows the placeholder. To filter a list by typing, build the picker from Combobox.

## 0.4.0

### Minor Changes

- 6ce1ec9: NavLink and AppShell's MenuButton and MenuSubButton follow `@solidjs/router` like NavTabs: a link the router marks with `data-active` is drawn as current, and the router's `aria-current="page"` is left as it sets it. **Breaking:** they no longer take `active` or set `data-current` and `aria-current="false"`. Without the router, or on a button row, set `data-active` and `aria-current="page"` yourself. The router marks a link to a parent path on its child pages too, so give each link its own path.
- edf83a0: NavTabs follows `@solidjs/router`: a link the router marks with `data-active` is drawn as the selected tab, and the router's `aria-current="page"` is left as it sets it. **Breaking:** NavTabs.Link no longer takes `active` or sets `data-current` and `aria-current="false"`; without the router, set `data-active` and `aria-current="page"` on the current link yourself. The router marks a link to a parent path on its child pages too, so give each tab its own path.

## 0.3.0

### Minor Changes

- 4b5f79c: NavTabs: navigation drawn as tabs. A `nav` of `NavTabs.Link`s, plain links (or a router's, through `as`) with the current page's link marked by `active`, in every Tabs variant, color, size and orientation. Tabs now marks a disabled tab with `[data-disabled]` in its CSS instead of `:disabled`, which it already set.
- afd6d33: Tabs takes `variant="soft"`: rounded tabs like `pills`, with the selected one tinted with its color instead of filled.

### Patch Changes

- ed2e91b: Tooltip no longer shows the moment it's enabled after its target was hovered while it was disabled. In AppShell, rows hovered while the sidebar was expanded no longer show their tooltips once it collapses to its icons.

## 0.2.1

### Patch Changes

- 1220e49: The LLM references name the form-state package by its published name, `@solid-slopkit/signal-forms`, and the `llms.md` index points at its binding guide in `node_modules/@solid-slopkit/signal-forms/`.

## 0.2.0

### Minor Changes

- 6291dd2: Button and ActionIcon now mark `active` (the pressed look) with `data-pressed` instead of `data-active`. A router writes `data-active` on every link it claims, and since Solid rc.15 that includes a Button or ActionIcon rendered `as="a"`, which made links to the current page look pressed. Update custom CSS that targets `.slp-button[data-active]` to `[data-pressed]`.

### Patch Changes

- The package no longer ships the SSR test fixtures (`*.fixtures`), which added 240 files to `dist`.
- 956a5b9: Requires `solid-js` and `@solidjs/web` 2.0.0-rc.15 or later.

  - A Checkbox or Switch without a `value` now submits `on`, as documented. rc.15 leaves out an empty `value` attribute.
  - A writable derived signal applies a write first and re-runs its function on the next source change (since rc.14). `Burger` and `PasswordInput` are tested against that order.

- daabb60: Document the dev-only unstyled flash in apps that render on the server with `@solidjs/vite-plugin` start mode, and the `start.css.filter.include` setting that fixes it.

## 0.1.0

### Minor Changes

- The default theme is now neutral: grey base colors and a near-black primary (near-white in dark mode), with violet kept as the secondary. Its colors are written in `oklch`, and it sets `--slp-heading-weight` to 700. Apps that relied on the blue primary can set `--slp-color-primary` and `--slp-color-primary-content` in their own theme.

### Patch Changes

- efe740e: SegmentedControl mounted in a hidden container (a closed tab or modal) no longer shows its indicator sliding in from the first option once it is shown, and no longer reports an untracked read when its props come from an inline spread such as `{...bind(f.x)}`. Forms adds `bind.nativeSelect(f)` for `NativeSelect`, whose `onChange` stays the native event, and the binding guide now has a row for every ui input. The ui LLM index describes every entry and has a guide to picking a single-value input; the Select and NativeSelect references say when to choose the other.

## 0.0.1

### Patch Changes

- First release: a component library for SolidJS 2.x, styled with plain CSS and CSS variables. Layout, buttons, inputs, overlays, navigation, feedback and data display components, with a provider, themes and color schemes; dates at `/dates`, a carousel at `/carousel` and behavior primitives at `/primitives`. Ships its LLM references and skills.
