import {
  addDays,
  addMonths,
  addYears,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  type DayOfWeek,
} from '../../../dates/date';

/** What a cell of the grid is: a day of a month, a month of a year, or a year of a decade. */
export type DateGridLevel = 'day' | 'month' | 'year';

export interface DateGridNavigationOptions {
  /** What a cell is. Read at each key press. */
  level: () => DateGridLevel;
  /** The date of the cell the user is on. Read at each key press. */
  current: () => Date;
  /** The day each week (row) starts on, for the day level. Read at each key press. */
  firstDayOfWeek: () => DayOfWeek;
  /** How many cells a row has, for the month and year levels. Read at each key press. Defaults to 3. */
  columns?: () => number;
  /**
   * The first cell of the grid, for the month and year levels: rows are counted from it for Home and End.
   * Defaults to January of the current year (month level) and the start of its decade (year level).
   */
  gridStart?: () => Date;
  /** The earliest date that can be reached. A month or year reaches it when it contains it. */
  min?: () => Date | undefined;
  /** The latest date that can be reached. A month or year reaches it when it contains it. */
  max?: () => Date | undefined;
  /** Cells that are skipped, at the current level. */
  isDisabled?: (date: Date) => boolean;
  /** Moves to the cell: focus it, and show its month, year or decade when the grid doesn't. */
  onMove: (date: Date, event: KeyboardEvent) => void;
}

export interface DateGridNavigation {
  /** Handles a key press. Put it on the grid or on each cell. Handled keys are prevented. */
  onKeyDown: (event: KeyboardEvent) => void;
}

const TRUNCATE: Record<DateGridLevel, (date: Date) => Date> = {
  day: startOfDay,
  month: startOfMonth,
  year: startOfYear,
};

const ADD_UNIT: Record<DateGridLevel, (date: Date, amount: number) => Date> = {
  day: addDays,
  month: addMonths,
  year: addYears,
};

// No grid needs to look further for an enabled cell; it bounds the search when every cell is disabled.
const MAX_STEPS = 1000;

/**
 * Keyboard movement through a grid of dates, for one-tab-stop date grids (days of a month, months of a year,
 * years of a decade). It keeps no state and knows no elements: the caller says which date is current and what
 * moving means. Moves cross the grid's edge, into the next month, year or decade, which the caller then shows.
 *
 * - Day level: Left and Right move a day, Up and Down a week, Home and End to the start and end of the week,
 *   Page Up and Page Down a month, and with Shift a year.
 * - Month level: Left and Right move a month, Up and Down a row, Home and End to the ends of the row, Page Up and
 *   Page Down a year.
 * - Year level: as the month level, a year at a time, and Page Up and Page Down move a decade.
 *
 * A move skips disabled cells: it takes the same step again until it finds an enabled one. A move past `min` or
 * `max` goes to the bound instead, or the nearest enabled cell before it. With nowhere to go, nothing moves.
 */
export function createDateGridNavigation(options: DateGridNavigationOptions): DateGridNavigation {
  const isDisabled = (date: Date) => !!options.isDisabled?.(date);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const level = options.level();
    const current = options.current();
    const columns = level === 'day' ? 7 : (options.columns?.() ?? 3);
    const unit = ADD_UNIT[level];
    const truncate = TRUNCATE[level];
    const pageUnit = level === 'day' && !event.shiftKey ? addMonths : addYears;
    const pageAmount = level === 'year' ? 10 : 1;

    // A step the key repeats while it lands on disabled cells, or a fixed target for Home and End.
    let step: ((date: Date) => Date) | undefined;
    let target: Date | undefined;
    switch (event.key) {
      case 'ArrowLeft':
        step = (date) => unit(date, -1);
        break;
      case 'ArrowRight':
        step = (date) => unit(date, 1);
        break;
      case 'ArrowUp':
        step = (date) => unit(date, -columns);
        break;
      case 'ArrowDown':
        step = (date) => unit(date, columns);
        break;
      case 'PageUp':
        step = (date) => pageUnit(date, -pageAmount);
        break;
      case 'PageDown':
        step = (date) => pageUnit(date, pageAmount);
        break;
      case 'Home':
      case 'End': {
        const rowStart = level === 'day' ? startOfWeek(current, options.firstDayOfWeek()) : gridRowStart(current);
        target = event.key === 'Home' ? rowStart : unit(rowStart, columns - 1);
        if (level !== 'day') target = keepDay(target, current, level);
        break;
      }
      default:
        return;
    }

    // A handled key never scrolls the page, even when there is nowhere to go.
    event.preventDefault();
    const min = options.min?.();
    const max = options.max?.();
    const compare = (a: Date, b: Date) => truncate(a).getTime() - truncate(b).getTime();
    const before = (date: Date) => !!min && compare(date, min) < 0;
    const after = (date: Date) => !!max && compare(date, max) > 0;

    // From a target outside the range or disabled: the bound, then cells toward the current one.
    const settle = (from: Date): Date | undefined => {
      let date = before(from) ? startOfDay(min!) : after(from) ? startOfDay(max!) : from;
      const toward = compare(current, date) > 0 ? 1 : -1;
      for (let steps = 0; steps < MAX_STEPS; steps++) {
        if (compare(date, current) === 0) return undefined;
        if (!isDisabled(date)) return date;
        date = unit(date, toward);
      }
      return undefined;
    };

    let next: Date | undefined;
    if (step) {
      let date = step(current);
      for (let steps = 0; steps < MAX_STEPS && !before(date) && !after(date) && isDisabled(date); steps++) date = step(date);
      next = before(date) || after(date) || isDisabled(date) ? settle(date) : date;
    } else next = settle(target!);

    if (next && compare(next, current) !== 0) options.onMove(next, event);
  };

  // The first cell of the current cell's row in a month or year grid.
  const gridRowStart = (current: Date): Date => {
    const level = options.level();
    const columns = options.columns?.() ?? 3;
    const start =
      options.gridStart?.() ??
      (level === 'month' ? startOfYear(current) : startOfYear(addYears(current, -(current.getFullYear() % 10))));
    const index =
      level === 'month'
        ? (current.getFullYear() - start.getFullYear()) * 12 + current.getMonth() - start.getMonth()
        : current.getFullYear() - start.getFullYear();
    return ADD_UNIT[level](TRUNCATE[level](start), index - (((index % columns) + columns) % columns));
  };

  return { onKeyDown };
}

// Home and End in a month or year grid land on a truncated cell; keep the current day (and month) where it fits,
// as the arrows do.
function keepDay(target: Date, current: Date, level: DateGridLevel): Date {
  if (level === 'month') return addMonths(current, monthsBetween(current, target));
  return addYears(current, target.getFullYear() - current.getFullYear());
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
}
