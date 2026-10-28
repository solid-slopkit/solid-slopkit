import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { DateTimePicker, type DateTimePickerProps } from './date-time-picker';

const moment = (day: number, hours = 0, minutes = 0, seconds = 0) => new Date(2026, 9, day, hours, minutes, seconds);

function setup(props: Partial<DateTimePickerProps> = {}, locale?: string) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi locale={locale}>
      <form data-testid="form">
        <DateTimePicker label="When" defaultDate={moment(1)} onChange={onChange} {...props} />
      </form>
      <button type="button">After</button>
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('button', { name: 'When' });
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="date-time-picker-dropdown"]');
  const open = () => {
    fireEvent.click(field());
    flush();
  };
  const shown = () => result.container.querySelector('[data-slot="date-time-picker-value"]')!.textContent;
  // jsdom doesn't count a popover as shown.
  const day = (date: number) => {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(moment(date));
    return result.getByRole('button', { name: `${weekday}, October ${date}, 2026`, hidden: true });
  };
  const segment = (name: string) => result.getByRole('spinbutton', { name, hidden: true });
  const type = (name: string, text: string) => {
    for (const data of text) {
      segment(name).dispatchEvent(
        new InputEvent('beforeinput', { data, inputType: 'insertText', bubbles: true, cancelable: true }),
      );
      flush();
    }
  };
  const submitted = () => new FormData(result.getByTestId('form') as HTMLFormElement).get('when');
  return { ...result, field, dropdown, open, shown, day, segment, type, submitted, onChange };
}

describe('<DateTimePicker />: the field', () => {
  test('a labelled button showing the date and time by the locale, or the placeholder', () => {
    const empty = setup({ placeholder: 'Pick a date and time', class: 'mine' });
    expect(empty.container.querySelector('.slp-date-time-picker')).toHaveClass('mine');
    expect(empty.field()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(empty.field()).toHaveAttribute('data-empty');
    expect(empty.shown()).toBe('Pick a date and time');
    empty.unmount();

    expect(setup({ defaultValue: moment(15, 9, 30) }).shown()).toBe('Oct 15, 2026, 9:30 AM');
    expect(setup({ defaultValue: moment(15, 9, 30, 15), withSeconds: true }).shown()).toBe('Oct 15, 2026, 9:30:15 AM');
    expect(setup({ defaultValue: moment(15, 21, 45) }, 'de-DE').shown()).toBe('15.10.2026, 21:45');
    expect(
      setup({
        defaultValue: moment(15, 21, 45),
        valueFormat: { dateStyle: 'short', timeStyle: 'short', hourCycle: 'h23' },
      }).shown(),
    ).toBe('10/15/26, 21:45');
  });

  test('name submits a local date and time; clearable empties it', () => {
    const { submitted, getByRole, onChange, shown } = setup({ name: 'when', defaultValue: moment(5, 9, 5), clearable: true });
    expect(submitted()).toBe('2026-10-05T09:05');
    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(submitted()).toBe('');
    expect(shown()).toBe('');
  });
});

describe('<DateTimePicker />: the dropdown', () => {
  test('a click opens a calendar, a time and a done button in a dialog named by the label', () => {
    const { open, field, dropdown, getByRole } = setup({ defaultValue: moment(15, 9, 30) });
    open();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(dropdown()).toHaveAttribute('aria-labelledby', getByRole('dialog', { hidden: true }).getAttribute('aria-labelledby')!);
    expect(dropdown()!.querySelector('.slp-date-picker')).toBeInTheDocument();
    // The slot names the whole time picker; its group of segments stays the Input's control.
    expect(dropdown()!.querySelector('[data-slot="date-time-picker-time"]')).toHaveClass('slp-time-picker');
    expect(getByRole('group', { name: 'Time', hidden: true })).toHaveAttribute('data-slot', 'input-control');
    expect(getByRole('button', { name: 'Done', hidden: true })).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: 'Hours', hidden: true })).toHaveValue('09');
  });

  test('a chosen day keeps the time; a chosen time keeps the day; the dropdown stays open', () => {
    const { open, day, type, field, onChange } = setup({ defaultValue: moment(15, 9, 30), timePickerProps: { format: '24h' } });
    open();
    fireEvent.click(day(20));
    flush();
    expect(onChange).toHaveBeenLastCalledWith(moment(20, 9, 30));
    type('Hours', '14');
    type('Minutes', '05');
    expect(onChange).toHaveBeenLastCalledWith(moment(20, 14, 5));
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('with no value, a day starts at midnight, or at a time chosen before it', () => {
    const midnight = setup();
    midnight.open();
    fireEvent.click(midnight.day(20));
    flush();
    expect(midnight.onChange).toHaveBeenLastCalledWith(moment(20, 0, 0));
    midnight.unmount();

    const held = setup({ timePickerProps: { format: '24h' } });
    held.open();
    held.type('Hours', '18');
    held.type('Minutes', '30');
    expect(held.onChange).not.toHaveBeenCalled();
    fireEvent.click(held.day(22));
    flush();
    expect(held.onChange).toHaveBeenLastCalledWith(moment(22, 18, 30));
  });

  test('withSeconds adds them to the time picker and the value', () => {
    const { open, type, onChange } = setup({
      defaultValue: moment(15, 9, 30),
      withSeconds: true,
      timePickerProps: { format: '24h' },
    });
    open();
    type('Seconds', '42');
    expect(onChange).toHaveBeenLastCalledWith(moment(15, 9, 30, 42));
  });

  test('Done closes it; DatePicker props go to the calendar', async () => {
    const { open, getByRole, field, day } = setup({ minDate: moment(10) });
    open();
    expect(day(9)).toBeDisabled();
    fireEvent.click(getByRole('button', { name: 'Done', hidden: true }));
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<Date | null>(moment(3, 8, 0));
    const { open, day, shown, onChange } = setup({
      get value() {
        return value();
      },
    });
    open();
    fireEvent.click(day(20));
    flush();
    expect(onChange).toHaveBeenLastCalledWith(moment(20, 8, 0));
    expect(shown()).toBe('Oct 3, 2026, 8:00 AM');
    setValue(moment(25, 17, 15));
    flush();
    expect(shown()).toBe('Oct 25, 2026, 5:15 PM');
  });

  test('disabled and readOnly keep it closed', () => {
    const readOnly = setup({ readOnly: true, defaultValue: moment(15, 9, 0), clearable: true });
    readOnly.open();
    expect(readOnly.field()).toHaveAttribute('aria-expanded', 'false');
    expect(readOnly.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    readOnly.unmount();
    expect(setup({ disabled: true }).field()).toBeDisabled();
  });
});

describe('<DateTimePicker />: updates, accessibility and SSR', () => {
  test('opening and choosing have no diagnostics', async () => {
    const { open, day, type } = setup({ defaultValue: moment(15, 9, 30), timePickerProps: { format: '24h' } });
    const { artifact } = await captureArtifact(
      () => {
        open();
        fireEvent.click(day(20));
        flush();
        type('Minutes', '45');
      },
      { scenario: 'date-time-picker' },
    );
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, open } = setup({ defaultValue: moment(15, 9, 30), clearable: true });
    expect((await axe.run(container)).violations).toEqual([]);
    open();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test.each(['fields', 'german'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./date-time-picker.fixtures.tsx', name);
  });
});
