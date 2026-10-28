import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import type { YearPickerType } from '../year-picker';
import { YearPickerInput, type YearPickerInputProps } from './year-picker-input';

const year = (number: number) => createDay(number, 0, 1);

function setup<Type extends YearPickerType = 'default'>(props: Partial<YearPickerInputProps<Type>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <form data-testid="form">
        <YearPickerInput label="Year" defaultDate={year(2020)} {...(props as YearPickerInputProps<Type>)} />
      </form>
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('button', { name: 'Year' });
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="year-picker-input-dropdown"]');
  const open = () => {
    fireEvent.click(field());
    flush();
  };
  // jsdom doesn't count a popover as shown.
  const cell = (number: number) => result.getByRole('button', { name: String(number), hidden: true });
  // Closing after a choice waits for the click to finish.
  const choose = async (number: number) => {
    fireEvent.click(cell(number));
    flush();
    await Promise.resolve();
    flush();
  };
  const shown = () => result.container.querySelector('[data-slot="year-picker-input-value"]')!.textContent;
  const submitted = (name: string) => new FormData(result.getByTestId('form') as HTMLFormElement).get(name);
  return { ...result, field, dropdown, open, cell, choose, shown, submitted };
}

describe('<YearPickerInput />', () => {
  test('a labelled button that shows the year by the locale, or the placeholder', () => {
    const empty = setup({ placeholder: 'Pick a year', class: 'mine' });
    expect(empty.container.querySelector('.slp-year-picker-input')).toHaveClass('mine');
    expect(empty.field()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(empty.shown()).toBe('Pick a year');
    empty.unmount();

    expect(setup({ defaultValue: year(2026) }).shown()).toBe('2026');
    expect(
      setup({ defaultValue: year(2026), locale: 'ja-JP-u-ca-japanese', valueFormat: { era: 'short', year: 'numeric' } }).shown(),
    ).toBe('令和8年');
    expect(setup<'multiple'>({ type: 'multiple', defaultValue: [year(2021), year(2024)] }).shown()).toBe('2021, 2024');
    expect(setup<'range'>({ type: 'range', defaultValue: [year(2022), year(2026)] }).shown()).toBe('2022 – 2026');
  });

  test('a click opens the years of the decade in a dialog; choosing one sets it as its January 1 and closes', async () => {
    const onChange = vi.fn();
    const { open, field, dropdown, choose, shown, getByRole } = setup({ onChange });

    open();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(dropdown()!.querySelector('.slp-year-picker')).toBeInTheDocument();
    expect(getByRole('grid', { name: '2020 – 2029', hidden: true })).toBeInTheDocument();
    await choose(2027);
    expect(onChange).toHaveBeenCalledWith(year(2027));
    expect(shown()).toBe('2027');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('several years keep it open; a range closes on its end', async () => {
    const multiple = setup<'multiple'>({ type: 'multiple' });
    multiple.open();
    await multiple.choose(2021);
    await multiple.choose(2023);
    expect(multiple.field()).toHaveAttribute('aria-expanded', 'true');
    multiple.unmount();

    const range = setup<'range'>({ type: 'range' });
    range.open();
    await range.choose(2028);
    expect(range.field()).toHaveAttribute('aria-expanded', 'true');
    await range.choose(2022);
    expect(range.field()).toHaveAttribute('aria-expanded', 'false');
    expect(range.shown()).toBe('2022 – 2028');
  });

  test('YearPicker props go to the calendar: limits and getYearProps', () => {
    const { open, cell } = setup({ minDate: year(2023), getYearProps: (date) => ({ disabled: date.getFullYear() === 2025 }) });
    open();
    expect(cell(2022)).toBeDisabled();
    expect(cell(2025)).toBeDisabled();
    expect(cell(2024)).not.toBeDisabled();
  });

  test('name submits ISO years; clearable empties it', () => {
    const one = setup({ name: 'year', defaultValue: year(2026), clearable: true });
    expect(one.submitted('year')).toBe('2026');
    fireEvent.click(one.getByRole('button', { name: 'Clear' }));
    flush();
    expect(one.submitted('year')).toBe('');
    one.unmount();
    const range = setup<'range'>({ type: 'range', name: 'term', defaultValue: [year(2022), year(2026)] });
    expect(range.submitted('term')).toBe('2022,2026');
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
        await choose(2027);
      },
      { scenario: 'year-picker-input' },
    );
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, open } = setup({ defaultValue: year(2026), clearable: true });
    expect((await axe.run(container)).violations).toEqual([]);
    open();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('hydrates the server render', async () => {
    await expectHydration('./year-picker-input.fixtures.tsx', 'fields');
  });
});
