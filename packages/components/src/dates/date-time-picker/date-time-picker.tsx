import { createSignal, createUniqueId, flush, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import inputStyle from '../picker-input.module.css';
import style from './date-time-picker.module.css';
import type { CalendarOwnProps } from '../calendar';
import { DatePicker } from '../date-picker';
import { formatDate } from '../format';
import { DAY_UNIT } from '../picker-value';
import { parseTime, timeToString, type TimeParts } from '../time';
import { TimePicker, type TimePickerProps } from '../time-picker';
import { useLocale } from '../../components/provider';
import { controlProps, FieldDropdown, FieldWrapper, type FieldWrapperProps } from '../../components/inputs/field';
import { Input, type InputOwnProps } from '../../components/inputs/input';
import { useInputWrapper } from '../../components/inputs/input-wrapper';
import { Button } from '../../components/button/button';
import { CloseButton } from '../../components/button/close-button';
import { createDismissal, createFloating, createPresence, type FloatingPlacement } from '../../components/primitives';
import { transitionAttributes, type TransitionName } from '../../components/utilities/transition/transition-attributes';
import { callHandler, type ElementProps } from '../../utils';

export interface DateTimePickerOwnProps
  extends
    FieldWrapperProps,
    Omit<CalendarOwnProps, 'size' | 'minLevel'>,
    Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly'> {
  /** The date and time, for a controlled field; `null` for none. */
  value?: Date | null;
  /** The date and time at first, for an uncontrolled one. Read once. Defaults to `null`. */
  defaultValue?: Date | null;
  /** Called with the date and time when a day or a time is chosen, or `null` when it's cleared. */
  onChange?: (value: Date | null) => void;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** How the value is written in the field, as `Intl.DateTimeFormat` options. Defaults to a medium date and a short time. */
  valueFormat?: Intl.DateTimeFormatOptions;
  /** Adds the seconds, to the time picker and the default format. */
  withSeconds?: boolean;
  /** Props for the time picker in the dropdown: `format`, steps, limits, `withDropdown`… */
  timePickerProps?: Omit<TimePickerProps, 'value' | 'defaultValue' | 'onChange' | 'withSeconds'>;
  /** The time picker's label. Defaults to `Time`. */
  timeLabel?: string;
  /** The text of the button that closes the dropdown. Defaults to `Done`. */
  submitLabel?: string;
  /** Adds a button that clears the value. */
  clearable?: boolean;
  /** The clear button's accessible name. Defaults to `Clear`. */
  clearLabel?: string;
  /** Submits the value with a form as a local date and time (`2026-10-15T09:30`), through a hidden input. */
  name?: string;
  /** Where the dropdown goes against the field. Defaults to `bottom-start`. */
  position?: FloatingPlacement;
  /** Gap between the field and the dropdown, in px. Defaults to 4. */
  offset?: number;
  /** The dropdown's animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in ms. Defaults to 150. */
  transitionDuration?: number;
}

export type DateTimePickerProps = ElementProps<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'value' | 'defaultValue' | 'onChange'>,
  DateTimePickerOwnProps
>;

// The props that go to the DatePicker in the dropdown.
const PICKER_KEYS = [
  'date',
  'defaultDate',
  'onDateChange',
  'level',
  'defaultLevel',
  'onLevelChange',
  'maxLevel',
  'numberOfColumns',
  'minDate',
  'maxDate',
  'excludeDate',
  'getDayProps',
  'getMonthProps',
  'getYearProps',
  'onDayClick',
  'onMonthClick',
  'onYearClick',
  'renderDay',
  'firstDayOfWeek',
  'weekendDays',
  'fixedWeeks',
  'hideOutsideDates',
  'hideWeekdays',
  'weekdayFormat',
  'locale',
  'color',
  'previousLabel',
  'nextLabel',
] as const;

const timeOf = (date: Date): TimeParts => ({ hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() });
const at = (day: Date, time: TimeParts) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.hours, time.minutes, time.seconds);
const sameMoment = (a: Date | null, b: Date | null) => (a && b ? a.getTime() === b.getTime() : a === b);

function DateTimePickerField(props: DateTimePickerProps) {
  const wrapper = useInputWrapper();
  const providerLocale = useLocale();
  const others = omit(
    controlProps(props) as DateTimePickerProps,
    ...PICKER_KEYS,
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'valueFormat',
    'withSeconds',
    'timePickerProps',
    'timeLabel',
    'submitLabel',
    'clearable',
    'clearLabel',
    'name',
    'position',
    'offset',
    'transition',
    'transitionDuration',
    'variant',
    'leftSection',
    'rightSection',
    'disabled',
    'readOnly',
    'onClick',
    'onFocusOut',
    'aria-describedby',
  );
  // Getters, so the DatePicker reads each prop where it uses it.
  const pickerProps = Object.defineProperties(
    {},
    Object.fromEntries(
      PICKER_KEYS.map((key) => [key, { enumerable: true, get: () => (props as unknown as Record<string, unknown>)[key] }]),
    ),
  ) as Partial<CalendarOwnProps>;
  const locale = () => props.locale ?? providerLocale();

  const [own, setOwn] = createSignal<Date | null>(
    untrack(() => props.defaultValue ?? null),
    { name: 'DateTimePicker.value' },
  );
  const value = () => (props.value === undefined ? own() : props.value);
  const setValue = (next: Date | null) => {
    if (sameMoment(next, value())) return;
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
  };

  // A time chosen before a day: it's used once a day is.
  const [heldTime, setHeldTime] = createSignal<TimeParts | undefined>(undefined, { name: 'DateTimePicker.heldTime' });
  const time = (): TimeParts => {
    const current = value();
    return current ? timeOf(current) : (heldTime() ?? { hours: 0, minutes: 0, seconds: 0 });
  };

  const chooseDay = (day: Date | null) => {
    if (!day) return;
    setValue(at(day, time()));
  };
  const chooseTime = (text: string) => {
    const parsed = parseTime(text);
    if (!parsed) return;
    const current = value();
    if (current) setValue(at(current, parsed));
    else setHeldTime(parsed);
  };

  const text = () => {
    const current = value();
    if (!current) return '';
    return formatDate(
      current,
      locale(),
      props.valueFormat ?? { dateStyle: 'medium', timeStyle: props.withSeconds ? 'medium' : 'short' },
    );
  };

  const locked = () => !!props.disabled || !!props.readOnly;
  const [opened, setOpened] = createSignal(false, { name: 'DateTimePicker.opened' });
  let control: HTMLButtonElement | undefined;
  let box: HTMLElement | undefined;
  let dropdown: HTMLDivElement | undefined;
  const dropdownId = `slp-date-time-picker-${createUniqueId()}`;
  const valueId = `${dropdownId}-value`;

  const close = () => {
    if (dropdown?.contains(document.activeElement)) control?.focus();
    setOpened(false);
    flush();
  };

  const presence = createPresence({ present: opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => box,
    floating: () => dropdown,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom-start',
    offset: () => props.offset ?? 4,
  });
  createDismissal('DateTimePicker', {
    open: opened,
    elements: () => [box, dropdown],
    onDismiss: () => close(),
  });
  const animation = transitionAttributes(presence, {
    transition: () => props.transition ?? 'fade',
    duration: () => props.transitionDuration ?? 150,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });

  onSettled(() => {
    box = control?.parentElement ?? undefined;
  });

  // Focus that leaves both the field and the dropdown closes it.
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (box?.contains(next) || dropdown?.contains(next))) return;
    setOpened(false);
  };

  const showClear = () => !!props.clearable && !!value() && !locked();
  const clear = () => {
    setHeldTime(undefined);
    setValue(null);
    control?.focus();
  };

  const isoValue = () => {
    const current = value();
    return current ? `${DAY_UNIT.key(current)}T${timeToString(timeOf(current), props.withSeconds)}` : '';
  };

  return (
    <>
      <Input
        {...(others as Record<string, unknown>)}
        ref={(element: HTMLElement) => (control = element as HTMLButtonElement)}
        as="button"
        type="button"
        // A button can't be required: `required` only shows the asterisk and sets `aria-required`.
        required={false}
        aria-required={wrapper?.required() ? 'true' : undefined}
        aria-readonly={props.readOnly ? 'true' : undefined}
        variant={props.variant}
        leftSection={props.leftSection}
        rightSection={
          <Show when={showClear()} fallback={props.rightSection}>
            <CloseButton size="xs" label={props.clearLabel ?? 'Clear'} onClick={clear} data-slot="date-time-picker-clear" />
          </Show>
        }
        disabled={props.disabled}
        aria-haspopup="dialog"
        aria-expanded={opened() ? 'true' : 'false'}
        aria-controls={presence.mounted() ? dropdownId : undefined}
        aria-describedby={[props['aria-describedby'], text() ? valueId : ''].filter(Boolean).join(' ') || undefined}
        data-empty={text() ? undefined : ''}
        onClick={(event: MouseEvent) => {
          callHandler(props.onClick, event);
          if (event.defaultPrevented || locked()) return;
          if (opened()) close();
          else setOpened(true);
        }}
        onFocusOut={(event: FocusEvent) => {
          callHandler(props.onFocusOut, event);
          onFocusOut(event);
        }}
      >
        <span id={valueId} data-slot="date-time-picker-value" data-placeholder={text() ? undefined : ''} class={inputStyle.value}>
          {text() || props.placeholder}
        </span>
      </Input>
      <Show when={presence.mounted()}>
        <FieldDropdown
          ref={(element) => (dropdown = element)}
          id={dropdownId}
          slug="date-time-picker"
          class={inputStyle.dropdown}
          aria-label={props['aria-label']}
          floating={floating}
          animation={animation}
          onFocusOut={onFocusOut}
          onShow={(element) => {
            // The calendar takes the focus, on the chosen day, today or its first day.
            element.querySelector<HTMLElement>('[data-slot="calendar-grid"] [tabindex="0"]')?.focus();
          }}
        >
          <div class={style.panel}>
            <DatePicker {...pickerProps} value={value()} onChange={chooseDay} size={wrapper?.size()} />
            <div class={style.footer}>
              <TimePicker
                {...props.timePickerProps}
                label={props.timeLabel ?? 'Time'}
                size={wrapper?.size()}
                withSeconds={props.withSeconds}
                locale={props.locale}
                value={
                  value()
                    ? timeToString(time(), props.withSeconds)
                    : heldTime()
                      ? timeToString(heldTime()!, props.withSeconds)
                      : ''
                }
                onChange={chooseTime}
                data-slot="date-time-picker-time"
              />
              <Button size={wrapper?.size() ?? 'md'} onClick={close} data-slot="date-time-picker-submit">
                {props.submitLabel ?? 'Done'}
              </Button>
            </div>
          </div>
        </FieldDropdown>
      </Show>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={isoValue()} />
      </Show>
    </>
  );
}

/**
 * A labelled field for a date and time: a button that shows them, written by the locale, and opens a DatePicker and
 * a TimePicker in a dropdown under it. A chosen day keeps the time, and a chosen time the day. Needs a
 * `<SlopkitUi>` above it.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  return (
    <FieldWrapper field={props} rootClass={`slp-date-time-picker ${inputStyle.field}`}>
      <DateTimePickerField {...props} />
    </FieldWrapper>
  );
}
