import { createMemo, createSignal, createUniqueId, flush, For, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './time-picker.module.css';
import { getDayPeriodLabels, getHourCycle, parseTime, timeToSeconds, timeToString } from '../time';
import { useLocale } from '../../components/provider';
import { controlProps, FieldDropdown, FieldWrapper, type FieldWrapperProps } from '../../components/inputs/field';
import { Input, type InputOwnProps } from '../../components/inputs/input';
import { useInputWrapper } from '../../components/inputs/input-wrapper';
import { CloseButton } from '../../components/button/close-button';
import { createDismissal, createFloating, createPresence, type FloatingPlacement } from '../../components/primitives';
import { transitionAttributes, type TransitionName } from '../../components/utilities/transition/transition-attributes';
import { callHandler, mergeRefs, type ElementProps } from '../../utils';

export interface TimePickerOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly'> {
  /** The time, for a controlled field: `HH:mm`, or `HH:mm:ss` with seconds, in 24 hours; `''` for none. */
  value?: string;
  /** The time at first, for an uncontrolled one. Read once. Defaults to `''`. */
  defaultValue?: string;
  /** Called with the time when it changes: complete, or `''` when a part is missing. */
  onChange?: (value: string) => void;
  /** 12 hours with a day period, or 24. Defaults to the locale's. */
  format?: '12h' | '24h';
  /** Adds the seconds. */
  withSeconds?: boolean;
  /** The earliest time, `HH:mm` or `HH:mm:ss`; an earlier one becomes it when the field is left. */
  minTime?: string;
  /** The latest time; a later one becomes it when the field is left. */
  maxTime?: string;
  /** How far the arrow keys and the dropdown step the hours. Defaults to 1. */
  hoursStep?: number;
  /** How far they step the minutes. Defaults to 1. */
  minutesStep?: number;
  /** How far they step the seconds. Defaults to 1. */
  secondsStep?: number;
  /** Adds a dropdown with a column of options per part of the time, opened by a click on the field. */
  withDropdown?: boolean;
  /** Adds a button that clears the time. */
  clearable?: boolean;
  /** The clear button's accessible name. Defaults to `Clear`. */
  clearLabel?: string;
  /** Submits the time with a form, through a hidden input. */
  name?: string;
  /** A locale for this field only. Defaults to the provider's. */
  locale?: string;
  /** The names of the morning and the afternoon. Defaults to the locale's: `AM`, `PM`. */
  dayPeriodLabels?: [string, string];
  /** The segments' accessible names. Defaults to `Hours`, `Minutes`, `Seconds` and `AM/PM`. */
  segmentLabels?: { hours?: string; minutes?: string; seconds?: string; dayPeriod?: string };
  /** Where the dropdown goes against the field. Defaults to `bottom-start`. */
  position?: FloatingPlacement;
  /** Gap between the field and the dropdown, in px. Defaults to 4. */
  offset?: number;
  /** The dropdown's animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in ms. Defaults to 150. */
  transitionDuration?: number;
}

export type TimePickerProps = ElementProps<Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'>, TimePickerOwnProps>;

type Segment = 'hours' | 'minutes' | 'seconds' | 'dayPeriod';

/** The parts typed so far, in 24 hours; `pm` keeps the day period while the hours are missing. */
interface Draft {
  hours: number | null;
  minutes: number | null;
  seconds: number | null;
  pm: boolean | null;
}

const EMPTY: Draft = { hours: null, minutes: null, seconds: null, pm: null };
const pad = (number: number) => String(number).padStart(2, '0');
const wrap = (number: number, size: number) => ((number % size) + size) % size;

function TimePickerField(props: TimePickerProps) {
  const wrapper = useInputWrapper();
  const providerLocale = useLocale();
  const others = omit(
    controlProps(props) as TimePickerProps,
    'value',
    'defaultValue',
    'onChange',
    'format',
    'withSeconds',
    'minTime',
    'maxTime',
    'hoursStep',
    'minutesStep',
    'secondsStep',
    'withDropdown',
    'clearable',
    'clearLabel',
    'name',
    'locale',
    'dayPeriodLabels',
    'segmentLabels',
    'position',
    'offset',
    'transition',
    'transitionDuration',
    'variant',
    'leftSection',
    'rightSection',
    'disabled',
    'readOnly',
  );
  const locale = () => props.locale ?? providerLocale();
  const twelve = createMemo(() => (props.format ?? getHourCycle(locale())) === '12h', { name: 'TimePicker.twelve' });
  const periods = createMemo(() => props.dayPeriodLabels ?? getDayPeriodLabels(locale()), { name: 'TimePicker.periods' });
  const segments = (): Segment[] => [
    'hours',
    'minutes',
    ...(props.withSeconds ? (['seconds'] as const) : []),
    ...(twelve() ? (['dayPeriod'] as const) : []),
  ];
  const label = (segment: Segment) =>
    props.segmentLabels?.[segment] ?? { hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', dayPeriod: 'AM/PM' }[segment];

  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? ''),
    { name: 'TimePicker.value' },
  );
  const value = () => props.value ?? own();
  // The parts while they don't make a whole time yet; the value's otherwise.
  const [draft, setDraft] = createSignal<Draft | undefined>(undefined, { name: 'TimePicker.draft' });
  const parts = (): Draft => {
    const typed = draft();
    if (typed) return typed;
    const time = parseTime(value());
    return time ? { ...time, pm: null } : EMPTY;
  };
  const isPm = (current: Draft) => (current.hours === null ? !!current.pm : current.hours >= 12);

  const commit = (next: string) => {
    if (next === value()) return;
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
  };

  // Sets parts: a whole time is the value; otherwise the parts wait, and the value is ''.
  const update = (next: Draft) => {
    const whole = next.hours !== null && next.minutes !== null && (!props.withSeconds || next.seconds !== null);
    if (whole) {
      setDraft(undefined);
      commit(timeToString({ hours: next.hours!, minutes: next.minutes!, seconds: next.seconds ?? 0 }, props.withSeconds));
    } else {
      setDraft(next);
      commit('');
    }
    flush();
  };

  // Hours in the field: 1–12 in 12 hours.
  const shownHours = (hours: number) => (twelve() ? hours % 12 || 12 : hours);
  const setHours = (current: Draft, hours: number): Draft => ({
    ...current,
    hours: twelve() ? (hours % 12) + (isPm(current) ? 12 : 0) : hours,
  });
  const setPeriod = (current: Draft, pm: boolean): Draft =>
    current.hours === null ? { ...current, pm } : { ...current, hours: (current.hours % 12) + (pm ? 12 : 0) };

  const text = (segment: Segment, current: Draft) => {
    if (segment === 'dayPeriod') return current.hours === null && current.pm === null ? '--' : periods()[isPm(current) ? 1 : 0];
    const part = current[segment];
    if (part === null) return '--';
    return pad(segment === 'hours' ? shownHours(part) : part);
  };

  const locked = () => !!props.disabled || !!props.readOnly;
  const inputs: Partial<Record<Segment, HTMLInputElement>> = {};
  const focusSegment = (segment: Segment | undefined) => segment && inputs[segment]?.focus();
  const neighbor = (segment: Segment, by: number) => segments()[segments().indexOf(segment) + by];

  // Arrows: a step up or down, around the clock.
  const stepOf = (segment: Segment) =>
    Math.max(
      1,
      Math.floor((segment === 'hours' ? props.hoursStep : segment === 'minutes' ? props.minutesStep : props.secondsStep) ?? 1),
    );
  const step = (segment: Segment, direction: 1 | -1) => {
    const current = parts();
    if (segment === 'dayPeriod') return update(setPeriod(current, !isPm(current)));
    const size = segment === 'hours' ? 24 : 60;
    const by = stepOf(segment);
    const part = current[segment];
    const next = part === null ? (direction > 0 ? 0 : size - by) : wrap(part + direction * by, size);
    update({ ...current, [segment]: next });
  };

  // A digit typed while the segment waits for its second one.
  let pending: { segment: Segment; digit: number } | undefined;
  const typeDigit = (segment: Segment, digit: number) => {
    const max = segment === 'hours' ? (twelve() ? 12 : 23) : 59;
    const min = segment === 'hours' && twelve() ? 1 : 0;
    const set = (number: number) => (segment === 'hours' ? setHours(parts(), number) : { ...parts(), [segment]: number });
    if (pending?.segment === segment) {
      const number = pending.digit * 10 + digit;
      pending = undefined;
      if (number >= min && number <= max) {
        update(set(number));
        return focusSegment(neighbor(segment, 1));
      }
    }
    // A digit that can't start a two-digit number is the whole part.
    if (digit * 10 > max) {
      pending = undefined;
      update(set(digit));
      return focusSegment(neighbor(segment, 1));
    }
    pending = { segment, digit };
    if (digit >= min) update(set(digit));
  };

  const onBeforeInput = (segment: Segment, event: InputEvent) => {
    event.preventDefault();
    if (locked()) return;
    if (event.inputType.startsWith('delete')) {
      pending = undefined;
      const current = parts();
      if (segment === 'dayPeriod') update({ ...current, pm: null, hours: current.hours === null ? null : current.hours });
      else if (current[segment] === null) focusSegment(neighbor(segment, -1));
      else
        update({
          ...current,
          [segment]: null,
          pm: segment === 'hours' && current.hours !== null ? current.hours >= 12 : current.pm,
        });
      return;
    }
    for (const char of event.data ?? '') {
      const lower = char.toLowerCase();
      if (segment === 'dayPeriod') {
        const [am, pm] = periods().map((name) => name.toLowerCase());
        if (lower === am[0] || lower === 'a') update(setPeriod(parts(), false));
        else if (lower === pm[0] || lower === 'p') update(setPeriod(parts(), true));
      } else if (/\d/.test(char)) typeDigit(segment, Number(char));
    }
  };

  const onKeyDown = (segment: Segment, event: KeyboardEvent) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusSegment(neighbor(segment, event.key === 'ArrowLeft' ? -1 : 1));
    } else if (locked()) return;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      pending = undefined;
      step(segment, event.key === 'ArrowUp' ? 1 : -1);
    } else if ((event.key === 'Home' || event.key === 'End') && segment !== 'dayPeriod') {
      event.preventDefault();
      pending = undefined;
      const current = parts();
      const last = segment === 'hours' ? (twelve() ? 11 : 23) : 59;
      const number = event.key === 'Home' ? 0 : last - (last % stepOf(segment));
      update(segment === 'hours' ? setHours(current, number) : { ...current, [segment]: number });
    }
  };

  // Leaving the field brings a time outside minTime and maxTime to the nearest of them.
  const clamp = () => {
    const time = parseTime(value());
    if (!time) return;
    const min = parseTime(props.minTime);
    const max = parseTime(props.maxTime);
    const seconds = timeToSeconds(time);
    if (min && seconds < timeToSeconds(min)) commit(timeToString(min, props.withSeconds));
    else if (max && seconds > timeToSeconds(max)) commit(timeToString(max, props.withSeconds));
  };

  const [opened, setOpened] = createSignal(false, { name: 'TimePicker.opened' });
  let control: HTMLElement | undefined;
  let box: HTMLElement | undefined;
  let dropdown: HTMLDivElement | undefined;
  const id = `slp-time-picker-${createUniqueId()}`;

  const presence = createPresence({ present: opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => box,
    floating: () => dropdown,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom-start',
    offset: () => props.offset ?? 4,
  });
  const close = () => {
    setOpened(false);
    flush();
  };
  createDismissal('TimePicker', {
    open: opened,
    elements: () => [box, dropdown],
    onDismiss: close,
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

  // Focus that leaves both the field and the dropdown ends the edit.
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (box?.contains(next) || dropdown?.contains(next))) return;
    pending = undefined;
    clamp();
    setOpened(false);
  };

  const showClear = () => !!props.clearable && (!!value() || !!draft()) && !locked();
  const clear = () => {
    pending = undefined;
    setDraft(undefined);
    commit('');
    focusSegment('hours');
  };

  // The options of a dropdown column, as numbers in 24 hours (or 0 and 1 for the day period).
  const options = (segment: Segment): number[] => {
    if (segment === 'dayPeriod') return [0, 1];
    const by = stepOf(segment);
    // In 12 hours, 0 stands for 12, and the day period sets the rest.
    const size = segment === 'hours' ? (twelve() ? 12 : 24) : 60;
    return Array.from({ length: Math.ceil(size / by) }, (_, index) => index * by);
  };
  const optionText = (segment: Segment, option: number) =>
    segment === 'dayPeriod' ? periods()[option] : pad(segment === 'hours' ? shownHours(option) : option);
  const isChosen = (segment: Segment, option: number) => {
    const current = parts();
    if (segment === 'dayPeriod') return (current.hours !== null || current.pm !== null) && isPm(current) === (option === 1);
    const part = current[segment];
    return part !== null && (segment === 'hours' && twelve() ? part % 12 === option : part === option);
  };
  const choose = (segment: Segment, option: number) => {
    pending = undefined;
    const current = parts();
    if (segment === 'dayPeriod') update(setPeriod(current, option === 1));
    else if (segment === 'hours') update(setHours(current, option));
    else update({ ...current, [segment]: option });
  };

  const longestPeriod = () => periods().reduce((longest, name) => (name.length > longest.length ? name : longest), '');

  return (
    <>
      <Input
        {...(others as Record<string, unknown>)}
        // A ref is read once.
        ref={mergeRefs((element: HTMLElement) => (control = element), untrack(() => props.ref) as (element: HTMLElement) => void)}
        as="div"
        // Its own id: the label's `for` goes to the hours.
        id={`${id}-group`}
        role="group"
        aria-labelledby={wrapper?.labelId()}
        // A group can't be required or read-only: the segments say so.
        required={false}
        variant={props.variant}
        leftSection={props.leftSection}
        rightSection={
          <Show when={showClear()} fallback={props.rightSection}>
            <CloseButton size="xs" label={props.clearLabel ?? 'Clear'} onClick={clear} data-slot="time-picker-clear" />
          </Show>
        }
        disabled={props.disabled}
        readOnly={props.readOnly}
        data-empty={value() || draft() ? undefined : ''}
        // A press on the field but off a segment goes to the first empty one, or the hours.
        onMouseDown={(event: MouseEvent) => {
          callHandler(props.onMouseDown, event);
          if (event.defaultPrevented || (event.target as Element).closest('input') || props.disabled) return;
          event.preventDefault();
          const current = parts();
          focusSegment(segments().find((segment) => segment !== 'dayPeriod' && current[segment] === null) ?? 'hours');
          if (props.withDropdown && !locked()) setOpened(true);
        }}
        onFocusOut={(event: FocusEvent) => {
          callHandler(props.onFocusOut, event);
          onFocusOut(event);
        }}
      >
        {/* Keyed: each segment is a plain name, read anywhere, refs included. */}
        <For each={segments()}>
          {(segment, index) => {
            const input = () => (
              <input
                ref={(element: HTMLInputElement) => (inputs[segment] = element)}
                type="text"
                inputmode={segment === 'dayPeriod' ? 'text' : 'numeric'}
                autocomplete="off"
                spellcheck="false"
                role="spinbutton"
                aria-label={label(segment)}
                aria-valuemin={segment === 'dayPeriod' ? undefined : segment === 'hours' && twelve() ? 1 : 0}
                aria-valuemax={segment === 'dayPeriod' ? undefined : segment === 'hours' ? (twelve() ? 12 : 23) : 59}
                aria-valuenow={(() => {
                  const current = parts();
                  if (segment === 'dayPeriod') return undefined;
                  const part = current[segment as Exclude<Segment, 'dayPeriod'>];
                  return part === null ? undefined : segment === 'hours' ? shownHours(part) : part;
                })()}
                aria-valuetext={text(segment, parts()) === '--' ? 'Empty' : text(segment, parts())}
                aria-required={index() === 0 && wrapper?.required() ? 'true' : undefined}
                aria-readonly={props.readOnly ? 'true' : undefined}
                disabled={props.disabled}
                id={index() === 0 ? wrapper?.id : undefined}
                data-slot={`time-picker-${segment === 'dayPeriod' ? 'day-period' : segment}`}
                data-empty={text(segment, parts()) === '--' ? '' : undefined}
                class={segment === 'dayPeriod' ? `${style.segment} ${style.period}` : style.segment}
                value={text(segment, parts())}
                onFocus={() => (pending = undefined)}
                onBeforeInput={(event: InputEvent) => onBeforeInput(segment, event)}
                onKeyDown={(event: KeyboardEvent) => onKeyDown(segment, event)}
                onClick={() => {
                  if (props.withDropdown && !locked()) setOpened(true);
                }}
              />
            );
            return (
              <>
                <Show when={index() > 0 && segment !== 'dayPeriod'}>
                  <span aria-hidden="true" class={style.separator}>
                    :
                  </span>
                </Show>
                {segment === 'dayPeriod' ? (
                  <span class={style.periodBox}>
                    <span aria-hidden="true" class={style.periodSizer}>
                      {longestPeriod()}
                    </span>
                    {input()}
                  </span>
                ) : (
                  input()
                )}
              </>
            );
          }}
        </For>
      </Input>
      <Show when={presence.mounted()}>
        <FieldDropdown
          ref={(element) => (dropdown = element)}
          id={`${id}-dropdown`}
          slug="time-picker"
          class={style.dropdown}
          aria-label={props['aria-label']}
          floating={floating}
          animation={animation}
          onFocusOut={onFocusOut}
          onShow={(element) => {
            // Each column shows its chosen option.
            for (const column of element.querySelectorAll<HTMLElement>('[role="listbox"]')) {
              const chosen = column.querySelector<HTMLElement>('[aria-selected="true"]');
              if (chosen) column.scrollTop = chosen.offsetTop - column.clientHeight / 2 + chosen.offsetHeight / 2;
            }
          }}
        >
          <div class={style.columns}>
            <For each={segments()} keyed={false}>
              {(segment) => (
                <div role="listbox" aria-label={label(segment())} data-slot="time-picker-column" class={style.column}>
                  <For each={options(segment())} keyed={false}>
                    {(option) => (
                      <button
                        type="button"
                        role="option"
                        tabindex={-1}
                        aria-selected={isChosen(segment(), option()) ? 'true' : 'false'}
                        data-slot="time-picker-option"
                        class={style.option}
                        // The focus stays in the field.
                        onMouseDown={(event: MouseEvent) => event.preventDefault()}
                        onClick={() => choose(segment(), option())}
                      >
                        {optionText(segment(), option())}
                      </button>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </FieldDropdown>
      </Show>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={value()} />
      </Show>
    </>
  );
}

/**
 * A labelled field for a time of day, written by the locale in 12 or 24 hours: a segment per part, typed or stepped
 * with the arrow keys, and with `withDropdown` a dropdown of options to click. The value is `HH:mm` (`HH:mm:ss`).
 * Needs a `<SlopkitUi>` above it.
 */
export function TimePicker(props: TimePickerProps) {
  return (
    <FieldWrapper field={props} rootClass={`slp-time-picker ${style.field}`}>
      <TimePickerField {...props} />
    </FieldWrapper>
  );
}
