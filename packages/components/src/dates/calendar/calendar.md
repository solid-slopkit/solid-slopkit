# Calendar

A calendar: the days of a month, the months of a year, or the years of a decade, in grids moved through with the arrow keys, with a header to go to the previous or next period and up a level. It has no value of its own; mark selected days with `getDayProps` and choose them with `onDayClick`.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** and **Screen readers** below.

```tsx
import { Calendar } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [picked, setPicked] = createSignal<Date>();

<Calendar
  getDayProps={(date) => ({ selected: !!picked() && isSameDay(date, picked()!) })}
  onDayClick={(date) => setPicked(date)}
/>;
```

- **Days:** a `Date` at local midnight (see [Dates](../dates.md)). Callbacks get days built that way; pass dates built from numbers (`createDay(2026, 9, 15)`), not ISO strings.
- **What it shows:** the month of `date` (controlled) or `defaultDate` (uncontrolled, read once, default today). Previous and next move by a month (a year, a decade); `onDateChange(date)` gets the first day of the new first month. `numberOfColumns` shows that many months side by side, wrapping when they don't fit; previous is on the first, next on the last.
- **Levels:** `level`/`defaultLevel`/`onLevelChange`: `month` (days), `year` (months, three to a row) or `decade` (ten years, three to a row). The header's name of the period goes up a level; choosing a month or year goes down. `minLevel` (default `month`) and `maxLevel` (default `decade`) bound it: a month picker is `minLevel="year"`. `onMonthClick` and `onYearClick` are called before it goes down; at `minLevel` they're all that happens.
- **Cells:** `getDayProps(date)`, `getMonthProps(date)` and `getYearProps(date)` return `{ selected, inRange, firstInRange, lastInRange, disabled }`. Selected cells are filled with `color` and their cell has `aria-selected="true"`; a range is tinted between its filled ends.
- **Limits:** days before `minDate`, after `maxDate`, or for which `excludeDate(date)` is true are disabled; a month or year is disabled when it lies wholly outside. Previous and next stop there: they get `aria-disabled` and keep the focus.
- **Weeks:** start on the locale's first day (`firstDayOfWeek` overrides, 0 is Sunday), with its weekend marked (`weekendDays` overrides). Six weeks by default, so the height doesn't change; `fixedWeeks={false}` shows only the month's. Days of the neighboring months are dimmed; `hideOutsideDates` leaves them out, and with several columns they're always left out. `hideWeekdays` drops the names row; `weekdayFormat` is `short` (default) or `narrow`.
- **Locale:** names and numbers come from `Intl` in the provider's locale, or the `locale` prop.
- **Today:** marked with `aria-current="date"` once hydrated, as the browser's day may differ from the server's.
- **Content:** `renderDay(date)` replaces a day's number.
- **Keyboard:** one cell takes Tab: the one last moved to, else a selected one, today, or the first enabled cell. In days, arrows move a day or a week, Home and End to the ends of the week, Page Up and Page Down a month, with Shift a year. In months and years, arrows move one or a row, Home and End to the ends of the row, pages a year or a decade. Moves skip disabled cells and cross into the neighboring period, which then shows. Enter or Space chooses.
- **Screen readers:** each period is a `grid` named after it ("October 2026"), with weekday column headers (`abbr` holds the full name). Days are named in full ("Thursday, October 15, 2026"), months with their year. The header's name is a polite live region, so a new month is announced. Previous and next are named `Previous month` and `Next month` (year, decade); `previousLabel(level)` and `nextLabel(level)` rename them.
- **Look:** `size` `xs` to `xl` (default `md`) sets the cells; `color` (default `primary`) fills selected cells.
- Other props go to the root `div`.

## Props

| Prop               | Type                                      | Default            | Description                                  |
| ------------------ | ----------------------------------------- | ------------------ | -------------------------------------------- |
| `date`             | `Date`                                    | —                  | A date in the month shown, when controlled.  |
| `defaultDate`      | `Date`                                    | today              | The month shown first, when uncontrolled.    |
| `onDateChange`     | `(date: Date) => void`                    | —                  | Called with the first day of the new period. |
| `level`            | `'month' \| 'year' \| 'decade'`           | —                  | What it shows, when controlled.              |
| `defaultLevel`     | `'month' \| 'year' \| 'decade'`           | `minLevel`         | What it shows first, when uncontrolled.      |
| `onLevelChange`    | `(level) => void`                         | —                  | Called when the level changes.               |
| `minLevel`         | `'month' \| 'year' \| 'decade'`           | `'month'`          | The lowest level.                            |
| `maxLevel`         | `'month' \| 'year' \| 'decade'`           | `'decade'`         | The highest level.                           |
| `numberOfColumns`  | `number`                                  | `1`                | Periods side by side.                        |
| `minDate`          | `Date`                                    | —                  | The earliest day that can be chosen.         |
| `maxDate`          | `Date`                                    | —                  | The latest day that can be chosen.           |
| `excludeDate`      | `(date: Date) => boolean`                 | —                  | Days that can't be chosen.                   |
| `getDayProps`      | `(date: Date) => CalendarCellState`       | —                  | Marks a day.                                 |
| `getMonthProps`    | `(date: Date) => CalendarCellState`       | —                  | Marks a month.                               |
| `getYearProps`     | `(date: Date) => CalendarCellState`       | —                  | Marks a year.                                |
| `onDayClick`       | `(date: Date, event: MouseEvent) => void` | —                  | A day was chosen.                            |
| `onMonthClick`     | `(date: Date, event: MouseEvent) => void` | —                  | A month was chosen.                          |
| `onYearClick`      | `(date: Date, event: MouseEvent) => void` | —                  | A year was chosen.                           |
| `renderDay`        | `(date: Date) => JSX.Element`             | the day's number   | A day's content.                             |
| `firstDayOfWeek`   | `0 … 6`                                   | the locale's       | The day weeks start on; 0 is Sunday.         |
| `weekendDays`      | `(0 … 6)[]`                               | the locale's       | The days marked as weekend.                  |
| `fixedWeeks`       | `boolean`                                 | `true`             | Always six weeks.                            |
| `hideOutsideDates` | `boolean`                                 | `false`            | Leaves the neighboring months' days out.     |
| `hideWeekdays`     | `boolean`                                 | `false`            | Leaves the weekday names out.                |
| `weekdayFormat`    | `'short' \| 'narrow'`                     | `'short'`          | How weekday names are written.               |
| `locale`           | `string`                                  | the provider's     | A locale for this calendar.                  |
| `color`            | `SlopColor`                               | `'primary'`        | The color role of selected cells.            |
| `size`             | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`    | `'md'`             | The cells' size.                             |
| `previousLabel`    | `(level) => string`                       | `'Previous month'` | The previous button's name.                  |
| `nextLabel`        | `(level) => string`                       | `'Next month'`     | The next button's name.                      |

`CalendarCellState` is `{ selected?, inRange?, firstInRange?, lastInRange?, disabled? }`, all booleans.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-calendar`, with `data-level`, `data-size` and `data-color`.
- Slots: `calendar-column` (one period), `calendar-header`, `calendar-previous`, `calendar-level` (the period's name), `calendar-next`, `calendar-grid` (the `table`), `calendar-weekday`, `calendar-day`, `calendar-month`, `calendar-year`. A previous, next or level button has `data-disabled` when it goes nowhere.
- A cell button has `data-date` (`2026-10-15`, `2026-10` or `2026`), and as they apply `data-outside`, `data-weekend`, `data-today`, `data-selected`, `data-in-range`, `data-first-in-range`, `data-last-in-range` and `data-disabled`.
- Custom properties, on the calendar or an ancestor: `--slp-calendar-color`, `--slp-calendar-content` (text on selected cells), `--slp-calendar-radius` (`0.5rem`).
