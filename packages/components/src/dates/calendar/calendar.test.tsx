import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay, isSameDay } from '../date';
import { Calendar, type CalendarProps } from './calendar';

const october15 = createDay(2026, 9, 15);

function setup(props: Partial<CalendarProps> = {}, locale = 'en-US') {
  const result = render(() => (
    <SlopkitUi locale={locale}>
      <Calendar defaultDate={october15} {...props} />
    </SlopkitUi>
  ));
  flush();
  const root = () => result.container.querySelector<HTMLElement>('.slp-calendar')!;
  const grids = () => result.getAllByRole('grid').map((grid) => grid.getAttribute('aria-label'));
  const day = (name: string) => result.getByRole('button', { name });
  const days = (grid = 0) =>
    [...result.getAllByRole('grid')[grid].querySelectorAll('tbody button')].map((button) => button.textContent);
  const cells = (grid = 0) =>
    [...result.getAllByRole('grid')[grid].querySelectorAll('tbody button')].map((button) => button.textContent);
  const tabbable = () =>
    [...root().querySelectorAll('[data-slot="calendar-grid"] [tabindex="0"]')].map(
      (button) => button.getAttribute('aria-label') ?? button.textContent,
    );
  const click = (element: Element) => {
    fireEvent.click(element);
    flush();
  };
  const press = (key: string, init: KeyboardEventInit = {}) => {
    fireEvent.keyDown(document.activeElement!, { key, ...init });
    flush();
  };
  return { ...result, root, grids, day, days, cells, tabbable, click, press };
}

describe('<Calendar />: month level', () => {
  test('a grid of the month named after it, with weekday headers and six weeks of days', () => {
    const { root, getByRole, getAllByRole, days } = setup({ class: 'mine' });

    expect(root()).toHaveClass('slp-calendar', 'mine');
    expect(root()).toHaveAttribute('data-level', 'month');
    expect(getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    const headers = getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(headers[0]).toHaveAttribute('abbr', 'Sunday');
    expect(days()).toHaveLength(42);
    expect(days().slice(0, 6)).toEqual(['27', '28', '29', '30', '1', '2']);
    expect(getByRole('button', { name: 'Thursday, October 15, 2026' })).toHaveAttribute('data-slot', 'calendar-day');
  });

  test('days of the neighboring months, weekends and attributes', () => {
    const { day } = setup();

    expect(day('Sunday, September 27, 2026')).toHaveAttribute('data-outside', '');
    expect(day('Sunday, September 27, 2026')).toHaveAttribute('data-weekend', '');
    expect(day('Thursday, October 15, 2026')).not.toHaveAttribute('data-outside');
    expect(day('Saturday, October 17, 2026')).toHaveAttribute('data-weekend', '');
    expect(day('Monday, October 19, 2026')).not.toHaveAttribute('data-weekend');
  });

  test('follows the locale: first day of the week, names and weekend', () => {
    const { getByRole, getAllByRole, day } = setup({}, 'de-DE');

    expect(getByRole('grid', { name: 'Oktober 2026' })).toBeInTheDocument();
    expect(getAllByRole('columnheader')[0]).toHaveTextContent('Mo');
    expect(day('Donnerstag, 15. Oktober 2026')).toBeInTheDocument();

    const { getAllByRole: arabic } = setup({ locale: 'ar-EG', weekdayFormat: 'narrow' });
    expect(arabic('columnheader')[0]).toHaveAttribute('abbr', 'السبت');
  });

  test('firstDayOfWeek and weekendDays override the locale', () => {
    const { getAllByRole, day } = setup({ firstDayOfWeek: 1, weekendDays: [5] });

    expect(getAllByRole('columnheader')[0]).toHaveTextContent('Mon');
    expect(day('Friday, October 16, 2026')).toHaveAttribute('data-weekend', '');
    expect(day('Sunday, October 18, 2026')).not.toHaveAttribute('data-weekend');
  });

  test('fixedWeeks={false} shows only the weeks of the month; hideOutsideDates leaves the other days out', () => {
    // February 2026 starts on a Sunday: four weeks.
    expect(setup({ defaultDate: createDay(2026, 1, 10), fixedWeeks: false }).days()).toHaveLength(28);

    const { days, getAllByRole } = setup({ hideOutsideDates: true });
    expect(days()).toHaveLength(31);
    expect(getAllByRole('row')).toHaveLength(7);
  });

  test('hideWeekdays leaves the header row out', () => {
    const { queryAllByRole } = setup({ hideWeekdays: true });
    expect(queryAllByRole('columnheader')).toHaveLength(0);
  });

  test('previous and next show the neighboring months', () => {
    const onDateChange = vi.fn();
    const { getByRole, grids, click } = setup({ onDateChange });

    click(getByRole('button', { name: 'Next month' }));
    expect(grids()).toEqual(['November 2026']);
    expect(onDateChange).toHaveBeenLastCalledWith(createDay(2026, 10, 1));
    click(getByRole('button', { name: 'Previous month' }));
    click(getByRole('button', { name: 'Previous month' }));
    expect(grids()).toEqual(['September 2026']);
    expect(getByRole('button', { name: 'September 2026' })).toHaveAttribute('aria-live', 'polite');
  });

  test('a controlled date shows what the app says', () => {
    const [date, setDate] = createSignal(october15);
    const onDateChange = vi.fn();
    const { getByRole, grids, click } = setup({
      get date() {
        return date();
      },
      onDateChange,
    });

    click(getByRole('button', { name: 'Next month' }));
    expect(onDateChange).toHaveBeenCalledWith(createDay(2026, 10, 1));
    expect(grids()).toEqual(['October 2026']);
    setDate(createDay(2027, 0, 5));
    flush();
    expect(grids()).toEqual(['January 2027']);
  });

  test('numberOfColumns shows months side by side; previous is on the first, next on the last', () => {
    const { grids, getAllByRole, click, getByRole } = setup({ numberOfColumns: 2 });

    expect(grids()).toEqual(['October 2026', 'November 2026']);
    expect(getAllByRole('button', { name: 'Next month' })).toHaveLength(1);
    // The days of the neighboring months are left out, or November 1 would show twice.
    expect(getAllByRole('button', { name: 'Sunday, November 1, 2026' })).toHaveLength(1);
    click(getByRole('button', { name: 'Next month' }));
    expect(grids()).toEqual(['November 2026', 'December 2026']);
  });

  test('a click on a day calls onDayClick', () => {
    const onDayClick = vi.fn();
    const { day, click } = setup({ onDayClick });

    click(day('Tuesday, October 20, 2026'));
    expect(onDayClick).toHaveBeenCalledWith(createDay(2026, 9, 20), expect.any(MouseEvent));
  });

  test('a click on a day of the next month shows that month', () => {
    const { day, click, grids, tabbable } = setup();

    click(day('Sunday, November 1, 2026'));
    expect(grids()).toEqual(['November 2026']);
    expect(tabbable()).toEqual(['Sunday, November 1, 2026']);
  });

  test('getDayProps marks selected days and ranges', () => {
    const { day } = setup({
      getDayProps: (date) => ({
        selected: isSameDay(date, october15),
        inRange: date.getDate() > 15 && date.getDate() < 18 && date.getMonth() === 9,
        firstInRange: isSameDay(date, createDay(2026, 9, 16)),
        lastInRange: isSameDay(date, createDay(2026, 9, 17)),
        disabled: isSameDay(date, createDay(2026, 9, 20)),
      }),
    });

    const selected = day('Thursday, October 15, 2026');
    expect(selected).toHaveAttribute('data-selected', '');
    expect(selected.closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(day('Friday, October 16, 2026')).toHaveAttribute('data-first-in-range', '');
    expect(day('Friday, October 16, 2026')).toHaveAttribute('data-in-range', '');
    expect(day('Saturday, October 17, 2026')).toHaveAttribute('data-last-in-range', '');
    expect(day('Tuesday, October 20, 2026')).toBeDisabled();
    expect(day('Monday, October 19, 2026').closest('td')).not.toHaveAttribute('aria-selected');
  });

  test('minDate, maxDate and excludeDate disable days; previous and next stop at them', () => {
    const { day, getByRole, click, grids } = setup({
      minDate: createDay(2026, 9, 5),
      maxDate: createDay(2026, 10, 10),
      excludeDate: (date) => date.getDay() === 3,
    });

    expect(day('Sunday, October 4, 2026')).toBeDisabled();
    expect(day('Monday, October 5, 2026')).toBeEnabled();
    expect(day('Wednesday, October 14, 2026')).toBeDisabled();
    const previous = getByRole('button', { name: 'Previous month' });
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(previous).toHaveAttribute('data-disabled', '');
    click(previous);
    expect(grids()).toEqual(['October 2026']);

    const next = getByRole('button', { name: 'Next month' });
    click(next);
    expect(grids()).toEqual(['November 2026']);
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(day('Wednesday, November 11, 2026')).toBeDisabled();
  });

  test('renderDay sets the content of a day', () => {
    const { day } = setup({ renderDay: (date) => <span data-testid="dot">{date.getDate()}•</span> });
    expect(day('Thursday, October 15, 2026')).toHaveTextContent('15•');
  });

  test('marks today once hydrated', () => {
    const { container } = setup({ defaultDate: undefined });
    const today = container.querySelector('[aria-current="date"]');

    expect(today).toHaveAttribute('data-today', '');
    expect(today).toHaveAttribute('aria-label', new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date()));
  });

  test('previousLabel and nextLabel rename the controls', () => {
    const { getByRole } = setup({
      previousLabel: (level) => `Vorheriger ${level}`,
      nextLabel: (level) => `Nächster ${level}`,
    });
    expect(getByRole('button', { name: 'Vorheriger month' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Nächster month' })).toBeInTheDocument();
  });
});

describe('<Calendar />: levels', () => {
  test('the header goes up to the months of the year, then the years of the decade', () => {
    const onLevelChange = vi.fn();
    const { getByRole, grids, cells, click, root } = setup({ onLevelChange });

    click(getByRole('button', { name: 'October 2026' }));
    expect(root()).toHaveAttribute('data-level', 'year');
    expect(onLevelChange).toHaveBeenLastCalledWith('year');
    expect(grids()).toEqual(['2026']);
    expect(cells()).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    expect(getByRole('button', { name: 'October 2026' })).toHaveAttribute('data-slot', 'calendar-month');

    click(getByRole('button', { name: '2026' }));
    expect(grids()).toEqual(['2020 – 2029']);
    expect(cells()).toEqual(['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029']);
    expect(getByRole('button', { name: '2020 – 2029' })).toHaveAttribute('aria-disabled', 'true');
    click(getByRole('button', { name: 'Next decade' }));
    expect(grids()).toEqual(['2030 – 2039']);
  });

  test('choosing a year shows its months, and a month its days', () => {
    const onYearClick = vi.fn();
    const onMonthClick = vi.fn();
    const { getByRole, grids, click } = setup({ defaultLevel: 'decade', onYearClick, onMonthClick });

    click(getByRole('button', { name: '2028' }));
    expect(onYearClick).toHaveBeenCalledWith(createDay(2028, 0, 1), expect.any(MouseEvent));
    expect(grids()).toEqual(['2028']);
    click(getByRole('button', { name: 'March 2028' }));
    expect(onMonthClick).toHaveBeenCalledWith(createDay(2028, 2, 1), expect.any(MouseEvent));
    expect(grids()).toEqual(['March 2028']);
  });

  test('minLevel stops at the months; maxLevel at the year', () => {
    const onMonthClick = vi.fn();
    const { getByRole, grids, click } = setup({ minLevel: 'year', maxLevel: 'year', onMonthClick });

    expect(grids()).toEqual(['2026']);
    click(getByRole('button', { name: 'May 2026' }));
    expect(onMonthClick).toHaveBeenCalled();
    expect(grids()).toEqual(['2026']);
    expect(getByRole('button', { name: '2026' })).toHaveAttribute('aria-disabled', 'true');
    expect(getByRole('button', { name: 'Next year' })).toBeInTheDocument();
  });

  test('months and years outside minDate and maxDate are disabled', () => {
    const { getByRole } = setup({ defaultLevel: 'year', minDate: createDay(2026, 2, 20), maxDate: createDay(2027, 4, 1) });

    expect(getByRole('button', { name: 'February 2026' })).toBeDisabled();
    expect(getByRole('button', { name: 'March 2026' })).toBeEnabled();
    expect(getByRole('button', { name: 'Previous year' })).toHaveAttribute('aria-disabled', 'true');
    expect(getByRole('button', { name: 'Next year' })).not.toHaveAttribute('aria-disabled');
  });

  test('getMonthProps and getYearProps mark cells', () => {
    const { getByRole, click } = setup({
      defaultLevel: 'year',
      getMonthProps: (date) => ({ selected: date.getMonth() === 3 }),
      getYearProps: (date) => ({ disabled: date.getFullYear() === 2025 }),
    });

    expect(getByRole('button', { name: 'April 2026' })).toHaveAttribute('data-selected', '');
    click(getByRole('button', { name: '2026' }));
    expect(getByRole('button', { name: '2025' })).toBeDisabled();
  });
});

describe('<Calendar />: keyboard', () => {
  test('one day takes Tab: a selected one, else today, else the first enabled day', () => {
    expect(setup({ getDayProps: (date) => ({ selected: isSameDay(date, october15) }) }).tabbable()).toEqual([
      'Thursday, October 15, 2026',
    ]);
    // Today is in October 2026 only on the day the tests were written, so this month has no today.
    expect(setup({ defaultDate: createDay(2031, 2, 1), minDate: createDay(2031, 2, 3) }).tabbable()).toEqual([
      'Monday, March 3, 2031',
    ]);
    const { tabbable } = setup({ defaultDate: undefined });
    expect(tabbable()).toEqual([new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())]);
  });

  test('arrows move the focus through the days and into the neighboring months', () => {
    const { day, press, grids, tabbable } = setup();

    day('Thursday, October 1, 2026').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(day('Friday, October 2, 2026'));
    expect(tabbable()).toEqual(['Friday, October 2, 2026']);
    press('ArrowLeft');
    press('ArrowLeft');
    expect(grids()).toEqual(['September 2026']);
    expect(document.activeElement).toBe(day('Wednesday, September 30, 2026'));
    press('PageDown');
    expect(grids()).toEqual(['October 2026']);
    expect(document.activeElement).toBe(day('Friday, October 30, 2026'));
  });

  test('with two months shown, a move into the second keeps both', () => {
    const { day, press, grids } = setup({ numberOfColumns: 2 });

    day('Saturday, October 31, 2026').focus();
    press('ArrowRight');
    expect(grids()).toEqual(['October 2026', 'November 2026']);
    expect(document.activeElement).toBe(day('Sunday, November 1, 2026'));
    press('PageDown');
    expect(grids()).toEqual(['November 2026', 'December 2026']);
  });

  test('arrows move through the months of the year level, three to a row', () => {
    const { getByRole, press } = setup({ defaultLevel: 'year' });

    getByRole('button', { name: 'May 2026' }).focus();
    press('ArrowDown');
    expect(document.activeElement).toBe(getByRole('button', { name: 'August 2026' }));
  });

  test('the header and the controls ignore the arrows', () => {
    const { getByRole, press, grids } = setup();

    getByRole('button', { name: 'Next month' }).focus();
    press('ArrowLeft');
    press('PageDown');
    expect(grids()).toEqual(['October 2026']);
  });

  test('a move within the month re-runs only the two days it touches', async () => {
    const { day, tabbable } = setup();
    day('Thursday, October 15, 2026').focus();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
        flush();
      },
      { scenario: 'calendar-arrow' },
    );

    expect(tabbable()).toEqual(['Friday, October 16, 2026']);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(6);
  });
});

describe('<Calendar />: accessibility and SSR', () => {
  test.each([
    ['month', {}],
    ['month with a range', { getDayProps: (date: Date) => ({ selected: isSameDay(date, october15) }) }],
    ['year', { defaultLevel: 'year' as const }],
    ['decade', { defaultLevel: 'decade' as const, minDate: createDay(2023, 0, 1) }],
    ['two columns', { numberOfColumns: 2, hideOutsideDates: true }],
  ])('has no axe violations: %s', async (_, props) => {
    const { container } = setup(props);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['month', 'year', 'decade', 'columns'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./calendar.fixtures.tsx', name);
  });
});
