import { createMemo, createProjection, createSignal, flush, For, omit, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './mini-calendar.module.css';
import { useLocale } from '../../components/provider';
import { type ElementProps } from '../../utils';
import { joinClass } from '../../style-props';
import type { SlopColor, SlopSize } from '../../core';
import { addDays, compareDays, isDayInRange, startOfDay } from '../date';
import { formatDate } from '../format';

export interface MiniCalendarOwnProps {
  /** The chosen day, for a controlled mini calendar; `null` for none. */
  value?: Date | null;
  /** The day chosen first, for an uncontrolled one. Read once. */
  defaultValue?: Date | null;
  /** Called with the day the user chooses. */
  onChange?: (date: Date) => void;
  /** The first day shown, for a controlled strip. */
  date?: Date;
  /** The first day shown first, for an uncontrolled strip. Read once. Defaults to the value, else today. */
  defaultDate?: Date;
  /** Called with the first day shown when the strip moves. */
  onDateChange?: (date: Date) => void;
  /** How many days show. Defaults to 7. */
  numberOfDays?: number;
  /** The earliest day that can be chosen. */
  minDate?: Date;
  /** The latest day that can be chosen. */
  maxDate?: Date;
  /** Days that can't be chosen. */
  excludeDate?: (date: Date) => boolean;
  /** A locale for this mini calendar only. Defaults to the provider's. */
  locale?: string;
  /** The color role of the chosen day. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** The previous button's name. Defaults to `Previous days`. */
  previousLabel?: string;
  /** The next button's name. Defaults to `Next days`. */
  nextLabel?: string;
}

export type MiniCalendarProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, MiniCalendarOwnProps>;

// Also the day's `data-date`: `2026-10-15`.
const pad = (number: number) => String(number).padStart(2, '0');
const dayKey = (date: Date) =>
  `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const sameDay = (a: Date | null | undefined, b: Date | null | undefined) => (a && b ? compareDays(a, b) === 0 : a === b);

// Functions, so each button gets its own elements.
const chevron = (direction: 'previous' | 'next') => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d={direction === 'previous' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </svg>
);

interface MiniCalendarDayProps {
  date: Date;
  locale: string;
  /** Whether it takes Tab. */
  tabbable: boolean;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  onChoose: (date: Date) => void;
  /** Called with the day when it takes the focus. */
  onMove: (date: Date) => void;
  onKeyDown: (event: KeyboardEvent, date: Date) => void;
}

function MiniCalendarDay(props: MiniCalendarDayProps) {
  const key = () => dayKey(props.date);
  const disabled = createMemo(() => props.disabled, { name: 'MiniCalendar.disabled' });
  return (
    <button
      type="button"
      role="option"
      data-slot="mini-calendar-day"
      class={style.day}
      tabindex={props.tabbable ? 0 : -1}
      disabled={disabled()}
      aria-selected={props.selected ? 'true' : 'false'}
      aria-label={formatDate(props.date, props.locale, { dateStyle: 'full' })}
      aria-current={props.today ? 'date' : undefined}
      data-date={key()}
      data-selected={props.selected ? '' : undefined}
      data-today={props.today ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      onClick={() => props.onChoose(props.date)}
      onFocus={() => props.onMove(props.date)}
      onKeyDown={(event: KeyboardEvent) => props.onKeyDown(event, props.date)}
    >
      <span data-slot="mini-calendar-weekday" class={style.weekday} aria-hidden="true">
        {formatDate(props.date, props.locale, { weekday: 'short' })}
      </span>
      <span data-slot="mini-calendar-number" class={style.number} aria-hidden="true">
        {formatDate(props.date, props.locale, { day: 'numeric' })}
      </span>
    </button>
  );
}

/**
 * A strip of days to choose one from, between previous and next buttons that move it by its length. A listbox named
 * after the days it shows; the arrow keys move through the days, past either end, and Enter, Space or a click chooses.
 */
export function MiniCalendar(props: MiniCalendarProps) {
  const others = omit(
    props,
    'class',
    'value',
    'defaultValue',
    'onChange',
    'date',
    'defaultDate',
    'onDateChange',
    'numberOfDays',
    'minDate',
    'maxDate',
    'excludeDate',
    'locale',
    'color',
    'size',
    'previousLabel',
    'nextLabel',
  );
  const providerLocale = useLocale();
  const locale = () => props.locale ?? providerLocale();
  const count = () => Math.max(1, Math.floor(props.numberOfDays ?? 7));

  const [ownValue, setOwnValue] = createSignal<Date | null>(
    untrack(() => (props.defaultValue ? startOfDay(props.defaultValue) : null)),
    { name: 'MiniCalendar.value', equals: sameDay },
  );
  const value = () => (props.value !== undefined ? props.value : ownValue());

  const [ownDate, setOwnDate] = createSignal<Date>(
    untrack(() => startOfDay(props.defaultDate ?? props.value ?? props.defaultValue ?? new Date())),
    { name: 'MiniCalendar.date', equals: sameDay },
  );
  const start = () => startOfDay(props.date ?? ownDate());
  // oxlint-disable-next-line solid/reactivity -- Array.from calls the mapper synchronously, inside the memo
  const days = createMemo(() => Array.from({ length: count() }, (_, index) => addDays(start(), index)), {
    name: 'MiniCalendar.days',
  });
  const last = () => days().at(-1)!;

  // Today is the browser's: the server and the browser may be on different days, so it's marked once hydrated.
  const [today, setToday] = createSignal<Date | undefined>(undefined, { name: 'MiniCalendar.today' });
  onSettled(() => {
    setToday(startOfDay(new Date()));
  });

  const isDisabled = (date: Date) => !isDayInRange(date, props.minDate, props.maxDate) || !!props.excludeDate?.(date);

  // The day that takes Tab: the one the user moved to while it shows, else the chosen one, today, or the first
  // enabled day.
  const [moved, setMoved] = createSignal<Date | undefined>(undefined, { name: 'MiniCalendar.moved', equals: sameDay });
  const active = createMemo(
    () => {
      const enabled = days().filter((date) => !isDisabled(date));
      // Read one at a time, so a day moved to doesn't depend on the value or today.
      for (const candidate of [moved, value, today]) {
        const day = candidate();
        const match = day && enabled.find((date) => sameDay(date, day));
        if (match) return dayKey(match);
      }
      return enabled[0] ? dayKey(enabled[0]) : undefined;
    },
    { name: 'MiniCalendar.active' },
  );

  // Keyed by day, so a move or a choice re-runs only the days it leaves and enters.
  const keyed = (source: () => string | undefined, name: string) => {
    let previous: string | undefined;
    return createProjection<Record<string, true>>(
      (draft) => {
        const next = source();
        if (previous !== undefined) delete draft[previous];
        if (next !== undefined) draft[next] = true;
        previous = next;
      },
      {},
      { name },
    );
  };
  // keyed reads each source inside its projection, a tracked scope.
  // oxlint-disable-next-line solid/reactivity -- read inside keyed's projection
  const tabbable = keyed(active, 'MiniCalendar.tabbable');
  // oxlint-disable-next-line solid/reactivity -- read inside keyed's projection
  const selected = keyed(() => {
    const chosen = value();
    return chosen ? dayKey(chosen) : undefined;
  }, 'MiniCalendar.selected');
  // oxlint-disable-next-line solid/reactivity -- read inside keyed's projection
  const todayKey = keyed(() => {
    const day = today();
    return day ? dayKey(day) : undefined;
  }, 'MiniCalendar.todayKey');

  const showFrom = (first: Date) => {
    if (sameDay(first, start())) return;
    if (props.date === undefined) setOwnDate(first);
    props.onDateChange?.(first);
  };

  let list: HTMLDivElement | undefined;
  const focusActive = () => list?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();

  // Moves to a day, moving the strip by its length until the day shows, and focuses it.
  const moveTo = (date: Date) => {
    setMoved(date);
    let first = start();
    while (compareDays(date, first) < 0) first = addDays(first, -count());
    while (compareDays(date, addDays(first, count() - 1)) > 0) first = addDays(first, count());
    showFrom(first);
    flush();
    focusActive();
  };

  // The nearest enabled day from `from`, `step` days at a time, within minDate and maxDate.
  const findEnabled = (from: Date, step: number): Date | undefined => {
    let date = from;
    for (let tries = 0; tries < 1000 && isDayInRange(date, props.minDate, props.maxDate); tries++) {
      if (!props.excludeDate?.(date)) return date;
      date = addDays(date, step);
    }
    return undefined;
  };

  const onKeyDown = (event: KeyboardEvent, date: Date) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let target: Date | undefined;
    switch (event.key) {
      case 'ArrowLeft':
        target = findEnabled(addDays(date, -1), -1);
        break;
      case 'ArrowRight':
        target = findEnabled(addDays(date, 1), 1);
        break;
      case 'PageUp':
        target = findEnabled(addDays(date, -count()), -1);
        break;
      case 'PageDown':
        target = findEnabled(addDays(date, count()), 1);
        break;
      case 'Home':
        target = days().find((day) => !isDisabled(day));
        break;
      case 'End':
        // oxlint-disable-next-line solid/reactivity -- findLast calls the callback synchronously, in this handler
        target = days().findLast((day) => !isDisabled(day));
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target && !sameDay(target, date)) moveTo(target);
  };

  const choose = (date: Date) => {
    if (isDisabled(date)) return;
    setMoved(date);
    if (!sameDay(date, value())) {
      if (props.value === undefined) setOwnValue(date);
      props.onChange?.(date);
    }
    flush();
  };

  const previousDisabled = () => !!props.minDate && compareDays(addDays(start(), -1), props.minDate) < 0;
  const nextDisabled = () => !!props.maxDate && compareDays(addDays(last(), 1), props.maxDate) > 0;
  const page = (direction: 1 | -1) => {
    showFrom(addDays(start(), direction * count()));
    flush();
  };

  const rangeLabel = () => {
    const format = new Intl.DateTimeFormat(locale(), { month: 'long', day: 'numeric', year: 'numeric' });
    return count() === 1 ? format.format(start()) : format.formatRange(start(), last());
  };

  return (
    <div
      data-size={props.size ?? 'md'}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-mini-calendar', style.miniCalendar], props.class)}
      {...others}
    >
      <button
        type="button"
        data-slot="mini-calendar-previous"
        class={style.control}
        aria-label={props.previousLabel ?? 'Previous days'}
        aria-disabled={previousDisabled() ? 'true' : undefined}
        data-disabled={previousDisabled() ? '' : undefined}
        onClick={() => !previousDisabled() && page(-1)}
      >
        {chevron('previous')}
      </button>
      {/* The days shown, said when previous or next moves the strip. */}
      <span data-slot="mini-calendar-range" class={style.range} aria-live="polite">
        {rangeLabel()}
      </span>
      <div
        ref={(element: HTMLDivElement) => (list = element)}
        role="listbox"
        aria-orientation="horizontal"
        aria-label={rangeLabel()}
        data-slot="mini-calendar-days"
        class={style.days}
      >
        <For each={days()} keyed={false}>
          {(date) => (
            <MiniCalendarDay
              date={date()}
              locale={locale()}
              tabbable={tabbable[dayKey(date())] === true}
              selected={selected[dayKey(date())] === true}
              today={todayKey[dayKey(date())] === true}
              disabled={isDisabled(date())}
              onChoose={choose}
              onMove={setMoved}
              onKeyDown={onKeyDown}
            />
          )}
        </For>
      </div>
      <button
        type="button"
        data-slot="mini-calendar-next"
        class={style.control}
        aria-label={props.nextLabel ?? 'Next days'}
        aria-disabled={nextDisabled() ? 'true' : undefined}
        data-disabled={nextDisabled() ? '' : undefined}
        onClick={() => !nextDisabled() && page(1)}
      >
        {chevron('next')}
      </button>
    </div>
  );
}
