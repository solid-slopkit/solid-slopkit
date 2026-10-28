# MiniCalendar

A strip of days to choose one from, between previous and next buttons that move it by its length. For a compact day picker, such as the day of a schedule or a booking.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** and **Screen readers** below.

```tsx
import { MiniCalendar } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [day, setDay] = createSignal(createDay(2026, 9, 15));

<MiniCalendar value={day()} onChange={setDay} />

<MiniCalendar numberOfDays={5} minDate={createDay(2026, 9, 1)} excludeDate={(date) => date.getDay() === 0} />
```

- **Days:** a `Date` at local midnight (see [Dates](../dates.md)); `onChange` gets one built that way.
- **Value:** the chosen day, uncontrolled with `defaultValue` (read once) or controlled with `value` (`null` for none). `onChange(date)` is called when another day is chosen; choosing the chosen day again does nothing.
- **What it shows:** `numberOfDays` days (default 7) from `date` (controlled) or `defaultDate` (uncontrolled, read once; default the value, else today). Previous and next move it by `numberOfDays`; `onDateChange(date)` gets the new first day. Pages rendered on the server should pass a date, since today may differ between the server and the browser.
- **Limits:** days before `minDate`, after `maxDate`, or for which `excludeDate(date)` is true are disabled. Previous and next stop there: they get `aria-disabled` and keep the focus.
- **Today:** marked with `aria-current="date"` once hydrated.
- **Keyboard:** one day takes Tab: the one last moved to, else the chosen one, today, or the first enabled day. Left and Right move a day, skipping disabled ones and moving the strip past its ends; Page Up and Page Down move by `numberOfDays`; Home and End go to the strip's first and last enabled day. Enter, Space or a click chooses; the arrows only move the focus.
- **Screen readers:** a horizontal `listbox` named after its days ("October 12 – 18, 2026"); each day is an `option` named in full ("Monday, October 12, 2026"), with `aria-selected`. A polite live region says the new days when previous or next moves the strip. The controls are named `Previous days` and `Next days`; `previousLabel` and `nextLabel` rename them.
- **Locale:** weekday names, numbers and the range come from `Intl` in the provider's locale, or the `locale` prop.
- **Look:** each day is its short weekday above its number. `size` `xs` to `xl` (default `md`); `color` (default `primary`) fills the chosen day.
- Other props go to the root `div`.

## Props

| Prop            | Type                                   | Default               | Description                              |
| --------------- | -------------------------------------- | --------------------- | ---------------------------------------- |
| `value`         | `Date \| null`                         | —                     | The chosen day, when controlled.         |
| `defaultValue`  | `Date \| null`                         | —                     | The day chosen first, when uncontrolled. |
| `onChange`      | `(date: Date) => void`                 | —                     | Called when another day is chosen.       |
| `date`          | `Date`                                 | —                     | The first day shown, when controlled.    |
| `defaultDate`   | `Date`                                 | the value, else today | The first day shown first.               |
| `onDateChange`  | `(date: Date) => void`                 | —                     | Called with the new first day.           |
| `numberOfDays`  | `number`                               | `7`                   | How many days show.                      |
| `minDate`       | `Date`                                 | —                     | The earliest day that can be chosen.     |
| `maxDate`       | `Date`                                 | —                     | The latest day that can be chosen.       |
| `excludeDate`   | `(date: Date) => boolean`              | —                     | Days that can't be chosen.               |
| `locale`        | `string`                               | the provider's        | A locale for this mini calendar.         |
| `color`         | `SlopColor`                            | `'primary'`           | The chosen day's color role.             |
| `size`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`                | The days' size.                          |
| `previousLabel` | `string`                               | `'Previous days'`     | The previous button's name.              |
| `nextLabel`     | `string`                               | `'Next days'`         | The next button's name.                  |

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-mini-calendar`, with `data-size` and `data-color`.
- Slots: `mini-calendar-previous`, `mini-calendar-days` (the listbox), `mini-calendar-day`, `mini-calendar-weekday`, `mini-calendar-number`, `mini-calendar-next`, `mini-calendar-range` (the live region, visually hidden). A day has `data-date` (`2026-10-15`), and as they apply `data-selected`, `data-today` and `data-disabled`; previous and next have `data-disabled` at a limit.
- Custom properties, on the mini calendar or an ancestor: `--slp-mini-calendar-color`, `--slp-mini-calendar-content` (text on the chosen day), `--slp-mini-calendar-radius` (`0.5rem`).
