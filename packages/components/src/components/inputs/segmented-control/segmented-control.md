# SegmentedControl

A row of options of which one is selected, with an indicator that slides to the selection. Use it for a few options that are all worth showing, like a view switcher.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see [Accessibility](#accessibility) below.

Two to five short options fit; a longer list belongs in a [Select](../select/select.md). It has no `label` prop: name it with `aria-label` or `aria-labelledby`.

```tsx
import { SegmentedControl } from '@solid-slopkit/components';
```

## Usage

```tsx
<SegmentedControl aria-label="Theme" data={['Light', 'Dark', 'System']} />
```

- **Data:** `data` lists the options. A string is both the value and the label. An object takes a `value`, a `label` (any JSX) and `disabled`.
- **Uncontrolled:** starts at `defaultValue`, or the first enabled option. Later changes to `data` or `defaultValue` do not reset the selection.
- **Controlled:** pass `value` and `onChange`. The selection only changes when the parent updates `value`. The value type is inferred from `data`. With `@solid-slopkit/signal-forms`, spread `bind(f.x)` on a `string` field.
- **First render:** the option matching `value` or `defaultValue` is selected from the start, also when the control mounts hidden (in a closed tab or modal): the indicator appears over it once shown, without sliding in.

```tsx
type View = 'list' | 'grid' | 'board';
const [view, setView] = createSignal<View>('grid');

<SegmentedControl
  aria-label="View"
  value={view()}
  onChange={setView}
  data={[
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'board', label: 'Board', disabled: true },
  ]}
/>;
```

- **Colors:** `color` fills the indicator with a color role and uses its `-content` color for the selected label. Without it the indicator is the base surface color.
- **Separators:** shown between options by default and hidden next to the selection. `withItemsBorders={false}` removes them.
- **Sizes:** `xs` to `xl`. Heights match Button's, so the two line up in a toolbar.
- **Layout:** `fullWidth` fills the container and gives every option an equal share. `orientation="vertical"` stacks the options.
- **States:** `disabled` disables every option. `readOnly` shows the value but ignores clicks, and keys only move focus; it does not call `onChange`.
- **Value with no match:** if `value` matches no option, nothing is selected and the indicator is hidden.

```tsx
<SegmentedControl aria-label="Period" color="primary" size="sm" fullWidth data={['Day', 'Week', 'Month']} />
```

## Props

Other props are passed to the root `div`.

| Prop                       | Type                                                                                               | Default              | Description                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------ |
| `data`                     | `readonly (T \| { value: T; label: JSX.Element; disabled?: boolean })[]`                           | —                    | The options. Required. `T extends string`.             |
| `value`                    | `T`                                                                                                | —                    | Selected value, for a controlled control.              |
| `defaultValue`             | `T`                                                                                                | first enabled option | Initial value, for an uncontrolled control.            |
| `onChange`                 | `(value: T) => void`                                                                               | —                    | Called with the newly selected value.                  |
| `name`                     | `string`                                                                                           | unique id            | Name of the radio inputs, for forms.                   |
| `disabled`                 | `boolean`                                                                                          | `false`              | Disables every option.                                 |
| `readOnly`                 | `boolean`                                                                                          | `false`              | Shows the value but does not let the user change it.   |
| `fullWidth`                | `boolean`                                                                                          | `false`              | Fills the container width, sharing it equally.         |
| `orientation`              | `'horizontal' \| 'vertical'`                                                                       | `'horizontal'`       | Direction.                                             |
| `size`                     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`               | Size.                                                  |
| `color`                    | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —                    | Indicator color role. Base surface color when omitted. |
| `withItemsBorders`         | `boolean`                                                                                          | `true`               | Separators between options.                            |
| `transitionDuration`       | `number`                                                                                           | `200`                | Indicator animation, in milliseconds.                  |
| `transitionTimingFunction` | `string`                                                                                           | `'ease'`             | Indicator easing.                                      |
| `ref`                      | `Ref<HTMLDivElement>`                                                                              | —                    | The root element.                                      |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-segmented-control`. It is a `role="radiogroup"` `div`.
- Slots: `[data-slot="segmented-control-indicator"]` (the sliding indicator), and per option `[data-slot="segmented-control-item"]` (with `data-active` and `data-disabled`), holding `[data-slot="segmented-control-input"]` (the visually hidden radio) and `[data-slot="segmented-control-label"]`.
- State attributes on the root: `data-orientation`, `data-size`, `data-color`, `data-full-width`, `data-disabled`, `data-read-only`, `data-with-items-borders`, and `data-ready` once the indicator has been placed (the indicator only animates after that).
- The indicator does not animate under `prefers-reduced-motion: reduce`. Before hydration the selected label draws the indicator's look itself, so server-rendered HTML shows the selection.

CSS variables, set on the control or any ancestor:

| Variable                          | Default                            | Description                                                                                                       |
| --------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--slp-segmented-control-radius`  | `10px`                             | Corner radius. The indicator and labels follow, inset by the padding.                                             |
| `--slp-segmented-control-color`   | `var(--slp-color-<color>)`         | Indicator color. Base surface color when there is no `color`. Use it for a one-off color that isn't a color role. |
| `--slp-segmented-control-content` | `var(--slp-color-<color>-content)` | Text color of the selected option on a colored indicator.                                                         |

## Accessibility

- Each option is a native radio input with a label. Tab focuses the selection. The arrow keys move it, in either axis whatever the `orientation`, wrapping around the ends; Home and End move it to the first and last option. Disabled options are skipped.
- An `onKeyDown` you pass runs first; `event.preventDefault()` in it keeps the key from moving the selection.
- Label the group with `aria-label` or `aria-labelledby`.
- The root has `aria-orientation`, and `aria-disabled="true"` when `disabled`.
- With a `name` inside a form, the selected value is submitted.
