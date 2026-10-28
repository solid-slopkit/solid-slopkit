import { createMemo, createSignal, flush, omit, onCleanup, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './number-input.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { useLocale } from '../../provider';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';
import { decimalPlaces, formatNumber, numberSeparators, parseNumber, roundTo, sanitizeNumberText } from './number-format';

export interface NumberInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly' | 'ref'> {
  /** The number, for a controlled field; `undefined` is empty. Passing the prop at all makes it controlled. */
  value?: number;
  /** The starting number, for an uncontrolled field. */
  defaultValue?: number;
  /** Called with the new number, or `undefined` when the field is emptied. */
  onChange?: (value: number | undefined) => void;
  /** The smallest number. Arrows and the controls stop there, and leaving the field clamps to it. */
  min?: number;
  /** The largest number. Arrows and the controls stop there, and leaving the field clamps to it. */
  max?: number;
  /** How much the arrows and controls change it. Defaults to 1. Page Up and Page Down step ten times as much. */
  step?: number;
  /** Most digits after the decimal separator; 0 allows whole numbers only. Leaving the field rounds to it. */
  decimalScale?: number;
  /** Always shows `decimalScale` digits when the field isn't focused, e.g. `2.50`. */
  fixedDecimalScale?: boolean;
  /** Whether a minus can be typed. Defaults to whether `min` is below zero or unset. */
  allowNegative?: boolean;
  /** Group separators, such as `1,234`, while the field isn't focused. Defaults to `true`. */
  grouping?: boolean;
  /** A locale for this field only. Defaults to the provider's. */
  locale?: string;
  /** Hides the increase and decrease buttons. Arrow keys still step. Read once. */
  hideControls?: boolean;
  /** Accessible name of the increase button. Defaults to `'Increase'`. */
  incrementLabel?: string;
  /** Accessible name of the decrease button. Defaults to `'Decrease'`. */
  decrementLabel?: string;
}

export type NumberInputProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'>,
  NumberInputOwnProps
>;

// Holding a control: one step, then after a pause it repeats.
const REPEAT_DELAY = 400;
const REPEAT_INTERVAL = 60;

/**
 * A labelled number field: a text input with the `spinbutton` role, formatted for the locale. Arrow keys and the
 * controls step it; leaving the field clamps and rounds it.
 */
export function NumberInput(props: NumberInputProps) {
  const providerLocale = useLocale();
  const others = omit(
    controlProps(props),
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'step',
    'decimalScale',
    'fixedDecimalScale',
    'allowNegative',
    'grouping',
    'locale',
    'hideControls',
    'incrementLabel',
    'decrementLabel',
    'rightSection',
    'ref',
    'onInput',
    'onKeyDown',
    'onFocus',
    'onBlur',
  );

  const locale = () => props.locale ?? providerLocale();
  const separators = createMemo(() => numberSeparators(locale()), { name: 'NumberInput.separators' });

  // Controlled when the prop is passed at all, so `value={undefined}` is a controlled empty field.
  const controlled = untrack(() => 'value' in props);
  const [own, setOwn] = createSignal<number | undefined>(
    untrack(() => props.defaultValue),
    { name: 'NumberInput.value' },
  );
  const value = () => (controlled ? props.value : own());

  const [focused, setFocused] = createSignal(false, { name: 'NumberInput.focused' });
  // What the user typed, while focused. Shown as long as it still means the current value.
  const [draft, setDraft] = createSignal('', { name: 'NumberInput.draft' });

  const editText = (number: number | undefined) =>
    number === undefined ? '' : formatNumber(number, locale(), { grouping: false, decimalScale: props.decimalScale });
  const displayText = (number: number | undefined) =>
    number === undefined
      ? ''
      : formatNumber(number, locale(), {
          grouping: props.grouping ?? true,
          decimalScale: props.decimalScale,
          fixedDecimalScale: props.fixedDecimalScale,
        });

  const text = createMemo(
    () => {
      const current = value();
      if (!focused()) return displayText(current);
      return parseNumber(draft(), separators()) === current ? draft() : editText(current);
    },
    { name: 'NumberInput.text' },
  );

  const allowNegative = () => props.allowNegative ?? (props.min === undefined || props.min < 0);
  const clamp = (number: number) => Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, number));
  const round = (number: number) => (props.decimalScale === undefined ? number : roundTo(number, props.decimalScale));

  const commit = (next: number | undefined) => {
    if (next === value()) return;
    if (!controlled) setOwn(next);
    props.onChange?.(next);
    // So the next step in the same tick, e.g. two quick clicks, starts from this value.
    flush();
  };

  const stepBy = (direction: 1 | -1, multiplier = 1) => {
    if (props.disabled || props.readOnly) return;
    const current = value();
    const step = props.step ?? 1;
    if (current === undefined) {
      commit(round(clamp(0)));
      return;
    }
    const places = Math.max(decimalPlaces(current), decimalPlaces(step));
    commit(round(clamp(roundTo(current + direction * step * multiplier, places))));
  };

  const atMin = () => props.min !== undefined && value() !== undefined && value()! <= props.min;
  const atMax = () => props.max !== undefined && value() !== undefined && value()! >= props.max;

  const onInput = (event: InputEvent) => {
    const el = event.currentTarget as HTMLInputElement;
    const caret = el.selectionStart ?? el.value.length;
    const { text: clean, removedBeforeCaret } = sanitizeNumberText(
      el.value,
      separators(),
      { allowNegative: allowNegative(), decimalScale: props.decimalScale },
      caret,
    );
    if (clean !== el.value) {
      el.value = clean;
      el.setSelectionRange(caret - removedBeforeCaret, caret - removedBeforeCaret);
    }
    setDraft(clean);
    commit(parseNumber(clean, separators()));
    callHandler(props.onInput, event);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const keys: Record<string, [1 | -1, number]> = {
      ArrowUp: [1, 1],
      ArrowDown: [-1, 1],
      PageUp: [1, 10],
      PageDown: [-1, 10],
    };
    const move = keys[event.key];
    if (!move) return;
    event.preventDefault();
    stepBy(...move);
  };

  const onFocus = (event: FocusEvent) => {
    setDraft(editText(value()));
    setFocused(true);
    callHandler(props.onFocus, event);
  };

  const onBlur = (event: FocusEvent) => {
    const current = value();
    if (current !== undefined) commit(round(clamp(current)));
    setFocused(false);
    callHandler(props.onBlur, event);
  };

  // Holding a control steps once, then repeats until released.
  let repeatTimer: ReturnType<typeof setTimeout> | undefined;
  const stopRepeat = () => clearTimeout(repeatTimer);
  onCleanup(stopRepeat);
  const startRepeat = (event: PointerEvent, direction: 1 | -1) => {
    if (event.button !== 0) return;
    // Keeps the focus where it is: in the field, or wherever it was.
    event.preventDefault();
    stopRepeat();
    stepBy(direction);
    const repeat = () => {
      stepBy(direction);
      repeatTimer = setTimeout(repeat, REPEAT_INTERVAL);
    };
    repeatTimer = setTimeout(repeat, REPEAT_DELAY);
  };

  const control = (direction: 1 | -1) => (
    <button
      type="button"
      tabindex={-1}
      data-slot={direction === 1 ? 'number-input-increment' : 'number-input-decrement'}
      class={style.control}
      aria-label={direction === 1 ? (props.incrementLabel ?? 'Increase') : (props.decrementLabel ?? 'Decrease')}
      disabled={props.disabled || props.readOnly || (direction === 1 ? atMax() : atMin())}
      onPointerDown={(event) => startRepeat(event, direction)}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
      // A click without a pointer, e.g. from a screen reader, steps once.
      onClick={(event) => {
        if (event.detail === 0) stepBy(direction);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d={direction === 1 ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
      </svg>
    </button>
  );

  // Read once: the right section is either the controls (after any section of yours) or your section alone.
  const withControls = untrack(() => !props.hideControls);

  return (
    <FieldWrapper field={props} rootClass={`slp-number-input ${style.numberInput}`}>
      <Input
        {...(others as Record<string, unknown>)}
        // A ref is read once.
        ref={untrack(() => props.ref)}
        type="text"
        role="spinbutton"
        inputmode={allowNegative() ? 'text' : props.decimalScale === 0 ? 'numeric' : 'decimal'}
        autocomplete="off"
        value={text()}
        aria-valuenow={value()}
        aria-valuemin={props.min}
        aria-valuemax={props.max}
        aria-valuetext={value() === undefined ? undefined : displayText(value())}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        rightSection={
          withControls ? (
            <>
              {props.rightSection}
              <div data-slot="number-input-controls" class={style.controls}>
                {control(1)}
                {control(-1)}
              </div>
            </>
          ) : (
            props.rightSection
          )
        }
      />
    </FieldWrapper>
  );
}
