import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { DateInput, type DateInputProps } from './date-input';

const day = (date: number, month = 9) => createDay(2026, month, date);

function setup(props: Partial<DateInputProps> = {}, locale?: string) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi locale={locale}>
      <form data-testid="form">
        <DateInput label="Day" onChange={onChange} {...props} />
      </form>
      <button type="button">After</button>
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('combobox', { name: 'Day' }) as HTMLInputElement;
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="date-input-dropdown"]');
  const type = (text: string) => {
    fireEvent.input(field(), { target: { value: text } });
    flush();
  };
  const leave = () => {
    fireEvent.focusOut(field(), { relatedTarget: result.getByText('After') });
    flush();
  };
  const open = () => {
    fireEvent.click(field());
    flush();
  };
  // jsdom doesn't count a popover as shown.
  const cell = (name: string) => result.getByRole('button', { name, hidden: true });
  return { ...result, field, dropdown, type, leave, open, cell, onChange };
}

describe('<DateInput />: typing', () => {
  test('a labelled combobox showing the day as numbers in the locale', () => {
    const { field, container } = setup({ defaultValue: day(15), class: 'mine', placeholder: 'MM/DD/YYYY' });

    expect(container.querySelector('.slp-date-input')).toHaveClass('mine');
    expect(field()).toHaveValue('10/15/2026');
    expect(field()).toHaveAttribute('placeholder', 'MM/DD/YYYY');
    expect(field()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveAttribute('autocomplete', 'off');
  });

  test('typing a day sets it at once; leaving the field writes it by the locale', () => {
    const { field, type, leave, onChange } = setup({ valueFormat: { dateStyle: 'medium' } });

    type('10/2');
    expect(onChange).not.toHaveBeenCalled();
    type('10/20/2026');
    expect(onChange).toHaveBeenLastCalledWith(day(20));
    expect(field()).toHaveValue('10/20/2026');
    leave();
    expect(field()).toHaveValue('Oct 20, 2026');
  });

  test('ISO days and the locale order are read; text that is no day changes nothing and goes on leaving', () => {
    const german = setup({ defaultValue: day(1) }, 'de-DE');
    expect(german.field()).toHaveValue('01.10.2026');
    german.type('15.10.2026');
    expect(german.onChange).toHaveBeenLastCalledWith(day(15));
    german.type('2026-10-16');
    expect(german.onChange).toHaveBeenLastCalledWith(day(16));
    german.type('31.02.2026');
    german.leave();
    expect(german.onChange).toHaveBeenCalledTimes(2);
    expect(german.field()).toHaveValue('16.10.2026');
  });

  test('days the calendar would not allow are not taken', () => {
    const { type, leave, field, onChange } = setup({
      defaultValue: day(15),
      minDate: day(10),
      maxDate: day(25),
      excludeDate: (date) => date.getDate() === 13,
    });
    type('10/5/2026');
    type('10/26/2026');
    type('10/13/2026');
    expect(onChange).not.toHaveBeenCalled();
    leave();
    expect(field()).toHaveValue('10/15/2026');
  });

  test('emptying the field clears the day; clearable adds a button for it', () => {
    const typed = setup({ defaultValue: day(15) });
    typed.type('');
    expect(typed.onChange).toHaveBeenLastCalledWith(null);
    typed.unmount();

    const { getByRole, field, onChange } = setup({ defaultValue: day(15), clearable: true });
    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(field()).toHaveValue('');
  });

  test('a year is taken while typing once it has four digits; a short year when the edit ends', () => {
    const { type, leave, field, onChange } = setup();
    type('10/20/2');
    type('10/20/20');
    type('10/20/202');
    expect(onChange).not.toHaveBeenCalled();
    type('10/20/2026');
    expect(onChange).toHaveBeenCalledTimes(1);
    type('10/21/26');
    expect(onChange).toHaveBeenCalledTimes(1);
    leave();
    expect(onChange).toHaveBeenLastCalledWith(day(21));
    expect(field()).toHaveValue('10/21/2026');
  });

  test('dateParser replaces how text is read', () => {
    const { type, onChange } = setup({ dateParser: (text) => (text === 'today' ? day(15) : null) });
    type('10/20/2026');
    expect(onChange).not.toHaveBeenCalled();
    type('today');
    expect(onChange).toHaveBeenLastCalledWith(day(15));
  });

  test('name submits the ISO day', () => {
    const { type, getByTestId } = setup({ name: 'day', defaultValue: day(5) });
    const submitted = () => new FormData(getByTestId('form') as HTMLFormElement).get('day');
    expect(submitted()).toBe('2026-10-05');
    type('');
    expect(submitted()).toBe('');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<Date | null>(day(3));
    const { field, type, leave, onChange } = setup({
      get value() {
        return value();
      },
    });
    type('10/20/2026');
    expect(onChange).toHaveBeenLastCalledWith(day(20));
    leave();
    expect(field()).toHaveValue('10/03/2026');
    setValue(day(25));
    flush();
    expect(field()).toHaveValue('10/25/2026');
  });
});

describe('<DateInput />: the calendar', () => {
  test('a click or ArrowDown opens a DatePicker on the month of the day, in a dialog named by the label', () => {
    const clicked = setup({ defaultValue: day(15) });
    clicked.open();
    expect(clicked.field()).toHaveAttribute('aria-expanded', 'true');
    expect(clicked.field()).toHaveAttribute('aria-controls', clicked.dropdown()!.id);
    expect(clicked.dropdown()).toHaveAttribute('aria-labelledby', clicked.getByText('Day').id);
    expect(clicked.getByRole('grid', { name: 'October 2026', hidden: true })).toBeInTheDocument();
    expect(clicked.cell('Thursday, October 15, 2026')).toHaveAttribute('data-selected');
    clicked.unmount();

    const keyed = setup();
    fireEvent.keyDown(keyed.field(), { key: 'ArrowDown' });
    flush();
    expect(keyed.field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('typing a day moves the open calendar to its month and marks it', () => {
    const { open, type, getByRole, cell } = setup({ defaultValue: day(15) });
    open();
    type('12/24/2026');
    expect(getByRole('grid', { name: 'December 2026', hidden: true })).toBeInTheDocument();
    expect(cell('Thursday, December 24, 2026')).toHaveAttribute('data-selected');
  });

  test('choosing a day sets it, writes it and closes', async () => {
    const { open, cell, field, onChange } = setup({ defaultValue: day(15) });
    open();
    fireEvent.click(cell('Tuesday, October 20, 2026'));
    flush();
    await Promise.resolve();
    flush();
    expect(onChange).toHaveBeenLastCalledWith(day(20));
    expect(field()).toHaveValue('10/20/2026');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('allowDeselect lets the chosen day clear it; DatePicker props go to the calendar', async () => {
    const { open, cell, onChange } = setup({ defaultValue: day(15), allowDeselect: true, minDate: day(10) });
    open();
    expect(cell('Friday, October 9, 2026')).toBeDisabled();
    fireEvent.click(cell('Thursday, October 15, 2026'));
    flush();
    await Promise.resolve();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test('Enter ends the edit and closes; focus leaving the field and the calendar closes it', () => {
    const { open, field, type, leave } = setup();
    open();
    type('10/2/2026');
    fireEvent.keyDown(field(), { key: 'Enter' });
    flush();
    expect(field()).toHaveValue('10/02/2026');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    open();
    leave();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('disabled and readOnly keep it closed', () => {
    const readOnly = setup({ readOnly: true, clearable: true, defaultValue: day(15) });
    readOnly.open();
    expect(readOnly.field()).toHaveAttribute('aria-expanded', 'false');
    expect(readOnly.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    readOnly.unmount();
    expect(setup({ disabled: true }).field()).toBeDisabled();
  });
});

describe('<DateInput />: updates, accessibility and SSR', () => {
  test('typing and choosing have no diagnostics', async () => {
    const { open, type, cell } = setup({ defaultValue: day(15) });
    const { artifact } = await captureArtifact(
      async () => {
        open();
        type('10/18/2026');
        fireEvent.click(cell('Tuesday, October 20, 2026'));
        flush();
        await Promise.resolve();
        flush();
      },
      { scenario: 'date-input' },
    );
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, open } = setup({ defaultValue: day(15), clearable: true });
    expect((await axe.run(container)).violations).toEqual([]);
    open();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test.each(['fields', 'german'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./date-input.fixtures.tsx', name);
  });
});
