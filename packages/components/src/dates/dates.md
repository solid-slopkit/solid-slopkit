# Dates

Date utilities on native `Date` and `Intl`, with no date library. They live in their own entry with the date components, such as [Calendar](calendar/calendar.md):

```tsx
import { addMonths, getMonthGrid, getWeekInfo, useFormatDate } from '@solid-slopkit/components/dates';
```

## Days are local-midnight `Date`s

A day is a `Date` at local midnight in the runtime's time zone. Every function returns a new `Date` and never changes its arguments; the ones that return a day drop the time of day, and the comparisons ignore it.

- Build days with `createDay(year, month, day)` (month 0–11) or `new Date(year, month, day)`. `createDay` keeps years 0–99 as given, where the constructor maps them to 1900–1999.
- Don't build days from an ISO date string: `new Date('2026-10-15')` is UTC midnight, which is October 14 west of Greenwich.
- The server and the browser can be in different time zones. A day built from numbers is the same day on both, so it renders and hydrates the same; `new Date()` (today) is not.

## Arithmetic and comparison

| Function                       | Returns                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `createDay(year, month, day)`  | Local midnight of that day. Out-of-range days roll over: `(2026, 0, 32)` is February 1.                   |
| `startOfDay(date)`             | Local midnight of the date's day.                                                                         |
| `startOfMonth(date)`           | The first day of the month.                                                                               |
| `endOfMonth(date)`             | The last day of the month.                                                                                |
| `startOfYear(date)`            | January 1 of the year.                                                                                    |
| `startOfWeek(date, firstDay)`  | The first day of the date's week, for weeks starting on `firstDay`.                                       |
| `daysInMonth(date)`            | How many days the month has.                                                                              |
| `addDays(date, n)`             | `n` calendar days later (earlier when negative). A DST change doesn't shift it.                           |
| `addMonths(date, n)`           | The same day `n` months later; a day the month lacks becomes its last day (January 31 + 1 → February 28). |
| `addYears(date, n)`            | The same day `n` years later; February 29 becomes February 28 in a common year.                           |
| `isSameDay(a, b)`              | Whether both fall on the same day.                                                                        |
| `isSameMonth(a, b)`            | Whether both fall in the same month of the same year.                                                     |
| `isSameYear(a, b)`             | Whether both fall in the same year.                                                                       |
| `compareDays(a, b)`            | Negative when `a` is an earlier day, positive when later, 0 on the same day.                              |
| `isDayInRange(date, min, max)` | Whether the day lies between the bounds, both included. Either bound may be `undefined`.                  |
| `clampDay(date, min, max)`     | The day, or the bound's day when it lies outside.                                                         |

`DayOfWeek` is `0 | 1 | 2 | 3 | 4 | 5 | 6`, numbered like `Date.prototype.getDay()`: 0 is Sunday.

## Month grid

`getMonthGrid(month, { firstDayOfWeek, fixedWeeks })` (options type `MonthGridOptions`) returns the weeks of the month as rows of seven days. The first and last rows are filled with days of the neighboring months; tell them apart with `isSameMonth(day, month)`. A month spans four to six weeks; `fixedWeeks: true` always gives six, so a calendar keeps its height.

```tsx
const locale = useLocale(); // from '@solid-slopkit/components'
const weeks = () => getMonthGrid(month(), { firstDayOfWeek: getWeekInfo(locale()).firstDayOfWeek });
```

## The locale's week

`getWeekInfo(locale)` returns a `WeekInfo`, `{ firstDayOfWeek, weekendDays }`, for a BCP 47 locale: `en-US` weeks start on Sunday, `de-DE` on Monday, `ar-EG` on Saturday with a Friday–Saturday weekend. The `fw` extension overrides the first day: `en-US-u-fw-mon`. Without a region, the language's most likely one counts (`en` is `en-US`). An invalid tag throws a `RangeError`.

It reads `Intl.Locale` week info, with a built-in table from the same data for browsers that don't have it.

## Formatting

All formatting goes through `Intl.DateTimeFormat`, in the runtime's time zone. Formatters are cached per locale and options.

- `formatDate(date, locale, options?)`: the date as text, e.g. `formatDate(day, 'en-US', { month: 'long', year: 'numeric' })` → `October 2026`.
- `parseDate(text, locale)`: the day a text names, or `null`. It reads an ISO day (`2026-10-15`) or three numbers in the locale's order with any separators (`10/15/2026` in `en-US`, `15.10.2026` in `de-DE`), so it reads back what `{ year: 'numeric', month: '2-digit', day: '2-digit' }` writes. A year of one or two digits is in 2000–2099; days that don't exist are `null`. Month names aren't read.
- `useFormatDate()`: a `FormatDate`, `(date, options?) => string`, which is `formatDate` bound to the locale of the nearest `<SlopkitUi>`. Call the result where the text renders, so a change of the provider's `locale` formats again. Throws outside `<SlopkitUi>`.
- `getWeekdayNames(locale, firstDayOfWeek, format?)`: seven weekday names from the first day; `format` is `'narrow'`, `'short'` (default) or `'long'`.
- `getMonthNames(locale, format?)`: twelve month names from January, in the form a month takes on its own; `format` is `'narrow'`, `'short'` or `'long'` (default).

```tsx
function MonthTitle(props: { month: Date }) {
  const format = useFormatDate();
  return <h2>{format(props.month, { month: 'long', year: 'numeric' })}</h2>;
}
```

## Times

The time components ([TimeInput](time-input/time-input.md), [TimePicker](time-picker/time-picker.md), [TimeGrid](time-grid/time-grid.md)) take times of day as strings in 24 hours, `HH:mm` or `HH:mm:ss`, whatever the locale shows.

- `getTimeRange({ start, end, interval, withSeconds? })` (options type `TimeRangeOptions`): the times from `start` to `end`, `interval` minutes apart: `{ start: '09:00', end: '10:00', interval: 30 }` is `['09:00', '09:30', '10:00']`. `end` is included when the steps land on it; unreadable times or an interval that isn't positive give `[]`.
