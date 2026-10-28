import { omit, untrack } from 'solid-js';
import { Calendar, type CalendarProps } from '../calendar';
import { createPickerValue, YEAR_UNIT, type PickerType, type PickerValue } from '../picker-value';
import { callHandler } from '../../utils';
import { joinClass } from '../../style-props';

/** What a year picker chooses: one year, several, or a range from one year to another. */
export type YearPickerType = PickerType;

/** The value of a year picker of a type: a year or `null`, an array of years, or a range's two ends. */
export type YearPickerValue<Type extends YearPickerType = 'default'> = PickerValue<Type>;

export interface YearPickerOwnProps<Type extends YearPickerType = 'default'> {
  /** What it chooses. Defaults to `default`, one year. Read once. */
  type?: Type;
  /** The chosen years, for a controlled year picker. */
  value?: YearPickerValue<Type>;
  /** The years chosen first, for an uncontrolled one. Read once. */
  defaultValue?: YearPickerValue<Type>;
  /** Called with the new value when the user chooses. Years are their January 1. */
  onChange?: (value: YearPickerValue<Type>) => void;
  /** Lets a click on the chosen year clear it (`default` type). */
  allowDeselect?: boolean;
  /** Lets a range start and end in the same year (`range` type). */
  allowSingleDateInRange?: boolean;
}

// It shows only decades, so the Calendar's levels and its props for days and months don't apply; the div's own
// `onChange`, `value`, `defaultValue` and `type` attributes would blur the value's types.
export type YearPickerProps<Type extends YearPickerType = 'default'> = Omit<
  CalendarProps,
  | 'minLevel'
  | 'maxLevel'
  | 'level'
  | 'defaultLevel'
  | 'onLevelChange'
  | 'getDayProps'
  | 'onDayClick'
  | 'renderDay'
  | 'excludeDate'
  | 'firstDayOfWeek'
  | 'weekendDays'
  | 'fixedWeeks'
  | 'hideOutsideDates'
  | 'hideWeekdays'
  | 'weekdayFormat'
  | 'getMonthProps'
  | 'onMonthClick'
  | 'onChange'
  | 'value'
  | 'defaultValue'
  | 'type'
> &
  YearPickerOwnProps<Type>;

/**
 * A calendar to choose years with: one, several (`type="multiple"`), or a range from one year to another
 * (`type="range"`), previewed as the pointer or the focus moves. It shows the years of a decade. The Calendar's props
 * for years work; `getYearProps` and `onYearClick` still get every year.
 */
export function YearPicker<Type extends YearPickerType = 'default'>(props: YearPickerProps<Type>) {
  const others = omit(
    props,
    'class',
    'type',
    'value',
    'defaultValue',
    'onChange',
    'allowDeselect',
    'allowSingleDateInRange',
    'getYearProps',
    'onYearClick',
    'date',
    'defaultDate',
    'onDateChange',
    'onPointerOver',
    'onPointerLeave',
    'onFocusIn',
  );
  const picker = createPickerValue(props, YEAR_UNIT, 'YearPicker');

  return (
    <Calendar
      class={joinClass(['slp-year-picker'], props.class)}
      minLevel="decade"
      maxLevel="decade"
      date={props.date}
      defaultDate={untrack(() => props.defaultDate ?? picker.chosen()[0])}
      onDateChange={(date) => {
        picker.show(date);
        props.onDateChange?.(date);
      }}
      getYearProps={(date) => ({ ...props.getYearProps?.(date), ...picker.marks[YEAR_UNIT.key(date)] })}
      onYearClick={(date, event) => {
        props.onYearClick?.(date, event);
        picker.choose(date);
      }}
      onPointerOver={(event: PointerEvent) => {
        callHandler(props.onPointerOver, event);
        picker.preview(event);
      }}
      onPointerLeave={(event: PointerEvent) => {
        callHandler(props.onPointerLeave, event);
        picker.endPreview();
      }}
      onFocusIn={(event: FocusEvent) => {
        callHandler(props.onFocusIn, event);
        picker.preview(event);
      }}
      data-type={picker.type}
      {...others}
    />
  );
}
