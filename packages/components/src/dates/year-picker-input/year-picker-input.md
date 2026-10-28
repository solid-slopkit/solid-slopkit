# YearPickerInput

A labelled field for a year, several years or a range: a button that shows the value, written by the locale, and opens a [YearPicker](../year-picker/year-picker.md) in a dropdown under it. It works as [DatePickerInput](../date-picker-input/date-picker-input.md) does, with years for days.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Dropdown** below.

```tsx
import { YearPickerInput } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [year, setYear] = createSignal<Date | null>(null);
<YearPickerInput label="Tax year" placeholder="Pick a year" value={year()} onChange={setYear} clearable />;

<YearPickerInput label="Term" type="range" name="term" />;
```

- **Value:** as YearPicker's: `type` (read once) is `default` (a `Date` or `null`), `multiple` (`Date[]`) or `range` (`[start, end]`). A year is the `Date` of its January 1 at local midnight. Uncontrolled with `defaultValue` (read once) or controlled with `value`; `onChange(value)` gets the new value.
- **Text:** each year is written with `Intl.DateTimeFormat` in the provider's locale (or `locale`), with `valueFormat` options (default `{ year: 'numeric' }`, "2026"). Several years are joined with commas; a range's ends with `labelSeparator` (default `–`).
- **Dropdown:** a click (or Enter, Space) opens the years of the decade, focused on the chosen year. Choosing one closes it and returns the focus to the field, and so does a range's end; several years keep it open, and `closeOnChange={false}` keeps it open for every type. Escape, a press outside, and focus leaving both close it.
- **Calendar:** every YearPicker prop goes to it: `allowDeselect`, `allowSingleDateInRange`, `minDate`, `maxDate`, `getYearProps`, `onYearClick`, `numberOfColumns`, `color`, labels.
- **Forms:** `name` adds a hidden input with ISO years: `2026`, comma-separated for several or a range.
- Everything else (`placeholder`, `clearable`, `clearLabel`, `readOnly`, `disabled`, `variant`, sections, the label and texts, `position`, `offset`, `transition`) is DatePickerInput's. Needs a `<SlopkitUi>` above it.

## Props

The YearPicker's props (except `size`), plus DatePickerInput's field props: `placeholder`, `valueFormat` (default `{ year: 'numeric' }`), `labelSeparator`, `closeOnChange`, `clearable`, `clearLabel`, `name`, `readOnly`, `disabled`, `variant`, `leftSection`, `rightSection`, `position`, `offset`, `transition`, `transitionDuration`, and `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`.

## Styling

As DatePickerInput's, with `year-picker-input` for `date-picker-input`: the root `.slp-year-picker-input`, the slots `year-picker-input-value` and `year-picker-input-clear`, and the dropdown `.slp-year-picker-input-dropdown`, holding a `.slp-year-picker`.
