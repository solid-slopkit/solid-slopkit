import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { YearPicker, type YearPickerProps, type YearPickerType } from './year-picker';

const year = (number: number) => createDay(number, 0, 1);

function setup<Type extends YearPickerType = 'default'>(props: Partial<YearPickerProps<Type>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <YearPicker defaultDate={year(2020)} {...(props as YearPickerProps<Type>)} />
    </SlopkitUi>
  ));
  flush();
  const cell = (number: number) => result.getByRole('button', { name: String(number) });
  const click = (number: number) => {
    fireEvent.click(cell(number));
    flush();
  };
  const marked = (attribute: string) =>
    [...result.container.querySelectorAll(`[${attribute}]`)].map((element) => element.getAttribute('data-date'));
  return { ...result, cell, click, marked };
}

describe('<YearPicker />: one year', () => {
  test('a calendar of a decade with its class; a click chooses a year as its January 1', () => {
    const onChange = vi.fn();
    const { container, getByRole, click, cell, marked } = setup({ onChange, class: 'mine' });

    const root = container.querySelector('.slp-calendar')!;
    expect(root).toHaveClass('slp-year-picker', 'mine');
    expect(root).toHaveAttribute('data-type', 'default');
    expect(root).toHaveAttribute('data-level', 'decade');
    expect(getByRole('grid', { name: '2020 – 2029' })).toBeInTheDocument();
    click(2026);
    expect(onChange).toHaveBeenLastCalledWith(year(2026));
    expect(marked('data-selected')).toEqual(['2026']);
    expect(cell(2026).closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(root).toHaveAttribute('data-level', 'decade');
    click(2021);
    expect(marked('data-selected')).toEqual(['2021']);
  });

  test('a click on the chosen year keeps it, or clears it with allowDeselect', () => {
    const onChange = vi.fn();
    const kept = setup({ defaultValue: year(2026), onChange });
    kept.click(2026);
    expect(onChange).not.toHaveBeenCalled();
    expect(kept.marked('data-selected')).toEqual(['2026']);

    const cleared = setup({ defaultValue: year(2026), allowDeselect: true, onChange });
    cleared.click(2026);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(cleared.marked('data-selected')).toEqual([]);
  });

  test('a controlled value, any day of its year; it opens on the decade of the value', () => {
    const [value, setValue] = createSignal<Date | null>(createDay(2043, 6, 17));
    const onChange = vi.fn();
    const { getByRole, click, marked } = setup({
      defaultDate: undefined,
      get value() {
        return value();
      },
      onChange,
    });

    expect(getByRole('grid', { name: '2040 – 2049' })).toBeInTheDocument();
    expect(marked('data-selected')).toEqual(['2043']);
    click(2045);
    expect(onChange).toHaveBeenCalledWith(year(2045));
    expect(marked('data-selected')).toEqual(['2043']);
    setValue(year(2048));
    flush();
    expect(marked('data-selected')).toEqual(['2048']);
  });

  test('stays on the decade: the header names it and goes nowhere; previous and next move a decade', () => {
    const onDateChange = vi.fn();
    const { container, getByRole } = setup({ onDateChange });

    const level = getByRole('button', { name: '2020 – 2029' });
    expect(level).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(level);
    flush();
    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-level', 'decade');
    fireEvent.click(getByRole('button', { name: 'Next decade' }));
    flush();
    expect(onDateChange).toHaveBeenLastCalledWith(year(2030));
    expect(getByRole('grid', { name: '2030 – 2039' })).toBeInTheDocument();
  });

  test('keeps getYearProps, onYearClick and the limits', () => {
    const onYearClick = vi.fn();
    const { cell, click, marked, getAllByRole } = setup({
      getYearProps: (date) => ({ disabled: date.getFullYear() === 2025 }),
      onYearClick,
      numberOfColumns: 2,
      minDate: createDay(2022, 5, 15),
      maxDate: createDay(2034, 1, 10),
    });

    expect(getAllByRole('grid').map((grid) => grid.getAttribute('aria-label'))).toEqual(['2020 – 2029', '2030 – 2039']);
    expect(cell(2025)).toBeDisabled();
    expect(cell(2021)).toBeDisabled();
    expect(cell(2022)).not.toBeDisabled();
    expect(cell(2034)).not.toBeDisabled();
    expect(cell(2035)).toBeDisabled();
    click(2021);
    expect(onYearClick).not.toHaveBeenCalled();
    click(2027);
    expect(onYearClick).toHaveBeenCalledWith(year(2027), expect.any(MouseEvent));
    expect(marked('data-selected')).toEqual(['2027']);
  });
});

describe('<YearPicker />: several years', () => {
  test('each click adds a year or takes it away', () => {
    const onChange = vi.fn();
    const { click, marked, container } = setup<'multiple'>({ type: 'multiple', defaultValue: [year(2021)], onChange });

    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-type', 'multiple');
    click(2028);
    expect(onChange).toHaveBeenLastCalledWith([year(2021), year(2028)]);
    click(2024);
    click(2021);
    expect(onChange).toHaveBeenLastCalledWith([year(2028), year(2024)]);
    expect(marked('data-selected')).toEqual(['2024', '2028']);
  });
});

describe('<YearPicker />: a range', () => {
  test('the first click starts it, the second ends it, in either order; a third starts again', () => {
    const onChange = vi.fn();
    const { click, marked } = setup<'range'>({ type: 'range', onChange });

    click(2027);
    expect(onChange).toHaveBeenLastCalledWith([year(2027), null]);
    expect(marked('data-selected')).toEqual(['2027']);
    click(2023);
    expect(onChange).toHaveBeenLastCalledWith([year(2023), year(2027)]);
    expect(marked('data-in-range')).toEqual(['2023', '2024', '2025', '2026', '2027']);
    expect(marked('data-first-in-range')).toEqual(['2023']);
    expect(marked('data-last-in-range')).toEqual(['2027']);
    expect(marked('data-selected')).toEqual(['2023', '2027']);
    click(2020);
    expect(onChange).toHaveBeenLastCalledWith([year(2020), null]);
    expect(marked('data-in-range')).toEqual([]);
  });

  test('a second click on the start clears it, or ends a one-year range with allowSingleDateInRange', () => {
    const onChange = vi.fn();
    const cleared = setup<'range'>({ type: 'range', defaultValue: [year(2024), null], onChange });
    cleared.click(2024);
    expect(onChange).toHaveBeenLastCalledWith([null, null]);

    const single = setup<'range'>({ type: 'range', defaultValue: [year(2024), null], allowSingleDateInRange: true, onChange });
    single.click(2024);
    expect(onChange).toHaveBeenLastCalledWith([year(2024), year(2024)]);
    expect(single.marked('data-first-in-range')).toEqual(['2024']);
    expect(single.marked('data-last-in-range')).toEqual(['2024']);
  });

  test('with a start, the pointer or the focus previews the range; leaving clears it', () => {
    const { cell, marked, container } = setup<'range'>({ type: 'range', defaultValue: [year(2024), null] });

    fireEvent.pointerOver(cell(2027));
    flush();
    expect(marked('data-in-range')).toEqual(['2024', '2025', '2026', '2027']);
    fireEvent.pointerOver(cell(2022));
    flush();
    expect(marked('data-in-range')).toEqual(['2022', '2023', '2024']);
    fireEvent.pointerLeave(container.querySelector('.slp-calendar')!);
    flush();
    expect(marked('data-in-range')).toEqual([]);
    cell(2025).focus();
    flush();
    expect(marked('data-in-range')).toEqual(['2024', '2025']);
  });

  test('a range across decades is marked in each', () => {
    const { marked } = setup<'range'>({
      type: 'range',
      numberOfColumns: 2,
      defaultValue: [year(2028), year(2031)],
    });
    expect(marked('data-in-range')).toEqual(['2028', '2029', '2030', '2031']);
  });

  test('a controlled range', () => {
    const [value, setValue] = createSignal<[Date | null, Date | null]>([year(2021), year(2023)]);
    const { marked } = setup<'range'>({
      type: 'range',
      get value() {
        return value();
      },
    });
    expect(marked('data-in-range')).toEqual(['2021', '2022', '2023']);
    setValue([year(2028), null]);
    flush();
    expect(marked('data-in-range')).toEqual([]);
    expect(marked('data-selected')).toEqual(['2028']);
  });
});

describe('<YearPicker />: updates', () => {
  test('a choice re-runs only the years it changes', async () => {
    const { cell } = setup({ defaultValue: year(2021) });
    cell(2021).focus();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(cell(2027));
        flush();
      },
      { scenario: 'year-picker-choose' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('a moving range preview re-runs only the years it changes', async () => {
    const { cell } = setup<'range'>({ type: 'range', defaultValue: [year(2021), null] });
    fireEvent.pointerOver(cell(2024));
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.pointerOver(cell(2025));
        flush();
      },
      { scenario: 'year-picker-preview' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(8);
  });
});

describe('<YearPicker />: accessibility and SSR', () => {
  test.each([
    ['one year', { defaultValue: year(2026) }],
    ['a range', { type: 'range' as const, defaultValue: [year(2022), year(2026)] as [Date, Date] }],
  ])('has no axe violations: %s', async (_, props) => {
    const { container } = setup(props as Partial<YearPickerProps<YearPickerType>>);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['single', 'multiple', 'range'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./year-picker.fixtures.tsx', name);
  });
});
