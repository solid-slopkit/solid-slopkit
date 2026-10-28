import {
  createContext,
  createMemo,
  createProjection,
  createSignal,
  flush,
  For,
  omit,
  onSettled,
  Show,
  untrack,
  useContext,
} from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './calendar.module.css';
import { useLocale } from '../../components/provider';
import { createDateGridNavigation, type DateGridLevel } from '../../components/primitives/create-date-grid-navigation';
import { type ElementProps } from '../../utils';
import { joinClass } from '../../style-props';
import type { SlopColor, SlopSize } from '../../core';
import {
  addMonths,
  addYears,
  compareDays,
  createDay,
  endOfMonth,
  getMonthGrid,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfYear,
  type DayOfWeek,
} from '../date';
import { getWeekInfo } from '../week-info';
import { formatDate, getWeekdayNames } from '../format';

/** What the calendar shows: the days of a month, the months of a year, or the years of a decade. */
export type CalendarLevel = 'month' | 'year' | 'decade';

const LEVELS: CalendarLevel[] = ['month', 'year', 'decade'];

/** How a day, month or year looks and behaves, from `getDayProps`, `getMonthProps` or `getYearProps`. */
export interface CalendarCellState {
  /** Marked as selected, filled with the color, with `aria-selected`. */
  selected?: boolean;
  /** Inside a selected range, tinted with the color. */
  inRange?: boolean;
  /** The first cell of a selected range. */
  firstInRange?: boolean;
  /** The last cell of a selected range. */
  lastInRange?: boolean;
  /** Can't be chosen or reached with the keyboard. */
  disabled?: boolean;
}

export interface CalendarOwnProps {
  /** A date in the month (year, decade) shown, for a controlled calendar. With several columns, the first one's. */
  date?: Date;
  /** The date shown first, for an uncontrolled one. Read once. Defaults to today. */
  defaultDate?: Date;
  /** Called with the first day of the month (year, decade) shown when it changes. */
  onDateChange?: (date: Date) => void;
  /** What it shows, for a controlled calendar. */
  level?: CalendarLevel;
  /** What it shows first, for an uncontrolled one. Read once. Defaults to `minLevel`. */
  defaultLevel?: CalendarLevel;
  /** Called with the level when the header or a month or year changes it. */
  onLevelChange?: (level: CalendarLevel) => void;
  /** The lowest level, reached by choosing a month or year. Defaults to `month`. */
  minLevel?: CalendarLevel;
  /** The highest level, reached through the header. Defaults to `decade`. */
  maxLevel?: CalendarLevel;
  /** How many months (years, decades) show side by side. Defaults to 1. */
  numberOfColumns?: number;
  /** The earliest date that can be chosen. */
  minDate?: Date;
  /** The latest date that can be chosen. */
  maxDate?: Date;
  /** Days that can't be chosen. */
  excludeDate?: (date: Date) => boolean;
  /** How a day looks and behaves. */
  getDayProps?: (date: Date) => CalendarCellState;
  /** How a month of the year level looks and behaves. */
  getMonthProps?: (date: Date) => CalendarCellState;
  /** How a year of the decade level looks and behaves. */
  getYearProps?: (date: Date) => CalendarCellState;
  /** Called when a day is clicked, or pressed with Enter or Space. */
  onDayClick?: (date: Date, event: MouseEvent) => void;
  /** Called when a month is clicked, before the calendar shows its days (above `minLevel`). */
  onMonthClick?: (date: Date, event: MouseEvent) => void;
  /** Called when a year is clicked, before the calendar shows its months (above `minLevel`). */
  onYearClick?: (date: Date, event: MouseEvent) => void;
  /** The content of a day. Defaults to its number. */
  renderDay?: (date: Date) => JSX.Element;
  /** The day weeks start on, 0 (Sunday) to 6. Defaults to the locale's. */
  firstDayOfWeek?: DayOfWeek;
  /** The days marked as weekend. Defaults to the locale's. */
  weekendDays?: DayOfWeek[];
  /** Always six weeks, so the height doesn't change between months. Defaults to `true`. */
  fixedWeeks?: boolean;
  /** Leaves the days of the neighboring months out. Always, with several columns. */
  hideOutsideDates?: boolean;
  /** Leaves out the row of weekday names. */
  hideWeekdays?: boolean;
  /** How weekday names are written. Defaults to `short`. */
  weekdayFormat?: 'narrow' | 'short';
  /** A locale for this calendar only. Defaults to the provider's. */
  locale?: string;
  /** The color role of selected days. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** The previous button's name. Defaults to `Previous month`, `Previous year` or `Previous decade`. */
  previousLabel?: (level: CalendarLevel) => string;
  /** The next button's name. Defaults to `Next month`, `Next year` or `Next decade`. */
  nextLabel?: (level: CalendarLevel) => string;
}

export type CalendarProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CalendarOwnProps>;

// The cells of each level, as the grid navigation names them.
const CELL_LEVEL: Record<CalendarLevel, DateGridLevel> = { month: 'day', year: 'month', decade: 'year' };

const startOfDecade = (date: Date) => createDay(date.getFullYear() - (((date.getFullYear() % 10) + 10) % 10), 0, 1);

// The first cell date of the period a level shows, and how to step between periods.
const START: Record<CalendarLevel, (date: Date) => Date> = {
  month: startOfMonth,
  year: startOfYear,
  decade: startOfDecade,
};
const STEP: Record<CalendarLevel, (date: Date, amount: number) => Date> = {
  month: addMonths,
  year: addYears,
  decade: (date, amount) => addYears(date, amount * 10),
};

// The last day of the period that starts on `start`.
const endOf = (level: CalendarLevel, start: Date) => addDaysBefore(STEP[level](start, 1));
const addDaysBefore = (date: Date) => createDay(date.getFullYear(), date.getMonth(), date.getDate() - 1);

// A cell's key in the keyboard and today projections: its day, month or year.
// Also the cell's `data-date`: `2026-10-15`, `2026-10` or `2026`.
const pad = (number: number) => String(number).padStart(2, '0');
const cellKey = (level: DateGridLevel, date: Date) => {
  const year = String(date.getFullYear()).padStart(4, '0');
  if (level === 'year') return year;
  const month = `${year}-${pad(date.getMonth() + 1)}`;
  return level === 'month' ? month : `${month}-${pad(date.getDate())}`;
};

const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, row) => items.slice(row * size, row * size + size));

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

/** What a calendar's grids and cells read from the calendar around them. */
interface CalendarGridContextValue {
  locale: () => string;
  firstDayOfWeek: () => DayOfWeek;
  weekendDays: () => DayOfWeek[];
  fixedWeeks: () => boolean;
  weekdayFormat: () => 'narrow' | 'short';
  hideWeekdays: () => boolean;
  /** Whether a month grid leaves out the days of the months around it. */
  hideOutside: () => boolean;
  /** What the cells of a decade or a year are. */
  cellLevel: () => DateGridLevel;
  /** The cells a period shows, in order. */
  cellsOf: (period: Date) => Date[];
  cellState: (cellLevel: DateGridLevel, date: Date) => CalendarCellState;
  /** Disabled by the limits or excludeDate. */
  isExcluded: (cellLevel: DateGridLevel, date: Date) => boolean;
  /** The cell that takes Tab, by key. */
  tabbable: Record<string, true>;
  /** Today's day, month and year, by key. */
  todayKeys: Record<string, true>;
  renderDay: () => CalendarOwnProps['renderDay'];
  onCellClick: (cellLevel: DateGridLevel, date: Date, event: MouseEvent) => void;
  onCellFocus: (date: Date) => void;
  onCellKeyDown: (date: Date, event: KeyboardEvent) => void;
}

const CalendarGridContext = createContext<CalendarGridContextValue | null>(null);

function useCalendarGrid() {
  const context = useContext(CalendarGridContext);
  if (!context) throw new Error('A calendar grid must be inside a Calendar.');
  return context;
}

function CalendarCell(props: { date: Date; outside?: boolean; cellLevel: DateGridLevel }) {
  const grid = useCalendarGrid();
  const key = () => cellKey(props.cellLevel, props.date);
  const state = createMemo(() => grid.cellState(props.cellLevel, props.date), { name: 'Calendar.cell' });
  // No memo of its own: the state memo already re-runs when getDayProps changes.
  const disabled = () => grid.isExcluded(props.cellLevel, props.date) || !!state().disabled;
  const isToday = () => grid.todayKeys[key()] === true;
  const slot = () => `calendar-${props.cellLevel === 'day' ? 'day' : props.cellLevel === 'month' ? 'month' : 'year'}`;
  const weekend = () => props.cellLevel === 'day' && grid.weekendDays().includes(props.date.getDay() as DayOfWeek);

  const label = () =>
    props.cellLevel === 'day'
      ? formatDate(props.date, grid.locale(), { dateStyle: 'full' })
      : props.cellLevel === 'month'
        ? formatDate(props.date, grid.locale(), { month: 'long', year: 'numeric' })
        : undefined;
  const text = () =>
    props.cellLevel === 'day'
      ? formatDate(props.date, grid.locale(), { day: 'numeric' })
      : props.cellLevel === 'month'
        ? formatDate(props.date, grid.locale(), { month: 'short' })
        : formatDate(props.date, grid.locale(), { year: 'numeric' });

  return (
    <td class={style.cell} aria-selected={state().selected ? 'true' : undefined}>
      <button
        type="button"
        data-slot={slot()}
        class={style.control}
        tabindex={!props.outside && grid.tabbable[key()] === true ? 0 : -1}
        disabled={disabled()}
        aria-label={label()}
        aria-current={isToday() ? 'date' : undefined}
        data-date={key()}
        data-outside={props.outside ? '' : undefined}
        data-weekend={weekend() ? '' : undefined}
        data-today={isToday() ? '' : undefined}
        data-selected={state().selected ? '' : undefined}
        data-in-range={state().inRange ? '' : undefined}
        data-first-in-range={state().firstInRange ? '' : undefined}
        data-last-in-range={state().lastInRange ? '' : undefined}
        data-disabled={disabled() ? '' : undefined}
        onClick={(event: MouseEvent) => {
          if (!disabled()) grid.onCellClick(props.cellLevel, props.date, event);
        }}
        onFocus={() => grid.onCellFocus(props.date)}
        onKeyDown={(event: KeyboardEvent) => grid.onCellKeyDown(props.date, event)}
      >
        {props.cellLevel === 'day' && grid.renderDay() ? grid.renderDay()!(props.date) : text()}
      </button>
    </td>
  );
}

function CalendarMonthGrid(props: { period: Date; label: string }) {
  const grid = useCalendarGrid();
  const weeks = createMemo(
    () => getMonthGrid(props.period, { firstDayOfWeek: grid.firstDayOfWeek(), fixedWeeks: grid.fixedWeeks() }),
    { name: 'Calendar.weeks' },
  );
  const weekdays = createMemo(
    () => ({
      short: getWeekdayNames(grid.locale(), grid.firstDayOfWeek(), grid.weekdayFormat()),
      long: getWeekdayNames(grid.locale(), grid.firstDayOfWeek(), 'long'),
    }),
    { name: 'Calendar.weekdays' },
  );
  return (
    <table role="grid" data-slot="calendar-grid" class={style.grid} aria-label={props.label}>
      <Show when={!grid.hideWeekdays()}>
        <thead>
          <tr>
            <For each={weekdays().short} keyed={false}>
              {(name, index) => (
                <th scope="col" data-slot="calendar-weekday" class={style.weekday} abbr={weekdays().long[index]}>
                  {name()}
                </th>
              )}
            </For>
          </tr>
        </thead>
      </Show>
      <tbody>
        <For each={weeks()} keyed={false}>
          {(week) => (
            <tr>
              <For each={week()} keyed={false}>
                {(day) => (
                  <Show when={isSameMonth(day(), props.period) || !grid.hideOutside()} fallback={<td class={style.cell} />}>
                    <CalendarCell date={day()} cellLevel="day" outside={!isSameMonth(day(), props.period)} />
                  </Show>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

function CalendarListGrid(props: { period: Date; label: string }) {
  const grid = useCalendarGrid();
  const rows = createMemo(() => chunk(grid.cellsOf(props.period), 3), { name: 'Calendar.rows' });
  return (
    <table role="grid" data-slot="calendar-grid" class={style.grid} aria-label={props.label}>
      <tbody>
        <For each={rows()} keyed={false}>
          {(row) => (
            <tr>
              <For each={row()} keyed={false}>
                {(date) => <CalendarCell date={date()} cellLevel={grid.cellLevel()} />}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

/**
 * A calendar: the days of a month, the months of a year, or the years of a decade, in grids moved through with the
 * arrow keys, with a header to go to the previous or next period and up a level. It has no value of its own: the
 * pickers built on it mark selected days with `getDayProps` and choose them with `onDayClick`.
 */
export function Calendar(props: CalendarProps) {
  const others = omit(
    props,
    'class',
    'date',
    'defaultDate',
    'onDateChange',
    'level',
    'defaultLevel',
    'onLevelChange',
    'minLevel',
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
    'size',
    'previousLabel',
    'nextLabel',
  );
  const providerLocale = useLocale();
  const locale = () => props.locale ?? providerLocale();
  const weekInfo = createMemo(() => getWeekInfo(locale()), { name: 'Calendar.weekInfo' });
  const firstDayOfWeek = () => props.firstDayOfWeek ?? weekInfo().firstDayOfWeek;
  const weekendDays = () => props.weekendDays ?? weekInfo().weekendDays;
  const columns = () => Math.max(1, Math.floor(props.numberOfColumns ?? 1));
  // Side by side, a month's outside days would repeat the next month's.
  const hideOutside = () => !!props.hideOutsideDates || columns() > 1;

  const levelIndex = (level: CalendarLevel | undefined, fallback: number) =>
    level === undefined ? fallback : LEVELS.indexOf(level);
  const minLevel = () => levelIndex(props.minLevel, 0);
  const maxLevel = () => Math.max(minLevel(), levelIndex(props.maxLevel, 2));
  const clampLevel = (index: number) => LEVELS[Math.min(Math.max(index, minLevel()), maxLevel())];

  const [ownLevel, setOwnLevel] = createSignal<CalendarLevel>(
    untrack(() => props.defaultLevel ?? props.minLevel ?? 'month'),
    { name: 'Calendar.level' },
  );
  const level = () => clampLevel(LEVELS.indexOf(props.level ?? ownLevel()));

  // Today is the browser's: the server and the browser may be on different days, so it's marked once hydrated.
  const [today, setToday] = createSignal<Date | undefined>(undefined, { name: 'Calendar.today' });
  onSettled(() => {
    setToday(startOfDay(new Date()));
  });

  const [ownDate, setOwnDate] = createSignal(
    untrack(() => startOfDay(props.defaultDate ?? new Date())),
    { name: 'Calendar.date' },
  );
  // The first period shown, as its first cell date.
  const start = createMemo(() => START[level()](props.date ?? ownDate()), { name: 'Calendar.start' });
  // oxlint-disable-next-line solid/reactivity -- Array.from calls the mapper synchronously, inside the memo
  const periods = createMemo(() => Array.from({ length: columns() }, (_, column) => STEP[level()](start(), column)), {
    name: 'Calendar.periods',
  });
  const lastDay = () => endOf(level(), periods().at(-1)!);

  const showDate = (date: Date) => {
    const next = START[level()](date);
    if (compareDays(next, start()) === 0) return;
    if (props.date === undefined) setOwnDate(next);
    props.onDateChange?.(next);
  };

  const changeLevel = (next: CalendarLevel) => {
    if (next === level()) return;
    if (props.level === undefined) setOwnLevel(next);
    props.onLevelChange?.(next);
  };

  // Whether a whole period (or cell) lies outside minDate and maxDate.
  const beforeMin = (lastDayOfPeriod: Date) => !!props.minDate && compareDays(lastDayOfPeriod, props.minDate) < 0;
  const afterMax = (firstDayOfPeriod: Date) => !!props.maxDate && compareDays(firstDayOfPeriod, props.maxDate) > 0;

  const cellState = (cellLevel: DateGridLevel, date: Date): CalendarCellState => {
    if (cellLevel === 'day') return props.getDayProps?.(date) ?? {};
    if (cellLevel === 'month') return props.getMonthProps?.(date) ?? {};
    return props.getYearProps?.(date) ?? {};
  };

  // Disabled by the limits or excludeDate; `isDisabled` adds what getDayProps (getMonthProps…) says.
  const isExcluded = (cellLevel: DateGridLevel, date: Date) => {
    const last = cellLevel === 'day' ? date : cellLevel === 'month' ? endOfMonth(date) : createDay(date.getFullYear(), 11, 31);
    const first = cellLevel === 'day' ? date : cellLevel === 'month' ? startOfMonth(date) : startOfYear(date);
    return beforeMin(last) || afterMax(first) || (cellLevel === 'day' && !!props.excludeDate?.(date));
  };
  const isDisabled = (cellLevel: DateGridLevel, date: Date) =>
    isExcluded(cellLevel, date) || !!cellState(cellLevel, date).disabled;

  // The cells each period shows, in order; days only of the period's own month.
  const cellsOf = (period: Date): Date[] => {
    const current = level();
    if (current === 'month')
      return Array.from({ length: endOfMonth(period).getDate() }, (_, day) =>
        createDay(period.getFullYear(), period.getMonth(), day + 1),
      );
    if (current === 'year') return Array.from({ length: 12 }, (_, month) => createDay(period.getFullYear(), month, 1));
    return Array.from({ length: 10 }, (_, year) => createDay(period.getFullYear() + year, 0, 1));
  };

  // The cell that takes Tab: the one the user moved to while it shows, else a selected one, today, or the first
  // enabled cell.
  // Equal on the same day, so focusing the cell a key just moved to changes nothing.
  const [moved, setMoved] = createSignal<Date | undefined>(undefined, {
    name: 'Calendar.moved',
    equals: (a, b) => (a && b ? compareDays(a, b) === 0 : a === b),
  });
  const active = createMemo(
    () => {
      // The helpers below are called only during this run, which repeats when level or periods change.
      // oxlint-disable-next-line solid/reactivity -- read within this memo run
      const cellLevel = CELL_LEVEL[level()];
      // oxlint-disable-next-line solid/reactivity -- read within this memo run
      const first = periods()[0];
      const key = (date: Date) => cellKey(cellLevel, date);
      const usable = (date: Date | undefined): date is Date =>
        !!date && compareDays(date, first) >= 0 && compareDays(date, lastDay()) <= 0 && !isDisabled(cellLevel, date);
      // Each source is read only when the ones before it give nothing, so after a move the cell taking Tab
      // doesn't depend on the selection.
      const movedTo = moved();
      if (usable(movedTo)) return key(movedTo);
      const cells = periods().flatMap(cellsOf);
      const selected = cells.find((date) => cellState(cellLevel, date).selected && usable(date));
      if (selected) return key(selected);
      const now = today();
      if (usable(now)) return key(now);
      const firstEnabled = cells.find(usable);
      return firstEnabled ? key(firstEnabled) : undefined;
    },
    { name: 'Calendar.active' },
  );

  // Keyed by cell, so a move re-runs only the cells it leaves and enters (and today's, once).
  let previousActive: string | undefined;
  const tabbable = createProjection<Record<string, true>>(
    (draft) => {
      const next = active();
      if (previousActive !== undefined) delete draft[previousActive];
      if (next !== undefined) draft[next] = true;
      previousActive = next;
    },
    {},
    { name: 'Calendar.tabbable' },
  );
  const todayKeys = createProjection<Record<string, true>>(
    (draft) => {
      const day = today();
      if (!day) return;
      draft[cellKey('day', day)] = true;
      draft[cellKey('month', day)] = true;
      draft[cellKey('year', day)] = true;
    },
    {},
    { name: 'Calendar.today' },
  );

  let root: HTMLDivElement | undefined;
  const focusActive = () => root?.querySelector<HTMLElement>('[data-slot="calendar-grid"] [tabindex="0"]')?.focus();

  // Moves to a cell, showing its period when it isn't shown, and focuses it.
  const moveTo = (date: Date) => {
    setMoved(date);
    if (compareDays(date, periods()[0]) < 0) showDate(date);
    else if (compareDays(date, lastDay()) > 0) showDate(STEP[level()](START[level()](date), 1 - columns()));
    flush();
    focusActive();
  };

  // The cell a key was pressed on: moves start from it.
  let pressedOn: Date | undefined;
  const navigation = createDateGridNavigation({
    level: () => CELL_LEVEL[level()],
    current: () => pressedOn!,
    firstDayOfWeek,
    columns: () => 3,
    min: () => props.minDate,
    max: () => props.maxDate,
    isDisabled: (date) => isDisabled(CELL_LEVEL[level()], date),
    onMove: (date) => moveTo(date),
  });

  const goBy = (amount: number) => {
    showDate(STEP[level()](start(), amount));
    flush();
  };
  const previousDisabled = () => beforeMin(addDaysBefore(start()));
  const nextDisabled = () => afterMax(createDay(lastDay().getFullYear(), lastDay().getMonth(), lastDay().getDate() + 1));

  const periodLabel = (period: Date) => {
    const current = level();
    if (current === 'month') return formatDate(period, locale(), { month: 'long', year: 'numeric' });
    if (current === 'year') return formatDate(period, locale(), { year: 'numeric' });
    return `${formatDate(period, locale(), { year: 'numeric' })} – ${formatDate(addYears(period, 9), locale(), { year: 'numeric' })}`;
  };

  // A click on a month or year: tell the app, then show its days or months (above minLevel), and keep the focus in
  // the grid.
  const drillDown = (date: Date) => {
    const index = LEVELS.indexOf(level());
    if (index <= minLevel()) return;
    const next = LEVELS[index - 1];
    setMoved(date);
    if (props.level === undefined) setOwnLevel(next);
    props.onLevelChange?.(next);
    const nextStart = START[next](date);
    if (props.date === undefined) setOwnDate(nextStart);
    props.onDateChange?.(nextStart);
    flush();
    focusActive();
  };

  const grid: CalendarGridContextValue = {
    locale,
    firstDayOfWeek,
    weekendDays,
    fixedWeeks: () => props.fixedWeeks ?? true,
    weekdayFormat: () => props.weekdayFormat ?? 'short',
    hideWeekdays: () => !!props.hideWeekdays,
    hideOutside,
    cellLevel: () => CELL_LEVEL[level()],
    cellsOf,
    cellState,
    isExcluded,
    tabbable,
    todayKeys,
    renderDay: () => props.renderDay,
    onCellClick: (cellLevel, date, event) => {
      if (cellLevel === 'day') {
        props.onDayClick?.(date, event);
        moveTo(date);
      } else {
        if (cellLevel === 'month') props.onMonthClick?.(date, event);
        else props.onYearClick?.(date, event);
        drillDown(date);
      }
    },
    onCellFocus: (date) => setMoved(date),
    onCellKeyDown: (date, event) => {
      pressedOn = date;
      navigation.onKeyDown(event);
    },
  };

  return (
    <div
      ref={(element: HTMLDivElement) => (root = element)}
      data-level={level()}
      data-size={props.size ?? 'md'}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-calendar', style.calendar], props.class)}
      {...others}
    >
      <For each={periods()} keyed={false}>
        {(period, column) => (
          <div data-slot="calendar-column" class={style.column}>
            <div data-slot="calendar-header" class={style.header}>
              <Show when={column === 0} fallback={<span class={style.spacer} />}>
                <button
                  type="button"
                  data-slot="calendar-previous"
                  class={style.control}
                  aria-label={props.previousLabel?.(level()) ?? `Previous ${level()}`}
                  aria-disabled={previousDisabled() ? 'true' : undefined}
                  data-disabled={previousDisabled() ? '' : undefined}
                  onClick={() => !previousDisabled() && goBy(-1)}
                >
                  {chevron('previous')}
                </button>
              </Show>
              <button
                type="button"
                data-slot="calendar-level"
                class={style.control}
                aria-live="polite"
                aria-disabled={LEVELS.indexOf(level()) >= maxLevel() ? 'true' : undefined}
                data-disabled={LEVELS.indexOf(level()) >= maxLevel() ? '' : undefined}
                onClick={() => {
                  if (LEVELS.indexOf(level()) >= maxLevel()) return;
                  changeLevel(LEVELS[LEVELS.indexOf(level()) + 1]);
                  flush();
                }}
              >
                {periodLabel(period())}
              </button>
              <Show when={column === columns() - 1} fallback={<span class={style.spacer} />}>
                <button
                  type="button"
                  data-slot="calendar-next"
                  class={style.control}
                  aria-label={props.nextLabel?.(level()) ?? `Next ${level()}`}
                  aria-disabled={nextDisabled() ? 'true' : undefined}
                  data-disabled={nextDisabled() ? '' : undefined}
                  onClick={() => !nextDisabled() && goBy(1)}
                >
                  {chevron('next')}
                </button>
              </Show>
            </div>
            <CalendarGridContext value={grid}>
              <Show when={level() === 'month'} fallback={<CalendarListGrid period={period()} label={periodLabel(period())} />}>
                <CalendarMonthGrid period={period()} label={periodLabel(period())} />
              </Show>
            </CalendarGridContext>
          </div>
        )}
      </For>
    </div>
  );
}
