import { createMemo, createProjection, createSignal, flush, For, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './time-grid.module.css';
import { formatTime, getHourCycle, parseTime, timeToSeconds } from '../time';
import { useLocale } from '../../components/provider';
import { callHandler, type ElementProps } from '../../utils';
import { joinClass } from '../../style-props';
import type { SlopColor, SlopSize } from '../../core';

export interface TimeGridOwnProps {
  /** The times to choose from, `HH:mm` or `HH:mm:ss`; `getTimeRange` makes a list. */
  data: readonly string[];
  /** The chosen time, for a controlled grid; `null` for none. */
  value?: string | null;
  /** The time chosen at first, for an uncontrolled one. Read once. Defaults to `null`. */
  defaultValue?: string | null;
  /** Called with the time when one is chosen, or `null` when it's cleared. */
  onChange?: (value: string | null) => void;
  /** Lets a click on the chosen time clear it. */
  allowDeselect?: boolean;
  /** 12 hours with a day period, or 24. Defaults to the locale's. */
  format?: '12h' | '24h';
  /** Shows the seconds. */
  withSeconds?: boolean;
  /** Times before this one can't be chosen. */
  minTime?: string;
  /** Times after this one can't be chosen. */
  maxTime?: string;
  /** Times that can't be chosen: a list, or a test. */
  disableTime?: readonly string[] | ((time: string) => boolean);
  /** Times to a row. Defaults to 3. */
  columns?: number;
  /** Disables every time. */
  disabled?: boolean;
  /** A locale for this grid only. Defaults to the provider's. */
  locale?: string;
  /** The color role of the chosen time. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
}

export type TimeGridProps = ElementProps<Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'>, TimeGridOwnProps>;

/**
 * A grid of times to choose one from, such as free slots, written by the locale. A group with one tab stop: the arrow
 * keys move between times, and Enter or Space (or a click) chooses one. Needs a `<SlopkitUi>` above it.
 */
export function TimeGrid(props: TimeGridProps) {
  const others = omit(
    props,
    'class',
    'style',
    'data',
    'value',
    'defaultValue',
    'onChange',
    'allowDeselect',
    'format',
    'withSeconds',
    'minTime',
    'maxTime',
    'disableTime',
    'columns',
    'disabled',
    'locale',
    'color',
    'size',
    'onKeyDown',
    'ref',
  );
  const providerLocale = useLocale();
  const locale = () => props.locale ?? providerLocale();
  const format = createMemo(() => props.format ?? getHourCycle(locale()), { name: 'TimeGrid.format' });
  const columns = () => Math.max(1, Math.floor(props.columns ?? 3));

  const [own, setOwn] = createSignal<string | null>(
    untrack(() => props.defaultValue ?? null),
    { name: 'TimeGrid.value' },
  );
  const value = () => (props.value === undefined ? own() : props.value);
  // Times are compared as times, so `09:30` and `09:30:00` are one.
  const same = (a: string | null, b: string | null) => {
    const [first, second] = [parseTime(a), parseTime(b)];
    return !!first && !!second && timeToSeconds(first) === timeToSeconds(second);
  };

  const isDisabled = (time: string) => {
    if (props.disabled) return true;
    const parsed = parseTime(time);
    if (!parsed) return true;
    const seconds = timeToSeconds(parsed);
    const min = parseTime(props.minTime);
    const max = parseTime(props.maxTime);
    if ((min && seconds < timeToSeconds(min)) || (max && seconds > timeToSeconds(max))) return true;
    const disable = props.disableTime;
    return typeof disable === 'function' ? disable(time) : !!disable?.some((other) => same(other, time));
  };

  const choose = (time: string) => {
    if (isDisabled(time)) return;
    const next = same(value(), time) ? (props.allowDeselect ? null : time) : time;
    if (next === value()) return;
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  // The time that takes Tab: the one last moved to, else the chosen one, else the first enabled one.
  const [moved, setMoved] = createSignal<number | undefined>(undefined, { name: 'TimeGrid.moved' });
  const tabStop = createMemo(
    () => {
      const times = props.data;
      const usable = (index: number | undefined) => index !== undefined && index < times.length && !isDisabled(times[index]);
      const last = moved();
      if (usable(last)) return last;
      const chosen = times.findIndex((time) => same(time, value()));
      if (usable(chosen)) return chosen;
      return times.findIndex((time) => !isDisabled(time));
    },
    { name: 'TimeGrid.tabStop' },
  );

  // Keyed by index, so a choice or a move re-runs only the times it changes.
  let previousStop: number | undefined;
  const tabbable = createProjection<Record<number, true>>(
    (draft) => {
      const next = tabStop();
      if (previousStop !== undefined) delete draft[previousStop];
      if (next !== undefined && next !== -1) draft[next] = true;
      previousStop = next;
    },
    {},
    { name: 'TimeGrid.tabbable' },
  );
  let previousChosen: number[] = [];
  const chosen = createProjection<Record<number, true>>(
    (draft) => {
      const next = props.data.flatMap((time, index) => (same(time, value()) ? [index] : []));
      for (const index of previousChosen) if (!next.includes(index)) delete draft[index];
      for (const index of next) draft[index] = true;
      previousChosen = next;
    },
    {},
    { name: 'TimeGrid.chosen' },
  );

  let root: HTMLDivElement | undefined;
  const focusAt = (index: number) => {
    setMoved(index);
    flush();
    root?.querySelectorAll<HTMLElement>('[data-slot="time-grid-control"]')[index]?.focus();
  };

  // The next enabled time from `from`, `by` at a time, or -1.
  const enabledFrom = (from: number, by: number) => {
    const times = props.data;
    for (let index = from + by; index >= 0 && index < times.length; index += by) if (!isDisabled(times[index])) return index;
    return -1;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const at = [...(root?.querySelectorAll('[data-slot="time-grid-control"]') ?? [])].indexOf(event.target as Element);
    if (at === -1) return;
    const by = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns(), ArrowDown: columns() }[event.key];
    let target = -1;
    if (by !== undefined) target = enabledFrom(at, by);
    else if (event.key === 'Home') target = enabledFrom(-1, 1);
    else if (event.key === 'End') target = enabledFrom(props.data.length, -1);
    else return;
    event.preventDefault();
    if (target !== -1) focusAt(target);
  };

  return (
    <div
      ref={[(element: HTMLDivElement) => (root = element), untrack(() => props.ref)]}
      role="group"
      data-size={props.size ?? 'md'}
      data-color={props.color ?? 'primary'}
      data-disabled={props.disabled ? '' : undefined}
      class={joinClass(['slp-time-grid', style.grid], props.class)}
      style={{ '--_time-grid-columns': String(columns()), ...props.style }}
      onKeyDown={onKeyDown}
      {...others}
    >
      <For each={props.data}>
        {(time, index) => {
          const parsed = parseTime(time);
          const selected = () => chosen[index()] === true;
          const disabled = () => isDisabled(time);
          return (
            <button
              type="button"
              data-slot="time-grid-control"
              data-time={time}
              data-selected={selected() ? '' : undefined}
              data-disabled={disabled() ? '' : undefined}
              aria-pressed={selected() ? 'true' : 'false'}
              disabled={disabled()}
              tabindex={tabbable[index()] === true ? 0 : -1}
              class={style.control}
              onClick={() => choose(time)}
              onFocus={() => setMoved(index())}
            >
              {parsed ? formatTime(parsed, locale(), format(), props.withSeconds) : time}
            </button>
          );
        }}
      </For>
    </div>
  );
}
