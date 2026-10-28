import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { TimePicker, type TimePickerProps } from './time-picker';

function setup(props: Partial<TimePickerProps> = {}, locale?: string) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi locale={locale}>
      <form data-testid="form">
        <TimePicker label="Time" onChange={onChange} {...props} />
      </form>
      <button type="button">After</button>
    </SlopkitUi>
  ));
  flush();
  // jsdom doesn't count a popover as shown.
  const segment = (name: string) => result.getByRole('spinbutton', { name, hidden: true }) as HTMLInputElement;
  const shown = () =>
    result
      .getAllByRole('spinbutton')
      .map((input) => (input as HTMLInputElement).value)
      .join(' ');
  // Typing goes through `beforeinput`, as on phones.
  const type = (name: string, text: string) => {
    for (const data of text) {
      segment(name).dispatchEvent(
        new InputEvent('beforeinput', { data, inputType: 'insertText', bubbles: true, cancelable: true }),
      );
      flush();
    }
  };
  const erase = (name: string) => {
    segment(name).dispatchEvent(
      new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true }),
    );
    flush();
  };
  const key = (name: string, keyName: string) => {
    fireEvent.keyDown(segment(name), { key: keyName });
    flush();
  };
  const leave = () => {
    fireEvent.focusOut(segment('Hours'), { relatedTarget: result.getByText('After') });
    flush();
  };
  return { ...result, segment, shown, type, erase, key, leave, onChange };
}

describe('<TimePicker />: the field', () => {
  test('a labelled group of spinbuttons, 12 hours with a day period in en-US', () => {
    const { getByRole, segment, shown, container } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-time-picker')).toHaveClass('mine');
    expect(getByRole('group', { name: 'Time' })).toBeInTheDocument();
    expect(shown()).toBe('-- -- --');
    expect(segment('Hours')).toHaveAttribute('aria-valuemin', '1');
    expect(segment('Hours')).toHaveAttribute('aria-valuemax', '12');
    expect(segment('Hours')).toHaveAttribute('aria-valuetext', 'Empty');
    expect(segment('Hours')).toHaveAttribute('inputmode', 'numeric');
    expect(segment('AM/PM')).toBeInTheDocument();
    // The label goes to the hours.
    expect(container.querySelector('label')).toHaveAttribute('for', segment('Hours').id);
  });

  test('the value written by the locale: 12 or 24 hours; format overrides it', () => {
    expect(setup({ defaultValue: '14:05' }).shown()).toBe('02 05 PM');
    expect(setup({ defaultValue: '14:05' }, 'de-DE').shown()).toBe('14 05');
    expect(setup({ defaultValue: '00:30', format: '12h' }, 'de-DE').shown()).toBe('12 30 AM');
    expect(setup({ defaultValue: '21:45', format: '24h' }).shown()).toBe('21 45');
    expect(setup({ defaultValue: '09:05:07', withSeconds: true, format: '24h' }).shown()).toBe('09 05 07');
  });

  test('spinbuttons tell their value', () => {
    const { segment } = setup({ defaultValue: '14:05' });
    expect(segment('Hours')).toHaveAttribute('aria-valuenow', '2');
    expect(segment('Minutes')).toHaveAttribute('aria-valuenow', '5');
    expect(segment('AM/PM')).toHaveAttribute('aria-valuetext', 'PM');
  });
});

describe('<TimePicker />: typing', () => {
  test('two digits fill a part; a whole time is the value', () => {
    const { type, shown, onChange } = setup({ format: '24h' });

    type('Hours', '1');
    expect(shown()).toBe('01 --');
    type('Hours', '4');
    expect(shown()).toBe('14 --');
    expect(onChange).not.toHaveBeenCalled();
    type('Minutes', '30');
    expect(onChange).toHaveBeenLastCalledWith('14:30');
  });

  test("a digit that can't start a two-digit number is the whole part", () => {
    const { type, shown, onChange } = setup({ format: '24h' });
    type('Hours', '7');
    type('Minutes', '8');
    expect(shown()).toBe('07 08');
    expect(onChange).toHaveBeenLastCalledWith('07:08');
  });

  test('12 hours: the day period from a or p, AM by default', () => {
    const { type, onChange } = setup();
    type('Hours', '9');
    type('Minutes', '45');
    expect(onChange).toHaveBeenLastCalledWith('09:45');
    type('AM/PM', 'p');
    expect(onChange).toHaveBeenLastCalledWith('21:45');
    type('Hours', '12');
    expect(onChange).toHaveBeenLastCalledWith('12:45');
    type('AM/PM', 'a');
    expect(onChange).toHaveBeenLastCalledWith('00:45');
  });

  test('erasing a part makes the time incomplete; the value is empty until it is whole again', () => {
    const { erase, type, shown, onChange } = setup({ defaultValue: '14:05', format: '24h' });
    erase('Minutes');
    expect(shown()).toBe('14 --');
    expect(onChange).toHaveBeenLastCalledWith('');
    type('Minutes', '10');
    expect(onChange).toHaveBeenLastCalledWith('14:10');
  });

  test('withSeconds adds a part to the value', () => {
    const { type, onChange } = setup({ withSeconds: true, format: '24h' });
    type('Hours', '08');
    type('Minutes', '15');
    expect(onChange).not.toHaveBeenCalled();
    type('Seconds', '42');
    expect(onChange).toHaveBeenLastCalledWith('08:15:42');
  });
});

describe('<TimePicker />: keys', () => {
  test('arrows step a part around the clock, by its step', () => {
    const { key, shown } = setup({ format: '24h', minutesStep: 15 });
    key('Hours', 'ArrowUp');
    expect(shown()).toBe('00 --');
    key('Hours', 'ArrowDown');
    expect(shown()).toBe('23 --');
    key('Minutes', 'ArrowUp');
    key('Minutes', 'ArrowUp');
    expect(shown()).toBe('23 15');
    key('Minutes', 'ArrowDown');
    key('Minutes', 'ArrowDown');
    expect(shown()).toBe('23 45');
  });

  test('arrows on the day period switch it; Home and End go to the ends of a part', () => {
    const { key, onChange } = setup({ defaultValue: '09:30' });
    key('AM/PM', 'ArrowUp');
    expect(onChange).toHaveBeenLastCalledWith('21:30');
    key('Minutes', 'End');
    expect(onChange).toHaveBeenLastCalledWith('21:59');
    key('Minutes', 'Home');
    expect(onChange).toHaveBeenLastCalledWith('21:00');
  });

  test('leaving the field brings the time inside minTime and maxTime', () => {
    const early = setup({ defaultValue: '07:00', minTime: '08:30', maxTime: '18:00', format: '24h' });
    early.leave();
    expect(early.onChange).toHaveBeenLastCalledWith('08:30');
    early.unmount();
    const late = setup({ defaultValue: '19:00', minTime: '08:30', maxTime: '18:00', format: '24h' });
    late.leave();
    expect(late.onChange).toHaveBeenLastCalledWith('18:00');
  });

  test('a ref, onMouseDown and onFocusOut reach the group, and it keeps its own', () => {
    let ref: HTMLElement | undefined;
    const onMouseDown = vi.fn();
    const onFocusOut = vi.fn();
    const { getByRole, segment, leave, onChange } = setup({
      ref: (element: HTMLElement) => (ref = element),
      onMouseDown,
      onFocusOut,
      defaultValue: '07:00',
      minTime: '08:30',
      format: '24h',
    });

    const group = getByRole('group', { name: 'Time' });
    expect(ref).toBe(group);
    fireEvent.mouseDown(group);
    flush();
    expect(onMouseDown).toHaveBeenCalledOnce();
    expect(segment('Hours')).toHaveFocus();
    leave();
    expect(onFocusOut).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith('08:30');
  });
});

describe('<TimePicker />: the dropdown', () => {
  test('withDropdown: a click opens a column of options per part; an option sets its part', () => {
    const { segment, getByRole, onChange } = setup({ withDropdown: true, defaultValue: '09:30', minutesStep: 5 });

    fireEvent.click(segment('Minutes'));
    flush();
    const dialog = getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('aria-labelledby');
    const hours = getByRole('listbox', { name: 'Hours', hidden: true });
    const minutes = getByRole('listbox', { name: 'Minutes', hidden: true });
    expect(hours.querySelectorAll('[role="option"]')).toHaveLength(12);
    expect(minutes.querySelectorAll('[role="option"]')).toHaveLength(12);
    expect(hours.querySelector('[aria-selected="true"]')).toHaveTextContent('09');
    fireEvent.click(minutes.querySelectorAll('[role="option"]')[9]);
    flush();
    expect(onChange).toHaveBeenLastCalledWith('09:45');
    fireEvent.click(getByRole('listbox', { name: 'AM/PM', hidden: true }).querySelectorAll('[role="option"]')[1]);
    flush();
    expect(onChange).toHaveBeenLastCalledWith('21:45');
  });

  test('without withDropdown a click opens nothing', () => {
    const { segment, queryByRole } = setup();
    fireEvent.click(segment('Hours'));
    flush();
    expect(queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });
});

describe('<TimePicker />: value and states', () => {
  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal('10:00');
    const { type, shown, onChange } = setup({
      format: '24h',
      get value() {
        return value();
      },
    });
    type('Minutes', '45');
    expect(onChange).toHaveBeenLastCalledWith('10:45');
    expect(shown()).toBe('10 00');
    setValue('12:15');
    flush();
    expect(shown()).toBe('12 15');
  });

  test('clearable empties the time; name submits it', () => {
    const { getByRole, getByTestId, shown, onChange } = setup({
      clearable: true,
      name: 'time',
      defaultValue: '09:30',
      format: '24h',
    });
    const submitted = () => new FormData(getByTestId('form') as HTMLFormElement).get('time');
    expect(submitted()).toBe('09:30');
    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(shown()).toBe('-- --');
    expect(submitted()).toBe('');
  });

  test('disabled disables the segments; readOnly ignores typing and arrows', () => {
    const disabled = setup({ disabled: true });
    expect(disabled.segment('Hours')).toBeDisabled();
    disabled.unmount();

    const { type, key, segment, onChange } = setup({ readOnly: true, defaultValue: '09:30' });
    type('Hours', '4');
    key('Minutes', 'ArrowUp');
    expect(onChange).not.toHaveBeenCalled();
    expect(segment('Hours')).toHaveAttribute('aria-readonly', 'true');
  });

  test('segmentLabels and dayPeriodLabels rename the parts', () => {
    const { segment, shown } = setup({
      defaultValue: '15:00',
      segmentLabels: { hours: 'Stunden', dayPeriod: 'Tageszeit' },
      dayPeriodLabels: ['vorm.', 'nachm.'],
    });
    expect(segment('Stunden')).toBeInTheDocument();
    expect(shown()).toBe('03 00 nachm.');
    expect(segment('Tageszeit')).toBeInTheDocument();
  });
});

describe('<TimePicker />: updates, accessibility and SSR', () => {
  test('typing has no diagnostics and re-runs little', async () => {
    const { type } = setup({ format: '24h' });
    type('Hours', '1');
    const { artifact } = await captureArtifact(
      () => {
        type('Hours', '4');
        type('Minutes', '30');
      },
      { scenario: 'time-picker-type' },
    );
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(40);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, segment } = setup({ defaultValue: '09:30', clearable: true, withDropdown: true, withSeconds: true });
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(segment('Hours'));
    flush();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test.each(['fields', 'german'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./time-picker.fixtures.tsx', name);
  });
});
