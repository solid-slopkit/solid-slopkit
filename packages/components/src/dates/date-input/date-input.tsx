import { createSignal, createUniqueId, flush, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from '../picker-input.module.css';
import type { CalendarOwnProps } from '../calendar';
import { DatePicker } from '../date-picker';
import { compareDays, isSameDay, startOfMonth } from '../date';
import { formatDate, parseDate } from '../format';
import { DAY_UNIT } from '../picker-value';
import { useLocale } from '../../components/provider';
import { controlProps, FieldDropdown, FieldWrapper, type FieldWrapperProps } from '../../components/inputs/field';
import { Input, type InputOwnProps } from '../../components/inputs/input';
import { useInputWrapper } from '../../components/inputs/input-wrapper';
import { CloseButton } from '../../components/button/close-button';
import { createDismissal, createFloating, createPresence, type FloatingPlacement } from '../../components/primitives';
import { transitionAttributes, type TransitionName } from '../../components/utilities/transition/transition-attributes';
import { callHandler, type ElementProps } from '../../utils';

export interface DateInputOwnProps
  extends
    FieldWrapperProps,
    Omit<CalendarOwnProps, 'size' | 'minLevel'>,
    Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly'> {
  /** The day, for a controlled field; `null` for none. */
  value?: Date | null;
  /** The day at first, for an uncontrolled one. Read once. Defaults to `null`. */
  defaultValue?: Date | null;
  /** Called with the day when it changes: typed, chosen in the calendar, or cleared (`null`). */
  onChange?: (value: Date | null) => void;
  /** How the day is written in the field, as `Intl.DateTimeFormat` options. Defaults to numbers: `10/15/2026`. */
  valueFormat?: Intl.DateTimeFormatOptions;
  /** Reads a day from the text. Defaults to `parseDate` in the locale: ISO, or numbers in the locale's order. */
  dateParser?: (text: string) => Date | null;
  /** Lets a click on the chosen day in the calendar clear it. */
  allowDeselect?: boolean;
  /** Adds a button that clears the day. */
  clearable?: boolean;
  /** The clear button's accessible name. Defaults to `Clear`. */
  clearLabel?: string;
  /** Submits the day with a form as an ISO day (`2026-10-15`), through a hidden input. */
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

export type DateInputProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'>,
  DateInputOwnProps
>;

const NUMERIC: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

// The props that go to the DatePicker in the dropdown.
const PICKER_KEYS = [
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
  'allowDeselect',
] as const;

function DateInputField(props: DateInputProps) {
  const wrapper = useInputWrapper();
  const providerLocale = useLocale();
  const others = omit(
    controlProps(props) as DateInputProps,
    ...PICKER_KEYS,
    'date',
    'value',
    'defaultValue',
    'onChange',
    'valueFormat',
    'dateParser',
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
    'onInput',
    'onClick',
    'onKeyDown',
    'onFocusOut',
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
    { name: 'DateInput.value' },
  );
  const value = () => (props.value === undefined ? own() : props.value);
  // What's typed, while it's being edited; the value, written, otherwise.
  const [draft, setDraft] = createSignal<string | undefined>(undefined, { name: 'DateInput.draft' });
  const text = () => {
    const current = value();
    return draft() ?? (current ? formatDate(current, locale(), props.valueFormat ?? NUMERIC) : '');
  };

  const setValue = (next: Date | null) => {
    const current = value();
    if (next === current || (next && current && isSameDay(next, current))) return;
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
  };

  // The month the calendar shows: it follows a typed day.
  const [shown, setShown] = createSignal<Date | undefined>(undefined, { name: 'DateInput.shown' });

  // Whether the calendar would let the day be chosen.
  const allowed = (day: Date) =>
    !(props.minDate && compareDays(day, props.minDate) < 0) &&
    !(props.maxDate && compareDays(day, props.maxDate) > 0) &&
    !props.excludeDate?.(day) &&
    !props.getDayProps?.(day)?.disabled;

  const locked = () => !!props.disabled || !!props.readOnly;
  const [opened, setOpened] = createSignal(false, { name: 'DateInput.opened' });
  let field: HTMLInputElement | undefined;
  let box: HTMLElement | undefined;
  let dropdown: HTMLDivElement | undefined;
  const dropdownId = `slp-date-input-${createUniqueId()}`;

  const open = () => {
    if (!locked()) setOpened(true);
  };
  // Closed, it forgets the month it moved to: it opens again on the value's.
  const close = () => {
    if (dropdown?.contains(document.activeElement)) field?.focus();
    setOpened(false);
    setShown(undefined);
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
  createDismissal('DateInput', {
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
    // The field box, not the input in it, is what the dropdown sits under.
    box = field?.parentElement ?? undefined;
  });

  const parse = (text: string) => (props.dateParser ? props.dateParser(text) : parseDate(text, locale()));

  // An edit is done: text that names an allowed day sets it (a short year too), and the field shows the value again.
  const commit = () => {
    flush();
    const typed = draft();
    if (typed === undefined) return;
    const day = typed.trim() ? parse(typed) : null;
    if (day && allowed(day)) setValue(day);
    setDraft(undefined);
  };

  // Focus that leaves both the field and the dropdown ends the edit and closes it.
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (box?.contains(next) || dropdown?.contains(next))) return;
    commit();
    setOpened(false);
    setShown(undefined);
  };

  const showClear = () => !!props.clearable && !!value() && !locked();
  const clear = () => {
    setDraft(undefined);
    setValue(null);
    field?.focus();
  };

  return (
    <>
      <Input
        {...(others as Record<string, unknown>)}
        ref={(element: HTMLElement) => (field = element as HTMLInputElement)}
        variant={props.variant}
        leftSection={props.leftSection}
        rightSection={
          <Show when={showClear()} fallback={props.rightSection}>
            <CloseButton size="xs" label={props.clearLabel ?? 'Clear'} onClick={clear} data-slot="date-input-clear" />
          </Show>
        }
        disabled={props.disabled}
        readOnly={props.readOnly}
        type="text"
        autocomplete="off"
        spellcheck={false}
        // A text field that opens a dialog is a combobox.
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={opened() ? 'true' : 'false'}
        aria-controls={presence.mounted() ? dropdownId : undefined}
        value={text()}
        onInput={(event: InputEvent) => {
          callHandler(props.onInput, event);
          const typed = (event.currentTarget as HTMLInputElement).value;
          setDraft(typed);
          if (!typed.trim()) {
            setValue(null);
            return;
          }
          const day = parse(typed);
          // While typing, a year is taken once it has four digits, so 2026 doesn't set 2002 and 2020 on the way.
          if (!day || !allowed(day) || (!props.dateParser && !/\d{4}/.test(typed))) return;
          setValue(day);
          setShown(startOfMonth(day));
        }}
        onClick={(event: MouseEvent) => {
          callHandler(props.onClick, event);
          if (!event.defaultPrevented) open();
        }}
        onKeyDown={(event: KeyboardEvent) => {
          callHandler(props.onKeyDown, event);
          if (event.defaultPrevented || event.isComposing) return;
          if (event.key === 'Enter') {
            commit();
            if (opened()) close();
          } else if (event.key === 'ArrowDown' && !opened() && !locked()) {
            event.preventDefault();
            open();
          }
        }}
        onFocusOut={(event: FocusEvent) => {
          callHandler(props.onFocusOut, event);
          onFocusOut(event);
        }}
      />
      <Show when={presence.mounted()}>
        <FieldDropdown
          ref={(element) => (dropdown = element)}
          id={dropdownId}
          slug="date-input"
          class={style.dropdown}
          aria-label={props['aria-label']}
          floating={floating}
          animation={animation}
          onFocusOut={onFocusOut}
        >
          <DatePicker
            {...pickerProps}
            date={props.date ?? shown()}
            onDateChange={(date) => {
              setShown(date);
              props.onDateChange?.(date);
            }}
            value={value()}
            onChange={(next) => {
              setDraft(undefined);
              setValue(next);
              // After the click: the calendar focuses the day it chose once the click's handlers are done.
              queueMicrotask(() => close());
            }}
            size={wrapper?.size()}
          />
        </FieldDropdown>
      </Show>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={value() ? DAY_UNIT.key(value()!) : ''} />
      </Show>
    </>
  );
}

/**
 * A labelled text field for a day: type it, or choose it in a DatePicker that opens in a dropdown under the field.
 * Typed text that names an allowed day sets it; leaving the field writes the day by the locale. Needs a
 * `<SlopkitUi>` above it.
 */
export function DateInput(props: DateInputProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-date-input">
      <DateInputField {...props} />
    </FieldWrapper>
  );
}
