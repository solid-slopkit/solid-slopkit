# Combobox

The building block for picking from a list of options with a field or a button, optionally with a search field in the dropdown: a target with `role="combobox"`, and a dropdown with a `listbox` in the browser's top layer. Select, Autocomplete, MultiSelect and TagsInput are built from it; use it directly for a picker they don't cover.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** and **Focus** below.

```tsx
import { Combobox, createCombobox } from '@solid-slopkit/components';
```

## Usage

A button with a search field in the dropdown:

```tsx
const [value, setValue] = createSignal<string>();
const [query, setQuery] = createSignal('');
const combobox = createCombobox({ onChange: (opened) => opened && setQuery('') });
const shown = () => languages.filter((language) => language.toLowerCase().includes(query().toLowerCase()));

<Combobox store={combobox} onOptionSubmit={setValue}>
  <Combobox.Target>
    {(target) => (
      <Button {...target} aria-label="Language" variant="outline" onClick={() => combobox.toggle()}>
        {value() ?? 'Select language…'}
      </Button>
    )}
  </Combobox.Target>
  <Combobox.Dropdown>
    <Combobox.Search aria-label="Search language" value={query()} onInput={(event) => setQuery(event.currentTarget.value)} />
    <Combobox.Options aria-label="Languages">
      <For each={shown()}>
        {(language) => (
          <Combobox.Option value={language} selected={value() === language}>
            {language}
          </Combobox.Option>
        )}
      </For>
    </Combobox.Options>
    <Show when={shown().length === 0}>
      <Combobox.Empty>No language found.</Combobox.Empty>
    </Show>
  </Combobox.Dropdown>
</Combobox>;
```

An input that filters as you type:

```tsx
const combobox = createCombobox();
const [query, setQuery] = createSignal('');
const shown = () => countries.filter((country) => country.toLowerCase().includes(query().toLowerCase()));

<Combobox store={combobox} onOptionSubmit={(country) => setQuery(country)}>
  <Combobox.Target>
    {(target) => (
      <TextInput
        {...target}
        label="Country"
        autocomplete="off"
        aria-autocomplete="list"
        value={query()}
        onClick={() => combobox.open()}
        onInput={(event) => {
          setQuery(event.currentTarget.value);
          combobox.open();
          combobox.activateFirst();
        }}
      />
    )}
  </Combobox.Target>
  <Combobox.Dropdown>
    <Combobox.Options aria-label="Countries">
      <For each={shown()}>{(country) => <Combobox.Option value={country}>{country}</Combobox.Option>}</For>
    </Combobox.Options>
    <Show when={shown().length === 0}>
      <Combobox.Empty>No country matches</Combobox.Empty>
    </Show>
  </Combobox.Dropdown>
</Combobox>;
```

- **Store:** `createCombobox()` holds the state: whether it's open, and which option is active. Create it in the component that renders the Combobox and pass it as `store`; call its methods from your handlers (below). One store drives one Combobox. Options: `opened` (an accessor, for a controlled one), `defaultOpened`, `onChange(opened)` (called whenever it opens or closes), `loop` (an accessor, default `true`).
- **Parts:** `Combobox.Target`, `Combobox.Dropdown`, and inside the dropdown an optional `Combobox.Search`, `Combobox.Options` (the `listbox`) with `Combobox.Option`s, optionally in `Combobox.Group`s, and `Combobox.Empty` next to the options. Inside `<SlopkitUi>`. The parts throw outside a Combobox.
- **Target:** its child is a function that gets the attributes; spread them on an input or a button that takes a ref: `ref`, `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (while the listbox is rendered), `aria-activedescendant` and `onKeyDown`. To add your own key handler, call `target.onKeyDown(event)` from it. The function runs once: values that change go in JSX expressions (`value={query()}`), not in variables read before the JSX. Spread `target` in the JSX itself; an object spread (`{ ...target }`) reads its getters once. Opening on a click, on focus or on input is up to you: `onClick={() => combobox.open()}`. Set `aria-autocomplete="list"` on an input that filters.
- **Keyboard** (on the target): ArrowDown and ArrowUp open it on the selected option, else the first or last, and then move the active option (looping, unless `loop` is off); Alt+ArrowDown opens it without an active option and Alt+ArrowUp closes it; Home and End go to the first and last option, except in a text field, where they move the caret; Enter chooses the active option; Escape closes it; Tab closes it and moves on. Disabled options are skipped.
- **Focus** stays on the target the whole time, unless there's a Combobox.Search (below): the active option is announced through `aria-activedescendant`, marked with `data-active`, and scrolled into view in the listbox. Pressing an option or the dropdown's padding doesn't take focus; a field inside the dropdown does.
- **Search in the dropdown:** for a target that can't take text, such as a button, put `Combobox.Search` above Combobox.Options. It's an [Input](../input/input.md) (`ghost`, `sm`, with a search icon `leftSection` replaces) with `role="combobox"` that controls the listbox. When the dropdown opens, focus moves to it and the selected option becomes active, else the first (opening from the target's arrow keys keeps the one they chose). It takes the same keys as the target. Typing makes the first option active after your `onInput`; the query is yours (`value`, `onInput`), so clear it as the dropdown opens: `createCombobox({ onChange: (opened) => opened && setQuery('') })`. Not as it closes: the options would come back while it fades out. Closing brings focus back to the target; Tab moves on to a field or button lower in the dropdown, and focus leaving the dropdown closes it. Named `'Search'` by default; pass `aria-label`. Other props go to the Input.
- **Choosing:** a click on an option, or Enter on the active one, calls `onOptionSubmit(value)` and closes it (`closeOnOptionSubmit={false}` keeps it open, for picking several). The pointer over an option makes it active.
- **Options:** `value` (what `onOptionSubmit` gets), `selected` (`aria-selected="true"`; where the keyboard starts when it opens), `disabled`. Other props, such as children with icons or a description, go to the `div`. Mark several selected and set `aria-multiselectable="true"` on Combobox.Options for a multiple choice.
- **Names:** name Combobox.Options with `aria-label` or `aria-labelledby`. A button target shows the value, which doesn't name a combobox: give it an `aria-label` or `aria-labelledby` too. Combobox.Group's `label` names the group.
- **Closing:** Escape and a press outside the target and the dropdown close it (`closeOnEscape`, `closeOnClickOutside`), the innermost first with nested overlays.
- **Position:** under the target and as wide as it by default (`position`, `offset` default 4, `matchTargetWidth` default `true`). It flips when there's no room and follows the target on scroll. The listbox scrolls past 15rem.
- **Animation:** `transition` takes [Transition](../../utilities/transition/transition.md)'s presets (default `fade`), `transitionDuration` (ms, default 150). None under `prefers-reduced-motion`.
- **Server:** a closed combobox renders only its target; one with `defaultOpened` renders its dropdown, which is shown once hydrated.

## Store methods

| Method                                 | Description                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `opened()`                             | Whether the dropdown is open.                                                     |
| `open()`, `close()`, `toggle()`        | Open or close it. The options are rendered by the time `open()` returns.          |
| `activeId()`                           | The active option's id, or `undefined`.                                           |
| `activateFirst()`, `activateLast()`    | Make the first or last enabled option active. Return whether there was one.       |
| `activateNext()`, `activatePrevious()` | Move the active option, from the first or last when none is active.               |
| `activateSelected()`                   | Makes the first selected option active. Returns whether there was one.            |
| `activate(value)`                      | Makes the enabled option with this `value` active. Returns whether there was one. |
| `clearActive()`                        | Makes no option active.                                                           |
| `submitActive()`                       | Chooses the active option, as a click would. Returns whether there was one.       |

The `activate*` methods render pending changes first, so calling one right after changing the query finds the new options.

## Props

| Prop                  | Type                      | Default    | Description                                     |
| --------------------- | ------------------------- | ---------- | ----------------------------------------------- |
| `store`               | `ComboboxStore`           | —          | The state, from `createCombobox()`. Required.   |
| `onOptionSubmit`      | `(value: string) => void` | —          | Called with the chosen option's `value`.        |
| `closeOnOptionSubmit` | `boolean`                 | `true`     | Whether choosing an option closes it.           |
| `position`            | `ComboboxPosition`        | `'bottom'` | Where the dropdown goes against the target.     |
| `offset`              | `number`                  | `4`        | Gap between the target and the dropdown, in px. |
| `matchTargetWidth`    | `boolean`                 | `true`     | Makes the dropdown as wide as the target.       |
| `closeOnEscape`       | `boolean`                 | `true`     | Whether Escape closes it.                       |
| `closeOnClickOutside` | `boolean`                 | `true`     | Whether a press outside closes it.              |
| `transition`          | `TransitionName`          | `'fade'`   | The dropdown's animation.                       |
| `transitionDuration`  | `number`                  | `150`      | Duration of the animation, in ms.               |

Combobox.Search takes Input's props and passes the rest to the `input`. Combobox.Dropdown, Combobox.Options, Combobox.Group and Combobox.Empty pass other props to their `div`; Combobox.Option takes `value`, `selected` and `disabled`, and passes the rest to its `div`.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-combobox` (the dropdown, also `[data-slot="combobox-dropdown"]`), `.slp-combobox-search` (around the search field's Input, also `[data-slot="combobox-search"]`), `.slp-combobox-options` (also `[data-slot="combobox-options"]`), `.slp-combobox-option`, `.slp-combobox-group`, `.slp-combobox-empty`.
- Slot: `combobox-group-label`.
- Attributes: on the dropdown `data-placement`, `data-status`, `data-transition`; on an option `data-value`, `data-active`, `data-selected`, `data-disabled`.
- The listbox's height: `.slp-combobox-options { max-height: 15rem }`.
