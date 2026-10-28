# DatePickerInput

A labelled field for a day, several days or a range: a button that shows the value, written by the locale, and opens a [DatePicker](../date-picker/date-picker.md) in a dropdown under it.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Dropdown** below.

```tsx
import { DatePickerInput } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [day, setDay] = createSignal<Date | null>(null);
<DatePickerInput label="Due" placeholder="Pick a day" value={day()} onChange={setDay} clearable />;

<DatePickerInput label="Stay" type="range" numberOfColumns={2} name="stay" />;
```

- **Value:** as DatePicker's: `type` (read once) is `default` (a `Date` or `null`), `multiple` (`Date[]`) or `range` (`[start, end]`). Uncontrolled with `defaultValue` (read once) or controlled with `value`; `onChange(value)` gets the new value. Days are `Date`s at local midnight (see [Dates](../dates.md)).
- **Field:** a `button` in an [Input](../../components/inputs/input/input.md)'s box, with `aria-haspopup="dialog"` and `aria-expanded`. It's named by the label and described by the value it shows. While empty it shows `placeholder` and has `data-empty`.
- **Text:** each day is written with `Intl.DateTimeFormat` in the provider's locale (or `locale`), with `valueFormat` options (default `{ dateStyle: 'medium' }`, "Oct 15, 2026"). Several days are joined with commas; a range's ends with `labelSeparator` (default `–`), and a range with only its start shows it followed by the separator.
- **Dropdown:** a click on the field (or Enter, Space) opens it, and a second click closes it. It's a `dialog` named by the label, in the top layer, under the field box (`position`, default `bottom-start`; `offset`, default 4). The calendar takes the focus, on the chosen day, today, or the first day it shows. Escape and a press outside close it, and so does focus leaving both the field and the dropdown; Escape and a choice return the focus to the field.
- **Closing on a choice:** choosing a day closes it, and so does a range's end; several days keep it open. `closeOnChange={false}` keeps it open for every type.
- **Calendar:** every DatePicker prop goes to the calendar: `allowDeselect`, `allowSingleDateInRange`, levels, `minDate`, `maxDate`, `excludeDate`, `getDayProps`, `numberOfColumns`, the week props, `color`, labels. It opens on the month of the first chosen day, unless `defaultDate` says otherwise. `size` sizes the field and the calendar.
- **Clear:** `clearable` adds a button (named `clearLabel`, default `Clear`) in the right section while there's a value; it empties the value and focuses the field. Otherwise `rightSection` shows there.
- **Forms:** `name` adds a hidden input with the value as ISO days: `2026-10-15`, comma-separated for several days or a range, empty when there's none.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. A button can't be `required`, so `required` shows the asterisk and sets `aria-required`.
- **States:** `disabled` disables the button; `readOnly` shows the value without opening (`aria-readonly`) and hides the clear button. `variant` and `leftSection` go to the box.
- **Animation:** `transition` (default `fade`) and `transitionDuration` (ms, default 150). None under `prefers-reduced-motion`. Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts); other props go to the button.

## Props

The DatePicker's props (`type`, `value`, `defaultValue`, `onChange`, `allowDeselect`, `allowSingleDateInRange` and the Calendar's, except `size` and `minLevel`), plus:

| Prop                 | Type                             | Default                   | Description                                     |
| -------------------- | -------------------------------- | ------------------------- | ----------------------------------------------- |
| `placeholder`        | `string`                         | —                         | Shown while nothing is chosen.                  |
| `valueFormat`        | `Intl.DateTimeFormatOptions`     | `{ dateStyle: 'medium' }` | How a day is written in the field.              |
| `labelSeparator`     | `string`                         | `' – '`                   | Between a range's two days.                     |
| `closeOnChange`      | `boolean`                        | `true`                    | Closes on a chosen day or a range's end.        |
| `clearable`          | `boolean`                        | `false`                   | Adds a button that clears the value.            |
| `clearLabel`         | `string`                         | `'Clear'`                 | The clear button's name.                        |
| `name`               | `string`                         | —                         | Submits the ISO days through a hidden input.    |
| `readOnly`           | `boolean`                        | `false`                   | Shows the value without letting it change.      |
| `disabled`           | `boolean`                        | `false`                   | Disables the field.                             |
| `variant`            | `'outline' \| 'soft' \| 'ghost'` | `'outline'`               | The box's look.                                 |
| `leftSection`        | `JSX.Element`                    | —                         | Content before the value.                       |
| `rightSection`       | `JSX.Element`                    | —                         | Content after the value, when there's no clear. |
| `position`           | `FloatingPlacement`              | `'bottom-start'`          | Where the dropdown goes against the field.      |
| `offset`             | `number`                         | `4`                       | Gap between the field and the dropdown, in px.  |
| `transition`         | `TransitionName`                 | `'fade'`                  | The dropdown's animation.                       |
| `transitionDuration` | `number`                         | `150`                     | Duration of the animation, in ms.               |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-date-picker-input`. The field box is an `.slp-input`; its button has `data-empty` while nothing is chosen.
- Slots: `date-picker-input-value` (the text, with `data-placeholder` while it's the placeholder), `date-picker-input-clear`.
- The dropdown: `.slp-date-picker-input-dropdown` (`[data-slot="date-picker-input-dropdown"]`), with `data-placement`, `data-status` and `data-transition`, holding a `.slp-date-picker`.
