import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MonthPicker, type MonthPickerProps, type MonthPickerType } from './month-picker';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const month = (index: number, year = 2026) => createDay(year, index, 1);

function setup<Type extends MonthPickerType = 'default'>(props: Partial<MonthPickerProps<Type>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <MonthPicker defaultDate={month(0)} {...(props as MonthPickerProps<Type>)} />
    </SlopkitUi>
  ));
  flush();
  const cell = (index: number, year = 2026) => result.getByRole('button', { name: `${MONTHS[index]} ${year}` });
  const click = (index: number, year?: number) => {
    fireEvent.click(cell(index, year));
    flush();
  };
  const marked = (attribute: string) =>
    [...result.container.querySelectorAll(`[${attribute}]`)].map((element) => element.getAttribute('data-date'));
  return { ...result, cell, click, marked };
}

describe('<MonthPicker />: one month', () => {
  test('a calendar of months with its class; a click chooses a month as its first day', () => {
    const onChange = vi.fn();
    const { container, getByRole, click, cell, marked } = setup({ onChange, class: 'mine' });

    const root = container.querySelector('.slp-calendar')!;
    expect(root).toHaveClass('slp-month-picker', 'mine');
    expect(root).toHaveAttribute('data-type', 'default');
    expect(root).toHaveAttribute('data-level', 'year');
    expect(getByRole('grid', { name: '2026' })).toBeInTheDocument();
    click(9);
    expect(onChange).toHaveBeenLastCalledWith(month(9));
    expect(marked('data-selected')).toEqual(['2026-10']);
    expect(cell(9).closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(root).toHaveAttribute('data-level', 'year');
    click(2);
    expect(marked('data-selected')).toEqual(['2026-03']);
  });

  test('a click on the chosen month keeps it, or clears it with allowDeselect', () => {
    const onChange = vi.fn();
    const kept = setup({ defaultValue: month(9), onChange });
    kept.click(9);
    expect(onChange).not.toHaveBeenCalled();
    expect(kept.marked('data-selected')).toEqual(['2026-10']);

    const cleared = setup({ defaultValue: month(9), allowDeselect: true, onChange });
    cleared.click(9);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(cleared.marked('data-selected')).toEqual([]);
  });

  test('a controlled value, any day of its month; it opens on the year of the value', () => {
    const [value, setValue] = createSignal<Date | null>(createDay(2030, 4, 17));
    const onChange = vi.fn();
    const { getByRole, click, marked } = setup({
      defaultDate: undefined,
      get value() {
        return value();
      },
      onChange,
    });

    expect(getByRole('grid', { name: '2030' })).toBeInTheDocument();
    expect(marked('data-selected')).toEqual(['2030-05']);
    click(6, 2030);
    expect(onChange).toHaveBeenCalledWith(month(6, 2030));
    expect(marked('data-selected')).toEqual(['2030-05']);
    setValue(month(11, 2030));
    flush();
    expect(marked('data-selected')).toEqual(['2030-12']);
  });

  test('the header goes up to the decade, and a year back down to its months', () => {
    const onLevelChange = vi.fn();
    const onYearClick = vi.fn();
    const { container, getByRole } = setup({ onLevelChange, onYearClick });
    const root = container.querySelector('.slp-calendar')!;

    fireEvent.click(getByRole('button', { name: '2026' }));
    flush();
    expect(root).toHaveAttribute('data-level', 'decade');
    expect(onLevelChange).toHaveBeenLastCalledWith('decade');
    fireEvent.click(getByRole('button', { name: '2028' }));
    flush();
    expect(onYearClick).toHaveBeenCalledWith(createDay(2028, 0, 1), expect.any(MouseEvent));
    expect(root).toHaveAttribute('data-level', 'year');
    expect(getByRole('grid', { name: '2028' })).toBeInTheDocument();
  });

  test('maxLevel="year" keeps it on the months', () => {
    const { container, getByRole } = setup({ maxLevel: 'year' });
    const level = getByRole('button', { name: '2026' });
    expect(level).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(level);
    flush();
    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-level', 'year');
  });

  test('keeps getMonthProps, onMonthClick and the limits', () => {
    const onMonthClick = vi.fn();
    const { cell, click, marked, getAllByRole } = setup({
      getMonthProps: (date) => ({ disabled: date.getMonth() === 5 }),
      onMonthClick,
      numberOfColumns: 2,
      minDate: createDay(2026, 2, 15),
      maxDate: createDay(2027, 1, 10),
    });

    expect(getAllByRole('grid').map((grid) => grid.getAttribute('aria-label'))).toEqual(['2026', '2027']);
    expect(cell(5)).toBeDisabled();
    expect(cell(1)).toBeDisabled();
    expect(cell(2)).not.toBeDisabled();
    expect(cell(1, 2027)).not.toBeDisabled();
    expect(cell(2, 2027)).toBeDisabled();
    click(1);
    expect(onMonthClick).not.toHaveBeenCalled();
    click(7);
    expect(onMonthClick).toHaveBeenCalledWith(month(7), expect.any(MouseEvent));
    expect(marked('data-selected')).toEqual(['2026-08']);
  });
});

describe('<MonthPicker />: several months', () => {
  test('each click adds a month or takes it away', () => {
    const onChange = vi.fn();
    const { click, marked, container } = setup<'multiple'>({ type: 'multiple', defaultValue: [month(1)], onChange });

    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-type', 'multiple');
    click(9);
    expect(onChange).toHaveBeenLastCalledWith([month(1), month(9)]);
    click(4);
    click(1);
    expect(onChange).toHaveBeenLastCalledWith([month(9), month(4)]);
    expect(marked('data-selected')).toEqual(['2026-05', '2026-10']);
  });
});

describe('<MonthPicker />: a range', () => {
  test('the first click starts it, the second ends it, in either order; a third starts again', () => {
    const onChange = vi.fn();
    const { click, marked } = setup<'range'>({ type: 'range', onChange });

    click(8);
    expect(onChange).toHaveBeenLastCalledWith([month(8), null]);
    expect(marked('data-selected')).toEqual(['2026-09']);
    click(5);
    expect(onChange).toHaveBeenLastCalledWith([month(5), month(8)]);
    expect(marked('data-in-range')).toEqual(['2026-06', '2026-07', '2026-08', '2026-09']);
    expect(marked('data-first-in-range')).toEqual(['2026-06']);
    expect(marked('data-last-in-range')).toEqual(['2026-09']);
    expect(marked('data-selected')).toEqual(['2026-06', '2026-09']);
    click(0);
    expect(onChange).toHaveBeenLastCalledWith([month(0), null]);
    expect(marked('data-in-range')).toEqual([]);
  });

  test('a second click on the start clears it, or ends a one-month range with allowSingleDateInRange', () => {
    const onChange = vi.fn();
    const cleared = setup<'range'>({ type: 'range', defaultValue: [month(3), null], onChange });
    cleared.click(3);
    expect(onChange).toHaveBeenLastCalledWith([null, null]);

    const single = setup<'range'>({ type: 'range', defaultValue: [month(3), null], allowSingleDateInRange: true, onChange });
    single.click(3);
    expect(onChange).toHaveBeenLastCalledWith([month(3), month(3)]);
    expect(single.marked('data-first-in-range')).toEqual(['2026-04']);
    expect(single.marked('data-last-in-range')).toEqual(['2026-04']);
  });

  test('with a start, the pointer or the focus previews the range; leaving clears it', () => {
    const { cell, marked, container } = setup<'range'>({ type: 'range', defaultValue: [month(3), null] });

    fireEvent.pointerOver(cell(6));
    flush();
    expect(marked('data-in-range')).toEqual(['2026-04', '2026-05', '2026-06', '2026-07']);
    fireEvent.pointerOver(cell(1));
    flush();
    expect(marked('data-in-range')).toEqual(['2026-02', '2026-03', '2026-04']);
    fireEvent.pointerLeave(container.querySelector('.slp-calendar')!);
    flush();
    expect(marked('data-in-range')).toEqual([]);
    cell(4).focus();
    flush();
    expect(marked('data-in-range')).toEqual(['2026-04', '2026-05']);
  });

  test('a range across years is marked in each', () => {
    const { marked } = setup<'range'>({
      type: 'range',
      numberOfColumns: 2,
      defaultValue: [month(10), month(1, 2027)],
    });
    expect(marked('data-in-range')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });

  test('a controlled range', () => {
    const [value, setValue] = createSignal<[Date | null, Date | null]>([month(2), month(4)]);
    const { marked } = setup<'range'>({
      type: 'range',
      get value() {
        return value();
      },
    });
    expect(marked('data-in-range')).toEqual(['2026-03', '2026-04', '2026-05']);
    setValue([month(8), null]);
    flush();
    expect(marked('data-in-range')).toEqual([]);
    expect(marked('data-selected')).toEqual(['2026-09']);
  });
});

describe('<MonthPicker />: updates', () => {
  test('a choice re-runs only the months it changes', async () => {
    const { cell } = setup({ defaultValue: month(2) });
    cell(2).focus();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(cell(9));
        flush();
      },
      { scenario: 'month-picker-choose' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('a moving range preview re-runs only the months it changes', async () => {
    const { cell } = setup<'range'>({ type: 'range', defaultValue: [month(1), null] });
    fireEvent.pointerOver(cell(5));
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.pointerOver(cell(6));
        flush();
      },
      { scenario: 'month-picker-preview' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(8);
  });
});

describe('<MonthPicker />: accessibility and SSR', () => {
  test.each([
    ['one month', { defaultValue: month(9) }],
    ['a range', { type: 'range' as const, defaultValue: [month(2), month(6)] as [Date, Date] }],
    ['the decade', { defaultLevel: 'decade' as const, defaultValue: month(9) }],
  ])('has no axe violations: %s', async (_, props) => {
    const { container } = setup(props as Partial<MonthPickerProps<MonthPickerType>>);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['single', 'multiple', 'range', 'decade'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./month-picker.fixtures.tsx', name);
  });
});
