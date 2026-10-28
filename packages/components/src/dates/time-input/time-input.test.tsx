import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { TimeInput, type TimeInputProps } from './time-input';

function setup(props: Partial<TimeInputProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <form data-testid="form">
        <TimeInput label="Time" onChange={onChange} {...props} />
      </form>
    </SlopkitUi>
  ));
  flush();
  // The label ends with an asterisk when required.
  const field = () => result.getByLabelText(/^Time/) as HTMLInputElement;
  const type = (value: string) => {
    fireEvent.input(field(), { target: { value } });
    flush();
  };
  return { ...result, field, type, onChange };
}

describe('<TimeInput />', () => {
  test("a labelled time input in an Input's box, minutes by default", () => {
    const { field, container } = setup({ class: 'mine', defaultValue: '09:30' });

    expect(container.querySelector('.slp-time-input')).toHaveClass('mine');
    expect(field()).toHaveAttribute('type', 'time');
    expect(field()).toHaveAttribute('step', '60');
    expect(field()).toHaveValue('09:30');
    expect(field().closest('.slp-input')).toBeInTheDocument();
  });

  test('withSeconds, minTime and maxTime set the step and the limits', () => {
    const { field } = setup({ withSeconds: true, minTime: '08:00', maxTime: '18:00' });
    expect(field()).toHaveAttribute('step', '1');
    expect(field()).toHaveAttribute('min', '08:00');
    expect(field()).toHaveAttribute('max', '18:00');
  });

  test('a change calls onChange with the time; an incomplete time is empty', () => {
    const { type, onChange } = setup();
    type('14:05');
    expect(onChange).toHaveBeenLastCalledWith('14:05');
    type('');
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal('10:00');
    const { field, type, onChange } = setup({
      get value() {
        return value();
      },
    });
    type('11:00');
    expect(onChange).toHaveBeenCalledWith('11:00');
    setValue('12:15');
    flush();
    expect(field()).toHaveValue('12:15');
  });

  test('name submits the time; required, disabled and readOnly go to the input', () => {
    const { getByTestId, field, unmount } = setup({ name: 'time', defaultValue: '09:30', required: true, readOnly: true });
    expect(new FormData(getByTestId('form') as HTMLFormElement).get('time')).toBe('09:30');
    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute('readonly');
    unmount();
    expect(setup({ disabled: true }).field()).toBeDisabled();
  });

  test('a change has no diagnostics', async () => {
    const { type } = setup();
    const { artifact } = await captureArtifact(() => type('14:05'), { scenario: 'time-input' });
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('has no axe violations', async () => {
    const { container } = setup({ defaultValue: '09:30', description: 'Local time' });
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('hydrates the server render', async () => {
    await expectHydration('./time-input.fixtures.tsx', 'fields');
  });
});
