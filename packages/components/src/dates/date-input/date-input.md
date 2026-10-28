# DateInput

A labelled text field for a day: type it, or choose it in a [DatePicker](../date-picker/date-picker.md) that opens in a dropdown under the field.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Calendar** below.

```tsx
import { DateInput } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [day, setDay] = createSignal<Date | null>(null);
<DateInput label="Birthday" placeholder="MM/DD/YYYY" value={day()} onChange={setDay} clearable />;

<DateInput label="Start" valueFormat={{ dateStyle: 'medium' }} minDate={createDay(2026, 0, 1)} name="start" />;
```

- **Value:** one day, a `Date` at local midnight (see [Dates](../dates.md)), or `null`. Uncontrolled with `defaultValue` (read once, default `null`) or controlled with `value`; `onChange(value)` gets the new day.
- **Text:** the day is written with `Intl.DateTimeFormat` in the provider's locale (or `locale`) with `valueFormat` options. The default is numbers, `{ year: 'numeric', month: '2-digit', day: '2-digit' }` (`10/15/2026` in `en-US`, `15.10.2026` in `de-DE`), which reads back as typed.
- **Typing:** text is read with `parseDate` in the locale (see [Dates](../dates.md)): an ISO day, or three numbers in the locale's order. As soon as it names a day the calendar would allow (inside `minDate` and `maxDate`, not excluded or disabled by `getDayProps`), that's the value, and the open calendar moves to its month. While typing, a year counts once it has four digits; a short year (`10/15/26`) is read when the edit ends. The edit ends when the field is left or Enter is pressed: the text is then rewritten from the value, so text that names no allowed day goes. Emptying the field clears the day. `dateParser(text)` replaces how text is read (returning `null` for no day), both while typing and when the edit ends.
- **Calendar:** a click on the field, or ArrowDown, opens a DatePicker under the field box, on the month of the day. It's a `dialog` named by the label, in the top layer, right after the field in the tab order: the focus stays in the field, and Tab moves into the calendar. Choosing a day sets it, closes the calendar and returns the focus to the field; with `allowDeselect`, choosing the chosen day clears it. Escape and a press outside close it, and so does focus leaving both the field and the calendar. Every DatePicker prop for one day goes to the calendar: levels, `minDate`, `maxDate`, `excludeDate`, `getDayProps`, `numberOfColumns`, the week props, `color`, labels.
- **Field:** a text `input` with `role="combobox"`, `aria-haspopup="dialog"` and `aria-expanded`, `autocomplete="off"` and no spellcheck. Other props, such as `placeholder` or `onBlur`, go to it.
- **Clear:** `clearable` adds a button (named `clearLabel`, default `Clear`) while there's a day; it clears it and focuses the field.
- **Forms:** `name` adds a hidden input with the ISO day (`2026-10-15`), empty when there's none. The text field itself isn't submitted.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. `size` sizes the field and the calendar.
- **States:** `disabled`, and `readOnly`, which shows the day without typing or opening, and hides the clear button. `variant` and the sections go to the box.
- **Animation:** `transition` (default `fade`) and `transitionDuration` (ms, default 150). Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts).

## Props

The DatePicker's props for one day (the Calendar's, except `size` and `minLevel`, plus `allowDeselect`), and:

| Prop                 | Type                             | Default                   | Description                                    |
| -------------------- | -------------------------------- | ------------------------- | ---------------------------------------------- |
| `value`              | `Date \| null`                   | —                         | The day, when controlled.                      |
| `defaultValue`       | `Date \| null`                   | `null`                    | The day at first, when uncontrolled.           |
| `onChange`           | `(value: Date \| null) => void`  | —                         | Called with the new day.                       |
| `valueFormat`        | `Intl.DateTimeFormatOptions`     | numbers                   | How the day is written.                        |
| `dateParser`         | `(text: string) => Date \| null` | `parseDate` in the locale | Reads a day from the text.                     |
| `allowDeselect`      | `boolean`                        | `false`                   | Choosing the chosen day clears it.             |
| `clearable`          | `boolean`                        | `false`                   | Adds a button that clears the day.             |
| `clearLabel`         | `string`                         | `'Clear'`                 | The clear button's name.                       |
| `name`               | `string`                         | —                         | Submits the ISO day through a hidden input.    |
| `readOnly`           | `boolean`                        | `false`                   | Shows the day without letting it change.       |
| `disabled`           | `boolean`                        | `false`                   | Disables the field.                            |
| `variant`            | `'outline' \| 'soft' \| 'ghost'` | `'outline'`               | The box's look.                                |
| `leftSection`        | `JSX.Element`                    | —                         | Content before the text.                       |
| `rightSection`       | `JSX.Element`                    | —                         | Content after the text, when there's no clear. |
| `position`           | `FloatingPlacement`              | `'bottom-start'`          | Where the dropdown goes against the field.     |
| `offset`             | `number`                         | `4`                       | Gap between the field and the dropdown, in px. |
| `transition`         | `TransitionName`                 | `'fade'`                  | The dropdown's animation.                      |
| `transitionDuration` | `number`                         | `150`                     | Duration of the animation, in ms.              |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-date-input`. The field box is an `.slp-input`.
- Slots: `date-input-clear`.
- The dropdown: `.slp-date-input-dropdown` (`[data-slot="date-input-dropdown"]`), with `data-placement`, `data-status` and `data-transition`, holding a `.slp-date-picker`.
