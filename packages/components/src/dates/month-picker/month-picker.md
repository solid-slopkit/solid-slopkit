# MonthPicker

A calendar to choose months with: one month, several, or a range from one month to another. It shows the months of a year, and the years of a decade above them. It is a [Calendar](../calendar/calendar.md) that starts at the year level, so the Calendar's props for months and years work too.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard and screen readers** below.

```tsx
import { MonthPicker } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [month, setMonth] = createSignal<Date | null>(null);
<MonthPicker value={month()} onChange={setMonth} />;

const [months, setMonths] = createSignal<Date[]>([]);
<MonthPicker type="multiple" value={months()} onChange={setMonths} />;

const [range, setRange] = createSignal<[Date | null, Date | null]>([null, null]);
<MonthPicker type="range" numberOfColumns={2} value={range()} onChange={setRange} />;
```

- **Months:** a month is the `Date` of its first day at local midnight (see [Dates](../dates.md)); `onChange` gets months built that way. A value may be any day of its month. Pass dates built from numbers (`createDay(2026, 9, 1)`), not ISO strings.
- **Type:** `type` (read once) sets the value's shape: `default`, a `Date` or `null`; `multiple`, a `Date[]`; `range`, `[start, end]` where either may be `null`. The value is uncontrolled with `defaultValue` (read once) or controlled with `value`; `onChange(value)` gets the new value.
- **One month:** a click (or Enter, Space) chooses the month. A click on the chosen month keeps it; with `allowDeselect` it clears it (`null`).
- **Several months:** a click adds the month, or takes it away when it's already chosen. Months stay in the order they were added.
- **A range:** the first click sets the start (`[start, null]`), the second the end, in whichever order (`[earlier, later]`); a third starts again. A second click on the start clears it, or with `allowSingleDateInRange` makes a one-month range. Between the clicks, the months from the start to the one under the pointer or the focus are previewed as a range.
- **Levels:** `year` (the months, three to a row) and `decade` (ten years). The header's name of the year goes up to the decade; a year goes back down to its months (`onYearClick` is called first). `level`/`defaultLevel`/`onLevelChange` control it; `maxLevel="year"` keeps it on the months.
- **What it shows:** the year of the first chosen month, unless `date` or `defaultDate` says otherwise. `numberOfColumns` shows that many years side by side.
- **Marks:** chosen months are filled with `color` and have `aria-selected="true"`; a range's ends are filled and the months between tinted (`data-in-range`, `data-first-in-range`, `data-last-in-range`). The marks are added to what `getMonthProps` returns, so it can still disable or mark months; `onMonthClick` is still called before the value changes. Years at the decade level aren't marked.
- **Limits:** a month wholly before `minDate` or after `maxDate` is disabled.
- **Keyboard and screen readers:** the Calendar's. Arrows move a month or a row, Home and End to the ends of the row, Page Up and Page Down a year, crossing into the neighboring year. Each year is a `grid` named after it ("2026"); months are named with their year ("October 2026"). Previous and next are named `Previous year` and `Next year` (decade); `previousLabel(level)` and `nextLabel(level)` rename them.
- The Calendar's props for days (`getDayProps`, `onDayClick`, `renderDay`, `excludeDate`, the week and weekday props) don't apply; `minLevel` is always `year`.

## Props

The Calendar's props for months and years (`date`, `defaultDate`, `onDateChange`, `numberOfColumns`, `minDate`, `maxDate`, `getMonthProps`, `getYearProps`, `onMonthClick`, `onYearClick`, `locale`, `color`, `size`, `previousLabel`, `nextLabel`), plus:

| Prop                     | Type                                      | Default     | Description                                        |
| ------------------------ | ----------------------------------------- | ----------- | -------------------------------------------------- |
| `type`                   | `'default' \| 'multiple' \| 'range'`      | `'default'` | What it chooses. Read once.                        |
| `value`                  | `MonthPickerValue<Type>`                  | —           | The chosen months, when controlled.                |
| `defaultValue`           | `MonthPickerValue<Type>`                  | empty       | The months chosen first, when uncontrolled.        |
| `onChange`               | `(value: MonthPickerValue<Type>) => void` | —           | Called with the new value.                         |
| `allowDeselect`          | `boolean`                                 | `false`     | A click on the chosen month clears it (`default`). |
| `allowSingleDateInRange` | `boolean`                                 | `false`     | A range may start and end in one month (`range`).  |
| `level`                  | `'year' \| 'decade'`                      | —           | What it shows, when controlled.                    |
| `defaultLevel`           | `'year' \| 'decade'`                      | `'year'`    | What it shows first, when uncontrolled.            |
| `onLevelChange`          | `(level: 'year' \| 'decade') => void`     | —           | Called when the level changes.                     |
| `maxLevel`               | `'year' \| 'decade'`                      | `'decade'`  | The highest level.                                 |

`MonthPickerValue<'default'>` is `Date | null`, `MonthPickerValue<'multiple'>` is `Date[]`, and `MonthPickerValue<'range'>` is `[Date | null, Date | null]`.

## Styling

The root is the Calendar's (`.slp-calendar`, see its slots and attributes), with the `.slp-month-picker` class and `data-type`. Months are the `calendar-month` slot, with `data-date` (`2026-10`). Chosen months have `data-selected`; a range's months `data-in-range`, `data-first-in-range` and `data-last-in-range`. The Calendar's custom properties (`--slp-calendar-color`, `--slp-calendar-content`, `--slp-calendar-radius`) apply.
