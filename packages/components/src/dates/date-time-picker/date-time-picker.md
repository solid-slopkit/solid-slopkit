# DateTimePicker

A labelled field for a date and time: a button that shows them, written by the locale, and opens a [DatePicker](../date-picker/date-picker.md) and a [TimePicker](../time-picker/time-picker.md) in a dropdown under it.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Dropdown** below.

```tsx
import { DateTimePicker } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [when, setWhen] = createSignal<Date | null>(null);
<DateTimePicker label="Meeting" placeholder="Pick a date and time" value={when()} onChange={setWhen} clearable />;

<DateTimePicker label="Departure" timePickerProps={{ format: '24h', minutesStep: 15, withDropdown: true }} name="departure" />;
```

- **Value:** a `Date` with its time of day (local), or `null`. Uncontrolled with `defaultValue` (read once, default `null`) or controlled with `value`; `onChange(value)` gets the new date and time.
- **Text:** written with `Intl.DateTimeFormat` in the provider's locale (or `locale`), with `valueFormat` options; the default is `{ dateStyle: 'medium', timeStyle: 'short' }` ("Oct 15, 2026, 9:30 AM"), with `timeStyle: 'medium'` under `withSeconds`.
- **Dropdown:** a click on the field (or Enter, Space) opens a `dialog` named by the label, in the top layer, under the field box: a calendar, the time (a TimePicker labelled `timeLabel`, default `Time`) and a button (`submitLabel`, default `Done`). The calendar takes the focus on the chosen day; Tab goes on to the time and the button.
- **Choosing:** changes apply at once. A chosen day keeps the time (midnight when there's none yet); a time, once whole, keeps the day. A time chosen before any day waits for one. `Done` closes the dropdown and returns the focus to the field; so do Escape and a press outside, and focus leaving both closes it.
- **Calendar:** every DatePicker prop for one day goes to it: levels, `minDate` and `maxDate` (days), `excludeDate`, `getDayProps`, `numberOfColumns`, the week props, `color`, labels.
- **Time:** `withSeconds` adds the seconds to the time and the value. `timePickerProps` go to the TimePicker: `format`, the steps, `minTime`, `maxTime`, `withDropdown`, `segmentLabels`…
- **Clear:** `clearable` adds a button (named `clearLabel`, default `Clear`), in place of `rightSection`, while there's a value; it clears it and focuses the field.
- **Forms:** `name` adds a hidden input with the local date and time, `2026-10-15T09:30` (`:ss` with seconds), as a `datetime-local` input writes it; empty when there's none.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput; `size` sizes the field, the calendar and the time. A button can't be `required`, so `required` shows the asterisk and sets `aria-required`.
- **States:** `disabled` disables the button; `readOnly` shows the value without opening, and hides the clear button. `variant` and the sections go to the box.
- **Animation:** `transition` (default `fade`) and `transitionDuration` (ms, default 150). Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts); other props go to the button.

## Props

The DatePicker's props for one day (the Calendar's, except `size` and `minLevel`), and:

| Prop                 | Type                             | Default                                       | Description                                                                              |
| -------------------- | -------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `value`              | `Date \| null`                   | —                                             | The date and time, when controlled.                                                      |
| `defaultValue`       | `Date \| null`                   | `null`                                        | The date and time at first.                                                              |
| `onChange`           | `(value: Date \| null) => void`  | —                                             | Called with the new date and time.                                                       |
| `placeholder`        | `string`                         | —                                             | Shown while nothing is chosen.                                                           |
| `valueFormat`        | `Intl.DateTimeFormatOptions`     | `{ dateStyle: 'medium', timeStyle: 'short' }` | How the value is written.                                                                |
| `withSeconds`        | `boolean`                        | `false`                                       | Adds the seconds.                                                                        |
| `timePickerProps`    | `TimePickerProps`                | —                                             | Props for the time picker, except `value`, `defaultValue`, `onChange` and `withSeconds`. |
| `timeLabel`          | `string`                         | `'Time'`                                      | The time picker's label.                                                                 |
| `submitLabel`        | `string`                         | `'Done'`                                      | The text of the button that closes it.                                                   |
| `clearable`          | `boolean`                        | `false`                                       | Adds a button that clears the value.                                                     |
| `clearLabel`         | `string`                         | `'Clear'`                                     | The clear button's name.                                                                 |
| `name`               | `string`                         | —                                             | Submits the local date and time.                                                         |
| `readOnly`           | `boolean`                        | `false`                                       | Shows the value without letting it change.                                               |
| `disabled`           | `boolean`                        | `false`                                       | Disables the field.                                                                      |
| `variant`            | `'outline' \| 'soft' \| 'ghost'` | `'outline'`                                   | The box's look.                                                                          |
| `leftSection`        | `JSX.Element`                    | —                                             | Content before the value.                                                                |
| `rightSection`       | `JSX.Element`                    | —                                             | Content after the value.                                                                 |
| `position`           | `FloatingPlacement`              | `'bottom-start'`                              | Where the dropdown goes against the field.                                               |
| `offset`             | `number`                         | `4`                                           | Gap between the field and the dropdown.                                                  |
| `transition`         | `TransitionName`                 | `'fade'`                                      | The dropdown's animation.                                                                |
| `transitionDuration` | `number`                         | `150`                                         | Duration of the animation, in ms.                                                        |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-date-time-picker`. The field box is an `.slp-input`; its button has `data-empty` while nothing is chosen.
- Slots: `date-time-picker-value` (the text, with `data-placeholder`), `date-time-picker-clear`, and in the dropdown `date-time-picker-time` (the TimePicker, on its `.slp-time-picker` root) and `date-time-picker-submit`.
- The dropdown: `.slp-date-time-picker-dropdown` (`[data-slot="date-time-picker-dropdown"]`), with `data-placement`, `data-status` and `data-transition`, holding a `.slp-date-picker`.
