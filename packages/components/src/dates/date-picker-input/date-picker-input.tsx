import type { CalendarOwnProps } from '../calendar';
import { DatePicker, type DatePickerOwnProps, type DatePickerType } from '../date-picker';
import { CALENDAR_KEYS, PickerInput, type PickerInputOwnProps, type PickerInputProps } from '../picker-input';
import { DAY_UNIT, type PickerType } from '../picker-value';

export type DatePickerInputOwnProps<Type extends DatePickerType = 'default'> = PickerInputOwnProps<Type>;

// The picker's own props only: the button's attributes replace the calendar root's.
export type DatePickerInputProps<Type extends DatePickerType = 'default'> = PickerInputProps<
  Omit<CalendarOwnProps, 'minLevel'> & DatePickerOwnProps<Type>,
  Type
>;

const CONFIG = {
  name: 'DatePickerInput',
  slug: 'date-picker-input',
  picker: DatePicker as never,
  pickerKeys: [
    ...CALENDAR_KEYS,
    'level',
    'defaultLevel',
    'onLevelChange',
    'maxLevel',
    'excludeDate',
    'getDayProps',
    'getMonthProps',
    'onDayClick',
    'onMonthClick',
    'renderDay',
    'firstDayOfWeek',
    'weekendDays',
    'fixedWeeks',
    'hideOutsideDates',
    'hideWeekdays',
    'weekdayFormat',
  ],
  unit: DAY_UNIT,
  valueFormat: { dateStyle: 'medium' },
} as const;

/**
 * A labelled field for a day, several days or a range, chosen in a DatePicker that opens in a dropdown under it. The
 * field is a button that shows the value, written by the locale. Every DatePicker prop works. Needs a `<SlopkitUi>`
 * above it.
 */
export function DatePickerInput<Type extends DatePickerType = 'default'>(props: DatePickerInputProps<Type>) {
  return <PickerInput {...(props as unknown as PickerInputProps<object, PickerType>)} config={CONFIG} />;
}
