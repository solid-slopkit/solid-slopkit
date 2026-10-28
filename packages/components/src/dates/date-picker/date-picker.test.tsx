import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DatePicker, type DatePickerProps, type DatePickerType } from './date-picker';

const day = (date: number, month = 9) => createDay(2026, month, date);

function setup<Type extends DatePickerType = 'default'>(props: Partial<DatePickerProps<Type>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <DatePicker defaultDate={day(1)} {...(props as DatePickerProps<Type>)} />
    </SlopkitUi>
  ));
  flush();
  const cell = (date: number, month = 'October') => {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
      createDay(2026, month === 'October' ? 9 : month === 'November' ? 10 : 8, date),
    );
    return result.getByRole('button', { name: `${weekday}, ${month} ${date}, 2026` });
  };
  const click = (date: number, month?: string) => {
    fireEvent.click(cell(date, month));
    flush();
  };
  const marked = (attribute: string) =>
    [...result.container.querySelectorAll(`[${attribute}]`)].map((element) => element.textContent);
  return { ...result, cell, click, marked };
}

describe('<DatePicker />: one day', () => {
  test('a calendar with its class; a click chooses a day', () => {
    const onChange = vi.fn();
    const { container, cell, click, marked } = setup({ onChange, class: 'mine' });

    const root = container.querySelector('.slp-calendar')!;
    expect(root).toHaveClass('slp-date-picker', 'mine');
    expect(root).toHaveAttribute('data-type', 'default');
    click(15);
    expect(onChange).toHaveBeenLastCalledWith(day(15));
    expect(marked('data-selected')).toEqual(['15']);
    expect(cell(15).closest('td')).toHaveAttribute('aria-selected', 'true');
    click(20);
    expect(marked('data-selected')).toEqual(['20']);
  });

  test('a click on the chosen day keeps it, or clears it with allowDeselect', () => {
    const onChange = vi.fn();
    const kept = setup({ defaultValue: day(15), onChange });
    kept.click(15);
    expect(onChange).not.toHaveBeenCalled();
    expect(kept.marked('data-selected')).toEqual(['15']);

    const cleared = setup({ defaultValue: day(15), allowDeselect: true, onChange });
    cleared.click(15);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(cleared.marked('data-selected')).toEqual([]);
  });

  test('a controlled value; it opens on the month of the value', () => {
    const [value, setValue] = createSignal<Date | null>(createDay(2026, 11, 24));
    const onChange = vi.fn();
    const { getByRole, marked } = setup({
      defaultDate: undefined,
      get value() {
        return value();
      },
      onChange,
    });

    expect(getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
    expect(marked('data-selected')).toEqual(['24']);
    fireEvent.click(getByRole('button', { name: 'Friday, December 25, 2026' }));
    flush();
    expect(onChange).toHaveBeenCalledWith(createDay(2026, 11, 25));
    expect(marked('data-selected')).toEqual(['24']);
    setValue(createDay(2026, 11, 31));
    flush();
    expect(marked('data-selected')).toEqual(['31']);
  });

  test('a controlled null is no day, even with a defaultValue', () => {
    const { marked } = setup({ value: null, defaultValue: day(5) });
    expect(marked('data-selected')).toEqual([]);
  });

  test('keeps getDayProps and onDayClick, and the other Calendar props', () => {
    const onDayClick = vi.fn();
    const { cell, click, marked, getAllByRole } = setup({
      getDayProps: (date) => ({ disabled: date.getDate() === 13 }),
      onDayClick,
      numberOfColumns: 2,
      minDate: day(5),
    });

    expect(cell(13)).toBeDisabled();
    expect(cell(4)).toBeDisabled();
    expect(getAllByRole('grid')).toHaveLength(2);
    click(14);
    expect(onDayClick).toHaveBeenCalledWith(day(14), expect.any(MouseEvent));
    expect(marked('data-selected')).toEqual(['14']);
  });
});

describe('<DatePicker />: several days', () => {
  test('each click adds a day or takes it away', () => {
    const onChange = vi.fn();
    const { click, marked, container } = setup<'multiple'>({ type: 'multiple', defaultValue: [day(2)], onChange });

    expect(container.querySelector('.slp-calendar')).toHaveAttribute('data-type', 'multiple');
    click(15);
    expect(onChange).toHaveBeenLastCalledWith([day(2), day(15)]);
    click(20);
    click(2);
    expect(onChange).toHaveBeenLastCalledWith([day(15), day(20)]);
    expect(marked('data-selected')).toEqual(['15', '20']);
  });
});

describe('<DatePicker />: a range', () => {
  test('the first click starts it, the second ends it, in either order; a third starts again', () => {
    const onChange = vi.fn();
    const { click, marked } = setup<'range'>({ type: 'range', onChange });

    click(15);
    expect(onChange).toHaveBeenLastCalledWith([day(15), null]);
    expect(marked('data-selected')).toEqual(['15']);
    click(12);
    expect(onChange).toHaveBeenLastCalledWith([day(12), day(15)]);
    expect(marked('data-in-range')).toEqual(['12', '13', '14', '15']);
    expect(marked('data-first-in-range')).toEqual(['12']);
    expect(marked('data-last-in-range')).toEqual(['15']);
    expect(marked('data-selected')).toEqual(['12', '15']);
    click(20);
    expect(onChange).toHaveBeenLastCalledWith([day(20), null]);
    expect(marked('data-in-range')).toEqual([]);
  });

  test('a second click on the start clears it, or ends a one-day range with allowSingleDateInRange', () => {
    const onChange = vi.fn();
    const cleared = setup<'range'>({ type: 'range', defaultValue: [day(15), null], onChange });
    cleared.click(15);
    expect(onChange).toHaveBeenLastCalledWith([null, null]);

    const single = setup<'range'>({ type: 'range', defaultValue: [day(15), null], allowSingleDateInRange: true, onChange });
    single.click(15);
    expect(onChange).toHaveBeenLastCalledWith([day(15), day(15)]);
    expect(single.marked('data-first-in-range')).toEqual(['15']);
    expect(single.marked('data-last-in-range')).toEqual(['15']);
  });

  test('with a start, the pointer or the focus previews the range; leaving clears it', () => {
    const { cell, marked, container } = setup<'range'>({ type: 'range', defaultValue: [day(15), null] });

    fireEvent.pointerOver(cell(18));
    flush();
    expect(marked('data-in-range')).toEqual(['15', '16', '17', '18']);
    fireEvent.pointerOver(cell(13));
    flush();
    expect(marked('data-in-range')).toEqual(['13', '14', '15']);
    fireEvent.pointerLeave(container.querySelector('.slp-calendar')!);
    flush();
    expect(marked('data-in-range')).toEqual([]);
    cell(16).focus();
    flush();
    expect(marked('data-in-range')).toEqual(['15', '16']);
  });

  test('a range across months is marked in each', () => {
    const { marked } = setup<'range'>({
      type: 'range',
      numberOfColumns: 2,
      defaultValue: [day(30), day(2, 10)],
    });
    expect(marked('data-in-range')).toEqual(['30', '31', '1', '2']);
  });

  test('a controlled range', () => {
    const [value, setValue] = createSignal<[Date | null, Date | null]>([day(5), day(7)]);
    const { marked } = setup<'range'>({
      type: 'range',
      get value() {
        return value();
      },
    });
    expect(marked('data-in-range')).toEqual(['5', '6', '7']);
    setValue([day(20), null]);
    flush();
    expect(marked('data-in-range')).toEqual([]);
    expect(marked('data-selected')).toEqual(['20']);
  });
});

describe('<DatePicker />: updates', () => {
  test('a choice re-runs only the days it changes', async () => {
    const { cell } = setup({ defaultValue: day(10) });
    cell(10).focus();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(cell(15));
        flush();
      },
      { scenario: 'date-picker-choose' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('a moving range preview re-runs only the days it changes', async () => {
    const { cell } = setup<'range'>({ type: 'range', defaultValue: [day(5), null] });
    fireEvent.pointerOver(cell(10));
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.pointerOver(cell(11));
        flush();
      },
      { scenario: 'date-picker-preview' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(8);
  });
});

describe('<DatePicker />: accessibility and SSR', () => {
  test.each([
    ['one day', { defaultValue: day(15) }],
    ['a range', { type: 'range' as const, defaultValue: [day(12), day(16)] as [Date, Date] }],
  ])('has no axe violations: %s', async (_, props) => {
    const { container } = setup(props as Partial<DatePickerProps<DatePickerType>>);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['single', 'multiple', 'range'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./date-picker.fixtures.tsx', name);
  });
});
