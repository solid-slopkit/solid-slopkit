# TimeGrid

A grid of times to choose one from, such as the free slots of a booking, written by the locale.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard** and **Screen readers** below.

```tsx
import { TimeGrid, getTimeRange } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [slot, setSlot] = createSignal<string | null>(null);

<TimeGrid
  aria-label="Free slots"
  data={getTimeRange({ start: '09:00', end: '17:00', interval: 30 })}
  value={slot()}
  onChange={setSlot}
  disableTime={['12:00', '12:30']}
/>;
```

- **Times:** `data` lists them as `HH:mm` or `HH:mm:ss` in 24 hours; `getTimeRange({ start, end, interval })` makes a list `interval` minutes apart (`withSeconds` writes seconds). Each shows as the locale writes it (`9:30 AM`, `09:30`), in 12 or 24 hours by the locale or `format`; `withSeconds` shows the seconds.
- **Value:** the chosen time, as written in `data`, or `null`. Uncontrolled with `defaultValue` (read once, default `null`) or controlled with `value`; `onChange(value)` gets the new time. Times compare as times, so `10:00:00` matches `10:00`. A click on the chosen time keeps it; with `allowDeselect` it clears it.
- **Disabled times:** before `minTime`, after `maxTime`, in `disableTime` (a list, or a test `(time) => boolean`), or all with `disabled`. They can't be chosen and the keys skip them.
- **Keyboard:** the grid is a `group` with one tab stop: the time last moved to, else the chosen one, else the first enabled one. Left and Right move a time, Up and Down a row, Home and End to the first and last; moves skip disabled times and stop at the ends. Enter or Space chooses, as a click does: the arrows only move the focus.
- **Screen readers:** each time is a `button` named by its text, with `aria-pressed`. Name the grid with `aria-label` or `aria-labelledby`.
- **Layout:** `columns` times to a row (default 3), filling the width. `size` `xs` to `xl` (default `md`); `color` (default `primary`) fills the chosen time.
- **Locale:** the provider's, or `locale`. Needs a `<SlopkitUi>` above it.
- Other props go to the root `div`.

## Props

| Prop            | Type                                      | Default        | Description                                  |
| --------------- | ----------------------------------------- | -------------- | -------------------------------------------- |
| `data`          | `string[]`                                | —              | The times, `HH:mm` or `HH:mm:ss`.            |
| `value`         | `string \| null`                          | —              | The chosen time, when controlled.            |
| `defaultValue`  | `string \| null`                          | `null`         | The time chosen at first, when uncontrolled. |
| `onChange`      | `(value: string \| null) => void`         | —              | Called with the new time.                    |
| `allowDeselect` | `boolean`                                 | `false`        | A click on the chosen time clears it.        |
| `format`        | `'12h' \| '24h'`                          | the locale's   | 12 hours with a day period, or 24.           |
| `withSeconds`   | `boolean`                                 | `false`        | Shows the seconds.                           |
| `minTime`       | `string`                                  | —              | Earlier times are disabled.                  |
| `maxTime`       | `string`                                  | —              | Later times are disabled.                    |
| `disableTime`   | `string[] \| ((time: string) => boolean)` | —              | Times that are disabled.                     |
| `columns`       | `number`                                  | `3`            | Times to a row.                              |
| `disabled`      | `boolean`                                 | `false`        | Disables every time.                         |
| `locale`        | `string`                                  | the provider's | A locale for this grid.                      |
| `color`         | `SlopColor`                               | `'primary'`    | The color role of the chosen time.           |
| `size`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`    | `'md'`         | The times' size.                             |

`getTimeRange({ start, end, interval, withSeconds? })` returns the times from `start` to `end` (included when the steps land on it), `interval` minutes apart.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-time-grid`, with `data-size`, `data-color` and `data-disabled`.
- Slot: `time-grid-control` (each time), with `data-time` (the time as given), `data-selected` and `data-disabled`.
- Custom properties, on the grid or an ancestor: `--slp-time-grid-color` and `--slp-time-grid-content` (the chosen time).
