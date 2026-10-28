import type { CalendarOwnProps } from '../calendar';
import { MonthPicker, type MonthPickerOwnProps, type MonthPickerType } from '../month-picker';
import { CALENDAR_KEYS, PickerInput, type PickerInputOwnProps, type PickerInputProps } from '../picker-input';
import { MONTH_UNIT, type PickerType } from '../picker-value';

export type MonthPickerInputOwnProps<Type extends MonthPickerType = 'default'> = PickerInputOwnProps<Type>;

// The picker's own props only: the button's attributes replace the calendar root's.
export type MonthPickerInputProps<Type extends MonthPickerType = 'default'> = PickerInputProps<
  Pick<
    CalendarOwnProps,
    | 'date'
    | 'defaultDate'
    | 'onDateChange'
    | 'numberOfColumns'
    | 'minDate'
    | 'maxDate'
    | 'getMonthProps'
    | 'getYearProps'
    | 'onMonthClick'
    | 'onYearClick'
    | 'locale'
    | 'color'
    | 'previousLabel'
    | 'nextLabel'
  > &
    MonthPickerOwnProps<Type>,
  Type
>;

const CONFIG = {
  name: 'MonthPickerInput',
  slug: 'month-picker-input',
  picker: MonthPicker as never,
  pickerKeys: [...CALENDAR_KEYS, 'level', 'defaultLevel', 'onLevelChange', 'maxLevel', 'getMonthProps', 'onMonthClick'],
  unit: MONTH_UNIT,
  valueFormat: { month: 'long', year: 'numeric' },
} as const;

/**
 * A labelled field for a month, several months or a range, chosen in a MonthPicker that opens in a dropdown under
 * it. The field is a button that shows the value, written by the locale. Every MonthPicker prop works. Needs a
 * `<SlopkitUi>` above it.
 */
export function MonthPickerInput<Type extends MonthPickerType = 'default'>(props: MonthPickerInputProps<Type>) {
  return <PickerInput {...(props as unknown as PickerInputProps<object, PickerType>)} config={CONFIG} />;
}
