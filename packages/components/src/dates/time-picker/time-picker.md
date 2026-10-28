# TimePicker

A labelled field for a time of day, written by the locale in 12 or 24 hours: a segment per part, typed or stepped with the arrow keys, and optionally a dropdown of options to click. For the browser's own time field, use [TimeInput](../time-input/time-input.md).

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Typing** and **Keys** below.

```tsx
import { TimePicker } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [time, setTime] = createSignal('09:30');
<TimePicker label="Start" value={time()} onChange={setTime} withDropdown minutesStep={5} />;

<TimePicker label="Lap" withSeconds format="24h" name="lap" clearable />;
```

- **Value:** a string in 24 hours, `HH:mm`, or `HH:mm:ss` with `withSeconds`; `''` for none. Uncontrolled with `defaultValue` (read once, default `''`) or controlled with `value`. `onChange(value)` runs when the time changes: with a whole time, or with `''` when a part goes missing; the parts typed so far stay in the field until the time is whole again.
- **Segments:** hours, minutes, seconds (`withSeconds`) and, in 12 hours, the day period. Each is a `spinbutton` named `Hours`, `Minutes`, `Seconds` or `AM/PM` (`segmentLabels` renames them) with its value, in a `group` named by the label. The label goes to the hours. A press on the field off a segment goes to the first empty one.
- **12 or 24 hours:** the locale's (`en-US` 12, `de-DE` 24); `format` overrides it. The day period names are the locale's (`AM`, `PM`); `dayPeriodLabels` replaces them. A typed hour keeps the day period, AM at first.
- **Typing:** digits fill a part, two at most; a part moves on to the next once it can take no more digits (`7` in the hours is `07`). `a` and `p` (or the first letter of the locale's names) set the day period. Backspace clears a part, and in an empty one goes back a part. Typing works through `beforeinput`, so phones' keyboards type too (`inputmode="numeric"`).
- **Keys:** Up and Down step a part around the clock, by `hoursStep`, `minutesStep` and `secondsStep` (default 1), and switch the day period. Home and End go to the ends of a part. Left and Right move between parts; Tab goes through them.
- **Limits:** `minTime` and `maxTime` (`HH:mm` or `HH:mm:ss`). Leaving the field brings a time outside them to the nearest.
- **Dropdown:** `withDropdown` adds one, opened by a click on the field, with a column of options per part (the steps apply), each a `listbox`; the chosen options are scrolled into view. A click on an option sets its part and keeps the focus in the field. Escape, a press outside, and focus leaving both the field and the dropdown close it.
- **Clear:** `clearable` adds a button (named `clearLabel`, default `Clear`), in place of `rightSection`, while there's a time or a part of one; it empties it and goes to the hours.
- **Forms:** `name` adds a hidden input with the value.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. `variant`, the sections, `disabled` and `readOnly` (the time shows, and can't change).
- **Locale:** the provider's, or `locale`. Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts); other props go to the group of segments.

## Props

| Prop                 | Type                                         | Default          | Description                                       |
| -------------------- | -------------------------------------------- | ---------------- | ------------------------------------------------- |
| `value`              | `string`                                     | —                | The time, when controlled: `HH:mm` or `HH:mm:ss`. |
| `defaultValue`       | `string`                                     | `''`             | The time at first, when uncontrolled.             |
| `onChange`           | `(value: string) => void`                    | —                | Called with the time, or `''`.                    |
| `format`             | `'12h' \| '24h'`                             | the locale's     | 12 hours with a day period, or 24.                |
| `withSeconds`        | `boolean`                                    | `false`          | Adds the seconds.                                 |
| `minTime`            | `string`                                     | —                | The earliest time.                                |
| `maxTime`            | `string`                                     | —                | The latest time.                                  |
| `hoursStep`          | `number`                                     | `1`              | How far the keys and the dropdown step the hours. |
| `minutesStep`        | `number`                                     | `1`              | How far they step the minutes.                    |
| `secondsStep`        | `number`                                     | `1`              | How far they step the seconds.                    |
| `withDropdown`       | `boolean`                                    | `false`          | Adds a dropdown of options.                       |
| `clearable`          | `boolean`                                    | `false`          | Adds a button that clears the time.               |
| `clearLabel`         | `string`                                     | `'Clear'`        | The clear button's name.                          |
| `name`               | `string`                                     | —                | Submits the time through a hidden input.          |
| `locale`             | `string`                                     | the provider's   | A locale for this field.                          |
| `dayPeriodLabels`    | `[string, string]`                           | the locale's     | The names of the morning and the afternoon.       |
| `segmentLabels`      | `{ hours?, minutes?, seconds?, dayPeriod? }` | English          | The segments' names.                              |
| `readOnly`           | `boolean`                                    | `false`          | Shows the time without letting it change.         |
| `disabled`           | `boolean`                                    | `false`          | Disables the field.                               |
| `variant`            | `'outline' \| 'soft' \| 'ghost'`             | `'outline'`      | The box's look.                                   |
| `leftSection`        | `JSX.Element`                                | —                | Content before the time.                          |
| `rightSection`       | `JSX.Element`                                | —                | Content after the time.                           |
| `position`           | `FloatingPlacement`                          | `'bottom-start'` | Where the dropdown goes against the field.        |
| `offset`             | `number`                                     | `4`              | Gap between the field and the dropdown, in px.    |
| `transition`         | `TransitionName`                             | `'fade'`         | The dropdown's animation.                         |
| `transitionDuration` | `number`                                     | `150`            | Duration of the animation, in ms.                 |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-time-picker`. The field box is an `.slp-input`; its control is the group, with `data-empty` while there's no time.
- Slots: `time-picker-hours`, `time-picker-minutes`, `time-picker-seconds`, `time-picker-day-period` (the segments, with `data-empty` while empty), `time-picker-clear`.
- The dropdown: `.slp-time-picker-dropdown` (`[data-slot="time-picker-dropdown"]`), with `data-placement`, `data-status` and `data-transition`; its columns are `time-picker-column` and options `time-picker-option` (`aria-selected`).
