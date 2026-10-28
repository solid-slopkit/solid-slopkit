import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import type { MonthPickerType } from '../month-picker';
import { MonthPickerInput, type MonthPickerInputProps } from './month-picker-input';

const month = (index: number, year = 2026) => createDay(year, index, 1);

function setup<Type extends MonthPickerType = 'default'>(props: Partial<MonthPickerInputProps<Type>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <form data-testid="form">
        <MonthPickerInput label="Month" defaultDate={month(0)} {...(props as MonthPickerInputProps<Type>)} />
      </form>
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('button', { name: 'Month' });
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="month-picker-input-dropdown"]');
  const open = () => {
    fireEvent.click(field());
    flush();
  };
  // jsdom doesn't count a popover as shown.
  const cell = (name: string) => result.getByRole('button', { name, hidden: true });
  // Closing after a choice waits for the click to finish.
  const choose = async (name: string) => {
    fireEvent.click(cell(name));
    flush();
    await Promise.resolve();
    flush();
  };
  const shown = () => result.container.querySelector('[data-slot="month-picker-input-value"]')!.textContent;
  const submitted = (name: string) => new FormData(result.getByTestId('form') as HTMLFormElement).get(name);
  return { ...result, field, dropdown, open, cell, choose, shown, submitted };
}

describe('<MonthPickerInput />', () => {
  test('a labelled button that shows the month by the locale, or the placeholder', () => {
    const empty = setup({ placeholder: 'Pick a month', class: 'mine' });
    expect(empty.container.querySelector('.slp-month-picker-input')).toHaveClass('mine');
    expect(empty.field()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(empty.shown()).toBe('Pick a month');
    empty.unmount();

    expect(setup({ defaultValue: month(9) }).shown()).toBe('October 2026');
    expect(setup({ defaultValue: month(9), valueFormat: { month: 'short', year: '2-digit' } }).shown()).toBe('Oct 26');
    expect(setup<'multiple'>({ type: 'multiple', defaultValue: [month(1), month(5)] }).shown()).toBe('February 2026, June 2026');
    expect(setup<'range'>({ type: 'range', defaultValue: [month(5), month(7)] }).shown()).toBe('June 2026 – August 2026');
  });

  test('a click opens the months of the year in a dialog; choosing one sets it as its first day and closes', async () => {
    const onChange = vi.fn();
    const { open, field, dropdown, choose, shown, getByRole } = setup({ onChange });

    open();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(dropdown()!.querySelector('.slp-month-picker')).toBeInTheDocument();
    expect(getByRole('grid', { name: '2026', hidden: true })).toBeInTheDocument();
    await choose('May 2026');
    expect(onChange).toHaveBeenCalledWith(month(4));
    expect(shown()).toBe('May 2026');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('several months keep it open; a range closes on its end', async () => {
    const multiple = setup<'multiple'>({ type: 'multiple' });
    multiple.open();
    await multiple.choose('March 2026');
    await multiple.choose('April 2026');
    expect(multiple.field()).toHaveAttribute('aria-expanded', 'true');
    multiple.unmount();

    const range = setup<'range'>({ type: 'range' });
    range.open();
    await range.choose('March 2026');
    expect(range.field()).toHaveAttribute('aria-expanded', 'true');
    await range.choose('June 2026');
    expect(range.field()).toHaveAttribute('aria-expanded', 'false');
    expect(range.shown()).toBe('March 2026 – June 2026');
  });

  test('MonthPicker props go to the calendar: limits, level, getMonthProps', () => {
    const { open, cell, container } = setup({
      minDate: createDay(2026, 2, 15),
      getMonthProps: (date) => ({ disabled: date.getMonth() === 6 }),
      defaultLevel: 'decade',
    });
    open();
    expect(container.ownerDocument.querySelector('.slp-month-picker')).toHaveAttribute('data-level', 'decade');
    fireEvent.click(cell('2026'));
    flush();
    expect(cell('February 2026')).toBeDisabled();
    expect(cell('July 2026')).toBeDisabled();
    expect(cell('March 2026')).not.toBeDisabled();
  });

  test('name submits ISO months; clearable empties it', () => {
    const one = setup({ name: 'month', defaultValue: month(9), clearable: true });
    expect(one.submitted('month')).toBe('2026-10');
    fireEvent.click(one.getByRole('button', { name: 'Clear' }));
    flush();
    expect(one.submitted('month')).toBe('');
    one.unmount();
    const range = setup<'range'>({ type: 'range', name: 'season', defaultValue: [month(5), month(7)] });
    expect(range.submitted('season')).toBe('2026-06,2026-08');
  });

  test('readOnly and disabled keep it closed', () => {
    const readOnly = setup({ readOnly: true });
    readOnly.open();
    expect(readOnly.field()).toHaveAttribute('aria-expanded', 'false');
    readOnly.unmount();
    expect(setup({ disabled: true }).field()).toBeDisabled();
  });

  test('opening and choosing have no diagnostics', async () => {
    const { open, choose } = setup({ closeOnChange: false });
    const { artifact } = await captureArtifact(
      async () => {
        open();
        await choose('May 2026');
      },
      { scenario: 'month-picker-input' },
    );
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, open } = setup({ defaultValue: month(9), clearable: true });
    expect((await axe.run(container)).violations).toEqual([]);
    open();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('hydrates the server render', async () => {
    await expectHydration('./month-picker-input.fixtures.tsx', 'fields');
  });
});
