import { omit, untrack } from 'solid-js';
import { Calendar, type CalendarProps } from '../calendar';
import { createPickerValue, DAY_UNIT, type PickerType, type PickerValue } from '../picker-value';
import { callHandler } from '../../utils';
import { joinClass } from '../../style-props';

/** What a date picker chooses: one day, several, or a range from one day to another. */
export type DatePickerType = PickerType;

/** The value of a date picker of a type: a day or `null`, an array of days, or a range's two ends. */
export type DatePickerValue<Type extends DatePickerType = 'default'> = PickerValue<Type>;

export interface DatePickerOwnProps<Type extends DatePickerType = 'default'> {
  /** What it chooses. Defaults to `default`, one day. Read once. */
  type?: Type;
  /** The chosen days, for a controlled date picker. */
  value?: DatePickerValue<Type>;
  /** The days chosen first, for an uncontrolled one. Read once. */
  defaultValue?: DatePickerValue<Type>;
  /** Called with the new value when the user chooses. */
  onChange?: (value: DatePickerValue<Type>) => void;
  /** Lets a click on the chosen day clear it (`default` type). */
  allowDeselect?: boolean;
  /** Lets a range start and end on the same day (`range` type). */
  allowSingleDateInRange?: boolean;
}

// The div's own `onChange`, `value`, `defaultValue` and `type` attributes would blur the value's types.
export type DatePickerProps<Type extends DatePickerType = 'default'> = Omit<
  CalendarProps,
  'minLevel' | 'onChange' | 'value' | 'defaultValue' | 'type'
> &
  DatePickerOwnProps<Type>;

/**
 * A calendar to choose days with: one, several (`type="multiple"`), or a range from one day to another
 * (`type="range"`), previewed as the pointer or the focus moves. Every Calendar prop works; `getDayProps` and
 * `onDayClick` still get every day.
 */
export function DatePicker<Type extends DatePickerType = 'default'>(props: DatePickerProps<Type>) {
  const others = omit(
    props,
    'class',
    'type',
    'value',
    'defaultValue',
    'onChange',
    'allowDeselect',
    'allowSingleDateInRange',
    'getDayProps',
    'onDayClick',
    'date',
    'defaultDate',
    'onDateChange',
    'onPointerOver',
    'onPointerLeave',
    'onFocusIn',
  );
  const picker = createPickerValue(props, DAY_UNIT, 'DatePicker');

  return (
    <Calendar
      class={joinClass(['slp-date-picker'], props.class)}
      date={props.date}
      defaultDate={untrack(() => props.defaultDate ?? picker.chosen()[0])}
      onDateChange={(date) => {
        picker.show(date);
        props.onDateChange?.(date);
      }}
      getDayProps={(date) => ({ ...props.getDayProps?.(date), ...picker.marks[DAY_UNIT.key(date)] })}
      onDayClick={(date, event) => {
        props.onDayClick?.(date, event);
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
