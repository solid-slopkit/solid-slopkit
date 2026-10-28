# MonthPickerInput

A labelled field for a month, several months or a range: a button that shows the value, written by the locale, and opens a [MonthPicker](../month-picker/month-picker.md) in a dropdown under it. It works as [DatePickerInput](../date-picker-input/date-picker-input.md) does, with months for days.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Dropdown** below.

```tsx
import { MonthPickerInput } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [month, setMonth] = createSignal<Date | null>(null);
<MonthPickerInput label="Billing month" placeholder="Pick a month" value={month()} onChange={setMonth} clearable />;

<MonthPickerInput label="Season" type="range" name="season" />;
```

- **Value:** as MonthPicker's: `type` (read once) is `default` (a `Date` or `null`), `multiple` (`Date[]`) or `range` (`[start, end]`). A month is the `Date` of its first day at local midnight. Uncontrolled with `defaultValue` (read once) or controlled with `value`; `onChange(value)` gets the new value.
- **Text:** each month is written with `Intl.DateTimeFormat` in the provider's locale (or `locale`), with `valueFormat` options (default `{ month: 'long', year: 'numeric' }`, "October 2026"). Several months are joined with commas; a range's ends with `labelSeparator` (default `–`).
- **Dropdown:** a click (or Enter, Space) opens the months of the year, focused on the chosen month. Choosing one closes it and returns the focus to the field, and so does a range's end; several months keep it open, and `closeOnChange={false}` keeps it open for every type. Escape, a press outside, and focus leaving both close it.
- **Calendar:** every MonthPicker prop goes to it: `allowDeselect`, `allowSingleDateInRange`, `level`/`defaultLevel`/`onLevelChange`, `maxLevel`, `minDate`, `maxDate`, `getMonthProps`, `getYearProps`, `numberOfColumns`, `color`, labels.
- **Forms:** `name` adds a hidden input with ISO months: `2026-10`, comma-separated for several or a range.
- Everything else (`placeholder`, `clearable`, `clearLabel`, `readOnly`, `disabled`, `variant`, sections, the label and texts, `position`, `offset`, `transition`) is DatePickerInput's. Needs a `<SlopkitUi>` above it.

## Props

The MonthPicker's props (except `size`), plus DatePickerInput's field props: `placeholder`, `valueFormat` (default `{ month: 'long', year: 'numeric' }`), `labelSeparator`, `closeOnChange`, `clearable`, `clearLabel`, `name`, `readOnly`, `disabled`, `variant`, `leftSection`, `rightSection`, `position`, `offset`, `transition`, `transitionDuration`, and `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`.

## Styling

As DatePickerInput's, with `month-picker-input` for `date-picker-input`: the root `.slp-month-picker-input`, the slots `month-picker-input-value` and `month-picker-input-clear`, and the dropdown `.slp-month-picker-input-dropdown`, holding a `.slp-month-picker`.
