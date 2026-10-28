# YearPicker

A calendar to choose years with: one year, several, or a range from one year to another. It shows the years of a decade. It is a [Calendar](../calendar/calendar.md) fixed at the decade level, so the Calendar's props for years work too.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard and screen readers** below.

```tsx
import { YearPicker } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [year, setYear] = createSignal<Date | null>(null);
<YearPicker value={year()} onChange={setYear} />;

const [years, setYears] = createSignal<Date[]>([]);
<YearPicker type="multiple" value={years()} onChange={setYears} />;

const [range, setRange] = createSignal<[Date | null, Date | null]>([null, null]);
<YearPicker type="range" numberOfColumns={2} value={range()} onChange={setRange} />;
```

- **Years:** a year is the `Date` of its January 1 at local midnight (see [Dates](../dates.md)); `onChange` gets years built that way. A value may be any day of its year. Pass dates built from numbers (`createDay(2026, 0, 1)`), not ISO strings.
- **Type:** `type` (read once) sets the value's shape: `default`, a `Date` or `null`; `multiple`, a `Date[]`; `range`, `[start, end]` where either may be `null`. The value is uncontrolled with `defaultValue` (read once) or controlled with `value`; `onChange(value)` gets the new value.
- **One year:** a click (or Enter, Space) chooses the year. A click on the chosen year keeps it; with `allowDeselect` it clears it (`null`).
- **Several years:** a click adds the year, or takes it away when it's already chosen. Years stay in the order they were added.
- **A range:** the first click sets the start (`[start, null]`), the second the end, in whichever order (`[earlier, later]`); a third starts again. A second click on the start clears it, or with `allowSingleDateInRange` makes a one-year range. Between the clicks, the years from the start to the one under the pointer or the focus are previewed as a range.
- **What it shows:** the decade of the first chosen year, unless `date` or `defaultDate` says otherwise. Previous and next move a decade; `numberOfColumns` shows that many decades side by side. The header names the decade and has no level above it, so it has `aria-disabled`.
- **Marks:** chosen years are filled with `color` and have `aria-selected="true"`; a range's ends are filled and the years between tinted (`data-in-range`, `data-first-in-range`, `data-last-in-range`). The marks are added to what `getYearProps` returns, so it can still disable or mark years; `onYearClick` is still called before the value changes.
- **Limits:** a year wholly before `minDate` or after `maxDate` is disabled.
- **Keyboard and screen readers:** the Calendar's. Arrows move a year or a row of three, Home and End to the ends of the row, Page Up and Page Down a decade, crossing into the neighboring decade. Each decade is a `grid` named after it ("2020 – 2029"); years are named by their number. Previous and next are named `Previous decade` and `Next decade`; `previousLabel(level)` and `nextLabel(level)` rename them.
- The Calendar's levels and its props for days and months (`getDayProps`, `onDayClick`, `getMonthProps`, `onMonthClick`, `renderDay`, `excludeDate`, the week and weekday props) don't apply.

## Props

The Calendar's props for years (`date`, `defaultDate`, `onDateChange`, `numberOfColumns`, `minDate`, `maxDate`, `getYearProps`, `onYearClick`, `locale`, `color`, `size`, `previousLabel`, `nextLabel`), plus:

| Prop                     | Type                                     | Default     | Description                                       |
| ------------------------ | ---------------------------------------- | ----------- | ------------------------------------------------- |
| `type`                   | `'default' \| 'multiple' \| 'range'`     | `'default'` | What it chooses. Read once.                       |
| `value`                  | `YearPickerValue<Type>`                  | —           | The chosen years, when controlled.                |
| `defaultValue`           | `YearPickerValue<Type>`                  | empty       | The years chosen first, when uncontrolled.        |
| `onChange`               | `(value: YearPickerValue<Type>) => void` | —           | Called with the new value.                        |
| `allowDeselect`          | `boolean`                                | `false`     | A click on the chosen year clears it (`default`). |
| `allowSingleDateInRange` | `boolean`                                | `false`     | A range may start and end in one year (`range`).  |

`YearPickerValue<'default'>` is `Date | null`, `YearPickerValue<'multiple'>` is `Date[]`, and `YearPickerValue<'range'>` is `[Date | null, Date | null]`.

## Styling

The root is the Calendar's (`.slp-calendar`, see its slots and attributes), with the `.slp-year-picker` class and `data-type`. Years are the `calendar-year` slot, with `data-date` (`2026`). Chosen years have `data-selected`; a range's years `data-in-range`, `data-first-in-range` and `data-last-in-range`. The Calendar's custom properties (`--slp-calendar-color`, `--slp-calendar-content`, `--slp-calendar-radius`) apply.
