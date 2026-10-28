// The field of the picker inputs (DatePickerInput, MonthPickerInput, YearPickerInput): a button that shows the value
// and opens a picker in a dropdown under it. Internal; not exported from the package.
import { createSignal, createUniqueId, flush, omit, onSettled, Show, untrack, type Component } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './picker-input.module.css';
import type { CalendarOwnProps } from './calendar';
import { formatDate } from './format';
import { emptyValue, type PickerType, type PickerUnit, type PickerValue } from './picker-value';
import { useLocale } from '../components/provider';
import { controlProps, FieldDropdown, FieldWrapper, type FieldWrapperProps } from '../components/inputs/field';
import { Input, type InputOwnProps } from '../components/inputs/input';
import { useInputWrapper } from '../components/inputs/input-wrapper';
import { CloseButton } from '../components/button/close-button';
import { createDismissal, createFloating, createPresence, type FloatingPlacement } from '../components/primitives';
import { transitionAttributes, type TransitionName } from '../components/utilities/transition/transition-attributes';
import { callHandler, type ElementProps } from '../utils';

type AnyValue = PickerValue<PickerType>;

/** The props a picker input adds to its picker's. */
export interface PickerInputOwnProps<Type extends PickerType = 'default'>
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly'> {
  /** What it chooses. Defaults to `default`, one. Read once. */
  type?: Type;
  /** The chosen value, for a controlled field. */
  value?: PickerValue<Type>;
  /** The value at first, for an uncontrolled one. Read once. */
  defaultValue?: PickerValue<Type>;
  /** Called with the new value when the user chooses or clears. */
  onChange?: (value: PickerValue<Type>) => void;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** How a value is written in the field, as `Intl.DateTimeFormat` options. */
  valueFormat?: Intl.DateTimeFormatOptions;
  /** Between a range's two ends in the field. Defaults to ` – `. */
  labelSeparator?: string;
  /** Closes the dropdown once one is chosen, or a range's end. Defaults to `true`; several never close it. */
  closeOnChange?: boolean;
  /** Adds a button that clears the value. */
  clearable?: boolean;
  /** The clear button's accessible name. Defaults to `Clear`. */
  clearLabel?: string;
  /** Submits the value with a form, through a hidden input: ISO dates, comma-separated for several or a range. */
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

/** A picker input's props: its own, its picker's (`Picker`), and the button's other attributes. */
export type PickerInputProps<Picker, Type extends PickerType = 'default'> = ElementProps<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'value' | 'defaultValue' | 'onChange'>,
  PickerInputOwnProps<Type> & Omit<Picker, keyof PickerInputOwnProps<Type> | 'size'>
>;

/** The Calendar's props every picker takes; a picker input passes these, and its own, to its picker. */
export const CALENDAR_KEYS = [
  'date',
  'defaultDate',
  'onDateChange',
  'numberOfColumns',
  'minDate',
  'maxDate',
  'getYearProps',
  'onYearClick',
  'locale',
  'color',
  'previousLabel',
  'nextLabel',
  'allowDeselect',
  'allowSingleDateInRange',
] as const satisfies readonly (keyof CalendarOwnProps | 'allowDeselect' | 'allowSingleDateInRange')[];

const OWN_KEYS = [
  'type',
  'value',
  'defaultValue',
  'onChange',
  'placeholder',
  'valueFormat',
  'labelSeparator',
  'closeOnChange',
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
] as const;

/** What a picker input is made of. */
export interface PickerInputConfig {
  /** The component's name: `DatePickerInput`. */
  name: string;
  /** Its root class and slot prefix: `date-picker-input`. */
  slug: string;
  /** The picker in the dropdown. */
  picker: Component<Record<string, unknown>>;
  /** The picker's props, besides the type, the value and `size`. */
  pickerKeys: readonly string[];
  /** The cells it chooses, for the hidden input's ISO dates. */
  unit: PickerUnit;
  /** How a value is written by default. */
  valueFormat: Intl.DateTimeFormatOptions;
}

function PickerInputField(props: PickerInputProps<object, PickerType> & { config: PickerInputConfig }) {
  const config = untrack(() => props.config);
  const wrapper = useInputWrapper();
  const providerLocale = useLocale();
  const others = omit(controlProps(props) as Record<string, unknown>, 'config', ...config.pickerKeys, ...OWN_KEYS);
  // Getters, so the picker reads each prop where it uses it.
  const pickerProps = Object.defineProperties(
    {},
    Object.fromEntries(
      config.pickerKeys.map((key) => [key, { enumerable: true, get: () => (props as unknown as Record<string, unknown>)[key] }]),
    ),
  );

  const type: PickerType = untrack(() => props.type ?? 'default');
  const [own, setOwn] = createSignal<AnyValue>(
    untrack(() => (props.defaultValue as AnyValue | undefined) ?? emptyValue(type)),
    {
      name: `${config.name}.value`,
    },
  );
  const value = (): AnyValue => (props.value !== undefined ? (props.value as AnyValue) : own());
  const chosen = (): Date[] => {
    const current = value();
    if (type === 'range') return (current as [Date | null, Date | null]).filter((date): date is Date => !!date);
    if (type === 'multiple') return current as Date[];
    return current ? [current as Date] : [];
  };

  const setValue = (next: AnyValue) => {
    if (props.value === undefined) setOwn(next);
    (props.onChange as ((value: AnyValue) => void) | undefined)?.(next);
  };

  const locked = () => !!props.disabled || !!props.readOnly;
  const [opened, setOpened] = createSignal(false, { name: `${config.name}.opened` });
  let control: HTMLButtonElement | undefined;
  let box: HTMLElement | undefined;
  let dropdown: HTMLDivElement | undefined;
  const dropdownId = `slp-${config.slug}-${createUniqueId()}`;
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
  createDismissal(config.name, {
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
    // The field box, not the button in it, is what the dropdown sits under.
    box = control?.parentElement ?? undefined;
  });

  // Focus that leaves both the field and the dropdown closes it.
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (box?.contains(next) || dropdown?.contains(next))) return;
    setOpened(false);
  };

  const onPick = (next: AnyValue) => {
    setValue(next);
    if (!(props.closeOnChange ?? true) || type === 'multiple') return;
    if (type === 'range' && !(next as [Date | null, Date | null])[1]) return;
    // After the click: the calendar focuses the cell it chose once the click's handlers are done.
    queueMicrotask(() => close());
  };

  const locale = () => (props as { locale?: string }).locale ?? providerLocale();
  const text = () => {
    const format = (date: Date) => formatDate(date, locale(), props.valueFormat ?? config.valueFormat);
    if (type === 'range') {
      const [start, end] = value() as [Date | null, Date | null];
      if (!start) return '';
      return `${format(start)}${props.labelSeparator ?? ' – '}${end ? format(end) : ''}`;
    }
    return chosen().map(format).join(', ');
  };

  const showClear = () => !!props.clearable && chosen().length > 0 && !locked();
  const clear = () => {
    setValue(emptyValue(type));
    control?.focus();
  };

  const Picker = config.picker;

  return (
    <>
      <Input
        {...others}
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
            <CloseButton size="xs" label={props.clearLabel ?? 'Clear'} onClick={clear} data-slot={`${config.slug}-clear`} />
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
        <span id={valueId} data-slot={`${config.slug}-value`} data-placeholder={text() ? undefined : ''} class={style.value}>
          {text() || props.placeholder}
        </span>
      </Input>
      <Show when={presence.mounted()}>
        <FieldDropdown
          ref={(element) => (dropdown = element)}
          id={dropdownId}
          slug={config.slug}
          class={style.dropdown}
          aria-label={props['aria-label'] as string | undefined}
          floating={floating}
          animation={animation}
          onFocusOut={onFocusOut}
          onShow={(element) => {
            // The calendar takes the focus, on its chosen cell, today or its first cell.
            element.querySelector<HTMLElement>('[data-slot="calendar-grid"] [tabindex="0"]')?.focus();
          }}
        >
          <Picker {...pickerProps} type={type} value={value()} onChange={onPick} size={wrapper?.size()} />
        </FieldDropdown>
      </Show>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={chosen().map(config.unit.key).join(',')} />
      </Show>
    </>
  );
}

/** A picker input: the label and texts around the field. */
export function PickerInput(props: PickerInputProps<object, PickerType> & { config: PickerInputConfig }) {
  return (
    <FieldWrapper field={props} rootClass={`slp-${untrack(() => props.config.slug)} ${style.field}`}>
      <PickerInputField {...props} />
    </FieldWrapper>
  );
}
