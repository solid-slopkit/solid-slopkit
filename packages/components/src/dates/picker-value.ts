// The value of the pickers built on Calendar (DatePicker, MonthPicker, YearPicker): one cell, several, or a range, the marks
// that show it, and the range preview under the pointer or the focus.
import { createProjection, createSignal, flush, untrack } from 'solid-js';
import type { CalendarCellState } from './calendar';
import { addDays, addMonths, addYears, compareDays, createDay, isSameDay, startOfDay, startOfMonth, startOfYear } from './date';

/** What a picker chooses: one cell, several, or a range from one to another. */
export type PickerType = 'default' | 'multiple' | 'range';

/** The value of a picker of a type: a date or `null`, an array of dates, or a range's two ends. */
export type PickerValue<Type extends PickerType = 'default'> = Type extends 'range'
  ? [Date | null, Date | null]
  : Type extends 'multiple'
    ? Date[]
    : Date | null;

type AnyValue = PickerValue<PickerType>;

/** The cells a picker chooses: days, months or years. */
export interface PickerUnit {
  /** The cells' `data-slot`. */
  slot: string;
  /** The first day of the cell a date falls in. */
  start: (date: Date) => Date;
  /** Moves by cells. */
  add: (date: Date, amount: number) => Date;
  /** The cell's `data-date`: `2026-10-15`, `2026-10` or `2026`. */
  key: (date: Date) => string;
  /** The cell of a `data-date`. */
  parse: (key: string) => Date | undefined;
  /** The first day of the period a calendar of these cells shows: a month of days, a year of months, a decade of years. */
  period: (date: Date) => Date;
  /** The first and last cells a calendar showing `shown` can show, so a long range is marked only there. */
  window: (shown: Date) => [Date, Date];
}

const pad = (number: number) => String(number).padStart(2, '0');
const yearKey = (date: Date) => String(date.getFullYear()).padStart(4, '0');

export const DAY_UNIT: PickerUnit = {
  slot: 'calendar-day',
  start: startOfDay,
  period: startOfMonth,
  add: addDays,
  key: (date) => `${yearKey(date)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  parse: (key) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    return match ? createDay(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
  },
  // Up to a year of columns, with their outside days.
  window: (shown) => [addDays(shown, -7), addDays(addMonths(shown, 13), 6)],
};

export const MONTH_UNIT: PickerUnit = {
  slot: 'calendar-month',
  start: startOfMonth,
  period: startOfYear,
  add: addMonths,
  key: (date) => `${yearKey(date)}-${pad(date.getMonth() + 1)}`,
  parse: (key) => {
    const match = /^(\d{4})-(\d{2})$/.exec(key);
    return match ? createDay(Number(match[1]), Number(match[2]) - 1, 1) : undefined;
  },
  // Up to a decade of columns.
  window: (shown) => [shown, createDay(shown.getFullYear() + 9, 11, 1)],
};

export const YEAR_UNIT: PickerUnit = {
  slot: 'calendar-year',
  start: startOfYear,
  period: (date) => createDay(date.getFullYear() - (((date.getFullYear() % 10) + 10) % 10), 0, 1),
  add: addYears,
  key: yearKey,
  parse: (key) => (/^\d{4}$/.test(key) ? createDay(Number(key), 0, 1) : undefined),
  // Up to ten decades of columns.
  window: (shown) => [shown, createDay(shown.getFullYear() + 99, 0, 1)],
};

export interface PickerValueProps {
  date?: Date;
  defaultDate?: Date;
  type?: PickerType;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: never) => void;
  allowDeselect?: boolean;
  allowSingleDateInRange?: boolean;
}

export const emptyValue = (type: PickerType) => (type === 'range' ? [null, null] : type === 'multiple' ? [] : null) as AnyValue;

/**
 * A picker's value and its marks, keyed by `unit.key`, so a choice or a moving preview re-runs only the cells it
 * changes. Pass the calendar's `onDateChange` to `show`, so a range is marked only where it can be seen.
 */
export function createPickerValue(props: PickerValueProps, unit: PickerUnit, name: string) {
  const type: PickerType = untrack(() => props.type ?? 'default');
  const same = (a: Date, b: Date) => isSameDay(unit.start(a), unit.start(b));
  const compare = (a: Date, b: Date) => compareDays(unit.start(a), unit.start(b));

  const [own, setOwn] = createSignal<AnyValue>(
    untrack(() => (props.defaultValue as AnyValue | undefined) ?? emptyValue(type)),
    {
      name: `${name}.value`,
    },
  );
  const value = (): AnyValue => (props.value !== undefined ? (props.value as AnyValue) : own());

  /** The chosen dates, in order. */
  const chosen = (): Date[] => {
    const current = value();
    if (type === 'range') return (current as [Date | null, Date | null]).filter((date): date is Date => !!date);
    if (type === 'multiple') return current as Date[];
    return current ? [current as Date] : [];
  };

  // The period shown.
  const [ownShown, setOwnShown] = createSignal<Date>(
    untrack(() => unit.period(props.date ?? props.defaultDate ?? chosen()[0] ?? new Date())),
    { name: `${name}.shown` },
  );
  const shown = () => unit.period(props.date ?? ownShown());

  // The cell under the pointer or the focus while a range has its start but no end.
  const [hovered, setHovered] = createSignal<Date | undefined>(undefined, {
    name: `${name}.hovered`,
    equals: (a, b) => (a && b ? same(a, b) : a === b),
  });

  const marks = createProjection<Record<string, CalendarCellState>>(
    (draft) => {
      const next: Record<string, CalendarCellState> = {};
      if (type === 'range') {
        const [start, end] = value() as [Date | null, Date | null];
        const preview = start && !end ? hovered() : undefined;
        const last = end ?? (start && preview && !same(preview, start) ? preview : null);
        if (start && last) {
          const [from, to] =
            compare(start, last) <= 0 ? [unit.start(start), unit.start(last)] : [unit.start(last), unit.start(start)];
          const [first, final] = unit.window(shown());
          for (let cell = compareDays(from, first) > 0 ? from : first; compareDays(cell, to) <= 0; cell = unit.add(cell, 1)) {
            if (compareDays(cell, final) > 0) break;
            next[unit.key(cell)] = { inRange: true };
          }
          Object.assign((next[unit.key(from)] ??= {}), { firstInRange: true });
          Object.assign((next[unit.key(to)] ??= {}), { lastInRange: true });
          next[unit.key(start)] = { ...next[unit.key(start)], selected: true };
          if (end) next[unit.key(end)] = { ...next[unit.key(end)], selected: true };
        } else if (start) next[unit.key(start)] = { selected: true };
      } else for (const date of chosen()) next[unit.key(date)] = { selected: true };

      for (const key of Object.keys(draft)) if (!(key in next)) delete draft[key];
      for (const [key, state] of Object.entries(next)) {
        const old = draft[key];
        if (
          !old ||
          old.selected !== state.selected ||
          old.inRange !== state.inRange ||
          old.firstInRange !== state.firstInRange ||
          old.lastInRange !== state.lastInRange
        )
          draft[key] = state;
      }
    },
    {},
    { name: `${name}.marks` },
  );

  const commit = (next: AnyValue) => {
    if (props.value === undefined) setOwn(next);
    (props.onChange as ((value: AnyValue) => void) | undefined)?.(next);
  };

  /** Chooses the cell a date falls in, by the type's rules. */
  const choose = (date: Date) => {
    const cell = unit.start(date);
    if (type === 'multiple') {
      const current = value() as Date[];
      commit(current.some((other) => same(other, cell)) ? current.filter((other) => !same(other, cell)) : [...current, cell]);
    } else if (type === 'range') {
      const [start, end] = value() as [Date | null, Date | null];
      if (!start || end) commit([cell, null]);
      else if (same(start, cell)) commit(props.allowSingleDateInRange ? [cell, cell] : [null, null]);
      else commit(compare(cell, start) < 0 ? [cell, start] : [start, cell]);
      setHovered(undefined);
    } else {
      const current = value() as Date | null;
      if (current && same(current, cell)) {
        if (props.allowDeselect) commit(null);
      } else commit(cell);
    }
    flush();
  };

  /** Previews a range up to the cell a pointer or focus event happened on. */
  const preview = (event: Event) => {
    if (type !== 'range') return;
    const [start, end] = value() as [Date | null, Date | null];
    const key = (event.target as Element | null)?.closest?.<HTMLElement>(`[data-slot="${unit.slot}"]`)?.dataset.date;
    const cell = key ? unit.parse(key) : undefined;
    if (start && !end && cell) setHovered(cell);
  };

  return { type, chosen, marks, choose, preview, endPreview: () => setHovered(undefined), show: setOwnShown };
}
