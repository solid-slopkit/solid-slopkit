import type { CalendarOwnProps } from '../calendar';
import { YearPicker, type YearPickerOwnProps, type YearPickerType } from '../year-picker';
import { CALENDAR_KEYS, PickerInput, type PickerInputOwnProps, type PickerInputProps } from '../picker-input';
import { YEAR_UNIT, type PickerType } from '../picker-value';

export type YearPickerInputOwnProps<Type extends YearPickerType = 'default'> = PickerInputOwnProps<Type>;

// The picker's own props only: the button's attributes replace the calendar root's.
export type YearPickerInputProps<Type extends YearPickerType = 'default'> = PickerInputProps<
  Pick<
    CalendarOwnProps,
    | 'date'
    | 'defaultDate'
    | 'onDateChange'
    | 'numberOfColumns'
    | 'minDate'
    | 'maxDate'
    | 'getYearProps'
    | 'onYearClick'
    | 'locale'
    | 'color'
    | 'previousLabel'
    | 'nextLabel'
  > &
    YearPickerOwnProps<Type>,
  Type
>;

const CONFIG = {
  name: 'YearPickerInput',
  slug: 'year-picker-input',
  picker: YearPicker as never,
  pickerKeys: CALENDAR_KEYS,
  unit: YEAR_UNIT,
  valueFormat: { year: 'numeric' },
} as const;

/**
 * A labelled field for a year, several years or a range, chosen in a YearPicker that opens in a dropdown under it.
 * The field is a button that shows the value, written by the locale. Every YearPicker prop works. Needs a
 * `<SlopkitUi>` above it.
 */
export function YearPickerInput<Type extends YearPickerType = 'default'>(props: YearPickerInputProps<Type>) {
  return <PickerInput {...(props as unknown as PickerInputProps<object, PickerType>)} config={CONFIG} />;
}
