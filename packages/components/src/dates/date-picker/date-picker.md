# DatePicker

A calendar to choose days with: one day, several, or a range from one day to another. It is a [Calendar](../calendar/calendar.md) with a value, so every Calendar prop works too.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see the [Calendar](../calendar/calendar.md)'s **Keyboard**.

```tsx
import { DatePicker } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [day, setDay] = createSignal<Date | null>(null);
<DatePicker value={day()} onChange={setDay} />;

const [days, setDays] = createSignal<Date[]>([]);
<DatePicker type="multiple" value={days()} onChange={setDays} />;

const [range, setRange] = createSignal<[Date | null, Date | null]>([null, null]);
<DatePicker type="range" numberOfColumns={2} value={range()} onChange={setRange} />;
```

- **Days:** `Date`s at local midnight (see [Dates](../dates.md)). Pass days built from numbers (`createDay(2026, 9, 15)`), not ISO strings.
- **Type:** `type` (read once) sets the value's shape: `default`, a `Date` or `null`; `multiple`, a `Date[]`; `range`, `[start, end]` where either may be `null`. The value is uncontrolled with `defaultValue` (read once) or controlled with `value`; `onChange(value)` gets the new value.
- **One day:** a click (or Enter, Space) chooses the day. A click on the chosen day keeps it; with `allowDeselect` it clears it (`null`).
- **Several days:** a click adds the day, or takes it away when it's already chosen. Days stay in the order they were added.
- **A range:** the first click sets the start (`[start, null]`), the second the end, in whichever order (`[earlier, later]`); a third starts again. A second click on the start clears it, or with `allowSingleDateInRange` makes a one-day range. Between the clicks, the days from the start to the one under the pointer or the focus are previewed as a range.
- **What it shows:** the month of the first chosen day, unless `date` or `defaultDate` says otherwise.
- **Marks:** chosen days are filled with `color` and have `aria-selected="true"`; a range's ends are filled and the days between tinted (`data-in-range`, `data-first-in-range`, `data-last-in-range`). The marks are added to what `getDayProps` returns, so it can still disable or mark days; `onDayClick` is still called before the value changes.
- Everything else (levels, limits, columns, locale, keyboard, labels) is the Calendar's; `minLevel` is always `month`.

## Props

The Calendar's props, except `minLevel`, plus:

| Prop                     | Type                                     | Default     | Description                                      |
| ------------------------ | ---------------------------------------- | ----------- | ------------------------------------------------ |
| `type`                   | `'default' \| 'multiple' \| 'range'`     | `'default'` | What it chooses. Read once.                      |
| `value`                  | `DatePickerValue<Type>`                  | —           | The chosen days, when controlled.                |
| `defaultValue`           | `DatePickerValue<Type>`                  | empty       | The days chosen first, when uncontrolled.        |
| `onChange`               | `(value: DatePickerValue<Type>) => void` | —           | Called with the new value.                       |
| `allowDeselect`          | `boolean`                                | `false`     | A click on the chosen day clears it (`default`). |
| `allowSingleDateInRange` | `boolean`                                | `false`     | A range may start and end on one day (`range`).  |

`DatePickerValue<'default'>` is `Date | null`, `DatePickerValue<'multiple'>` is `Date[]`, and `DatePickerValue<'range'>` is `[Date | null, Date | null]`.

## Styling

The root is the Calendar's (`.slp-calendar`, see its slots and attributes), with the `.slp-date-picker` class and `data-type`. Chosen days have `data-selected`; a range's days `data-in-range`, `data-first-in-range` and `data-last-in-range`. The Calendar's custom properties (`--slp-calendar-color`, `--slp-calendar-content`, `--slp-calendar-radius`) apply.
