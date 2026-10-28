import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DatePickerInput, type DatePickerInputProps } from './date-picker-input';
import type { DatePickerType } from '../date-picker';

const day = (date: number, month = 9) => createDay(2026, month, date);

function setup<Type extends DatePickerType = 'default'>(props: Partial<DatePickerInputProps<Type>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <form data-testid="form">
        <DatePickerInput label="Day" defaultDate={day(1)} {...(props as DatePickerInputProps<Type>)} />
      </form>
      <button type="button">After</button>
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('button', { name: 'Day' });
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="date-picker-input-dropdown"]');
  const open = () => {
    fireEvent.click(field());
    flush();
  };
  const cell = (date: number) => {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(day(date));
    // jsdom doesn't count a popover as shown.
    return result.getByRole('button', { name: `${weekday}, October ${date}, 2026`, hidden: true });
  };
  // Closing after a choice waits for the click to finish.
  const choose = async (date: number) => {
    fireEvent.click(cell(date));
    flush();
    await Promise.resolve();
    flush();
  };
  const shown = () => result.container.querySelector('[data-slot="date-picker-input-value"]')!.textContent;
  return { ...result, field, dropdown, open, cell, choose, shown };
}

describe('<DatePickerInput />: the field', () => {
  test('a labelled button showing the placeholder, closed', () => {
    const { field, container, shown } = setup({ class: 'mine', placeholder: 'Pick a day' });

    expect(container.querySelector('.slp-date-picker-input')).toHaveClass('mine');
    expect(field()).toHaveAttribute('type', 'button');
    expect(field()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveAttribute('data-empty');
    expect(shown()).toBe('Pick a day');
    expect(field().querySelector('[data-placeholder]')).toBeInTheDocument();
  });

  test('shows the value in the locale, and describes the button with it', () => {
    const { field, shown } = setup({ defaultValue: day(15) });

    expect(shown()).toBe('Oct 15, 2026');
    expect(field()).not.toHaveAttribute('data-empty');
    const valueId = field().querySelector('[data-slot="date-picker-input-value"]')!.id;
    expect(field().getAttribute('aria-describedby')).toContain(valueId);
  });

  test('valueFormat, the locale prop, several days and a range with labelSeparator', () => {
    expect(setup({ defaultValue: day(15), valueFormat: { day: 'numeric', month: 'long' } }).shown()).toBe('October 15');
    expect(setup({ defaultValue: day(15), locale: 'de-DE' }).shown()).toBe('15.10.2026');
    expect(setup<'multiple'>({ type: 'multiple', defaultValue: [day(2), day(20)] }).shown()).toBe('Oct 2, 2026, Oct 20, 2026');
    expect(setup<'range'>({ type: 'range', defaultValue: [day(12), day(16)], labelSeparator: ' to ' }).shown()).toBe(
      'Oct 12, 2026 to Oct 16, 2026',
    );
    expect(setup<'range'>({ type: 'range', defaultValue: [day(12), null] }).shown()).toBe('Oct 12, 2026 – ');
  });

  test('name submits the days through a hidden input', () => {
    const one = setup({ name: 'day', defaultValue: day(5) });
    expect(new FormData(one.getByTestId('form') as HTMLFormElement).get('day')).toBe('2026-10-05');
    one.unmount();
    const range = setup<'range'>({ type: 'range', name: 'stay', defaultValue: [day(12), day(16)] });
    expect(new FormData(range.getByTestId('form') as HTMLFormElement).get('stay')).toBe('2026-10-12,2026-10-16');
    range.unmount();
    const none = setup({ name: 'day' });
    expect(new FormData(none.getByTestId('form') as HTMLFormElement).get('day')).toBe('');
  });

  test('clearable: a clear button while there is a value; it empties it and focuses the field', () => {
    const onChange = vi.fn();
    const { getByRole, queryByRole, field, shown } = setup({
      clearable: true,
      defaultValue: day(15),
      onChange,
      placeholder: 'None',
    });

    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();
    expect(onChange).toHaveBeenCalledWith(null);
    expect(shown()).toBe('None');
    expect(field()).toHaveFocus();
    expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  test('required marks the field without making the button required', () => {
    const { field } = setup({ required: true });
    expect(field()).not.toHaveAttribute('required');
    expect(field()).toHaveAttribute('aria-required', 'true');
  });
});

describe('<DatePickerInput />: the dropdown', () => {
  test('a click opens a calendar in a dialog named by the label; another closes it', () => {
    const { field, dropdown, open, getByRole, getByText } = setup();

    open();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(field()).toHaveAttribute('aria-controls', dropdown()!.id);
    expect(getByRole('dialog', { hidden: true })).toBe(dropdown());
    expect(dropdown()).toHaveAttribute('aria-labelledby', getByText('Day').id);
    expect(dropdown()!.querySelector('.slp-date-picker')).toBeInTheDocument();
    expect(getByRole('grid', { name: 'October 2026', hidden: true })).toBeInTheDocument();
    open();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('choosing a day sets it and closes', async () => {
    const onChange = vi.fn();
    const { open, choose, field, shown } = setup({ onChange });

    open();
    await choose(20);
    expect(onChange).toHaveBeenCalledWith(day(20));
    expect(shown()).toBe('Oct 20, 2026');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('closeOnChange={false} keeps it open', async () => {
    const { open, choose, field } = setup({ closeOnChange: false });
    open();
    await choose(20);
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('several days keep it open; a range closes on its end', async () => {
    const multiple = setup<'multiple'>({ type: 'multiple' });
    multiple.open();
    await multiple.choose(2);
    await multiple.choose(9);
    expect(multiple.field()).toHaveAttribute('aria-expanded', 'true');
    expect(multiple.shown()).toBe('Oct 2, 2026, Oct 9, 2026');
    multiple.unmount();

    const onChange = vi.fn();
    const range = setup<'range'>({ type: 'range', onChange });
    range.open();
    await range.choose(12);
    expect(range.field()).toHaveAttribute('aria-expanded', 'true');
    await range.choose(16);
    expect(onChange).toHaveBeenLastCalledWith([day(12), day(16)]);
    expect(range.field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('DatePicker props go to the calendar', () => {
    const onDayClick = vi.fn();
    const { open, cell, getAllByRole } = setup({ minDate: day(10), numberOfColumns: 2, onDayClick });
    open();
    expect(cell(9)).toBeDisabled();
    expect(getAllByRole('grid', { hidden: true })).toHaveLength(2);
    fireEvent.click(cell(12));
    expect(onDayClick).toHaveBeenCalledWith(day(12), expect.any(MouseEvent));
  });

  test('focus that leaves the field and the dropdown closes it; focus into the dropdown does not', () => {
    const { field, open, dropdown, getByText } = setup();
    open();
    fireEvent.focusOut(field(), { relatedTarget: dropdown()!.querySelector('button') });
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.focusOut(dropdown()!.querySelector('button')!, { relatedTarget: getByText('After') });
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('controlled: shows value, and only asks to change it', async () => {
    const [value, setValue] = createSignal<Date | null>(day(3));
    const onChange = vi.fn();
    const { open, choose, shown } = setup({
      get value() {
        return value();
      },
      onChange,
    });

    open();
    await choose(20);
    expect(onChange).toHaveBeenCalledWith(day(20));
    expect(shown()).toBe('Oct 3, 2026');
    setValue(day(25));
    flush();
    expect(shown()).toBe('Oct 25, 2026');
  });

  test('a controlled null is no day, even with a defaultValue', () => {
    const { field } = setup({ value: null, defaultValue: day(5) });
    expect(field()).toHaveAttribute('data-empty');
  });

  test('disabled and readOnly: it does not open', () => {
    const disabled = setup({ disabled: true });
    expect(disabled.field()).toBeDisabled();
    disabled.unmount();

    const readOnly = setup({ readOnly: true, defaultValue: day(15), clearable: true });
    readOnly.open();
    expect(readOnly.field()).toHaveAttribute('aria-expanded', 'false');
    expect(readOnly.field()).toHaveAttribute('aria-readonly', 'true');
    expect(readOnly.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });
});

describe('<DatePickerInput />: updates, accessibility and SSR', () => {
  test('opening and choosing have no diagnostics; a choice re-runs little', async () => {
    const { open, choose, cell } = setup({ closeOnChange: false, defaultValue: day(10) });

    const opening = await captureArtifact(
      () => {
        open();
      },
      { scenario: 'date-picker-input-open' },
    );
    expect(opening.artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);

    cell(10).focus();
    flush();
    const choosing = await captureArtifact(
      async () => {
        await choose(15);
      },
      { scenario: 'date-picker-input-choose' },
    );
    expect(choosing.artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(choosing.artifact).toStayWithinRerunBudget(16);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, open } = setup({ defaultValue: day(15), clearable: true });
    expect((await axe.run(container)).violations).toEqual([]);
    open();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test.each(['fields', 'german'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./date-picker-input.fixtures.tsx', name);
  });
});
