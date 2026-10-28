import { omit, untrack } from 'solid-js';
import { Calendar, type CalendarLevel, type CalendarProps } from '../calendar';
import { createPickerValue, MONTH_UNIT, type PickerType, type PickerValue } from '../picker-value';
import { callHandler } from '../../utils';
import { joinClass } from '../../style-props';

/** What a month picker chooses: one month, several, or a range from one month to another. */
export type MonthPickerType = PickerType;

/** The value of a month picker of a type: a month or `null`, an array of months, or a range's two ends. */
export type MonthPickerValue<Type extends MonthPickerType = 'default'> = PickerValue<Type>;

/** What a month picker shows: the months of a year, or the years of a decade. */
export type MonthPickerLevel = Exclude<CalendarLevel, 'month'>;

export interface MonthPickerOwnProps<Type extends MonthPickerType = 'default'> {
  /** What it chooses. Defaults to `default`, one month. Read once. */
  type?: Type;
  /** The chosen months, for a controlled month picker. */
  value?: MonthPickerValue<Type>;
  /** The months chosen first, for an uncontrolled one. Read once. */
  defaultValue?: MonthPickerValue<Type>;
  /** Called with the new value when the user chooses. Months are their first day. */
  onChange?: (value: MonthPickerValue<Type>) => void;
  /** Lets a click on the chosen month clear it (`default` type). */
  allowDeselect?: boolean;
  /** Lets a range start and end in the same month (`range` type). */
  allowSingleDateInRange?: boolean;
  /** What it shows, for a controlled month picker. */
  level?: MonthPickerLevel;
  /** What it shows first, for an uncontrolled one. Read once. Defaults to `year`. */
  defaultLevel?: MonthPickerLevel;
  /** Called with the level when the header or a year changes it. */
  onLevelChange?: (level: MonthPickerLevel) => void;
  /** The highest level, reached through the header. Defaults to `decade`. */
  maxLevel?: MonthPickerLevel;
}

// The Calendar's props for days don't apply; the div's own `onChange`, `value`, `defaultValue` and `type`
// attributes would blur the value's types.
export type MonthPickerProps<Type extends MonthPickerType = 'default'> = Omit<
  CalendarProps,
  | 'minLevel'
  | 'level'
  | 'defaultLevel'
  | 'onLevelChange'
  | 'maxLevel'
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
  | 'onChange'
  | 'value'
  | 'defaultValue'
  | 'type'
> &
  MonthPickerOwnProps<Type>;

/**
 * A calendar to choose months with: one, several (`type="multiple"`), or a range from one month to another
 * (`type="range"`), previewed as the pointer or the focus moves. It shows the months of a year, and the years of a
 * decade above them. The Calendar's props for years and months work; `getMonthProps` and `onMonthClick` still get
 * every month.
 */
export function MonthPicker<Type extends MonthPickerType = 'default'>(props: MonthPickerProps<Type>) {
  const others = omit(
    props,
    'class',
    'type',
    'value',
    'defaultValue',
    'onChange',
    'allowDeselect',
    'allowSingleDateInRange',
    'getMonthProps',
    'onMonthClick',
    'date',
    'defaultDate',
    'onDateChange',
    'level',
    'defaultLevel',
    'onLevelChange',
    'maxLevel',
    'onPointerOver',
    'onPointerLeave',
    'onFocusIn',
  );
  const picker = createPickerValue(props, MONTH_UNIT, 'MonthPicker');

  return (
    <Calendar
      class={joinClass(['slp-month-picker'], props.class)}
      minLevel="year"
      maxLevel={props.maxLevel}
      level={props.level}
      defaultLevel={untrack(() => props.defaultLevel)}
      onLevelChange={(level) => props.onLevelChange?.(level as MonthPickerLevel)}
      date={props.date}
      defaultDate={untrack(() => props.defaultDate ?? picker.chosen()[0])}
      onDateChange={(date) => {
        picker.show(date);
        props.onDateChange?.(date);
      }}
      getMonthProps={(date) => ({ ...props.getMonthProps?.(date), ...picker.marks[MONTH_UNIT.key(date)] })}
      onMonthClick={(date, event) => {
        props.onMonthClick?.(date, event);
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
