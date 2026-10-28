import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { PinInput } from './pin-input';

const type = (field: HTMLElement, text: string) => {
  (field as HTMLInputElement).value = text;
  fireEvent.input(field);
  flush();
};
const values = (fields: HTMLElement[]) => fields.map((field) => (field as HTMLInputElement).value);

describe('<PinInput />', () => {
  test('a labelled group of four fields, each named, the first asking for a one-time code', () => {
    const { getByRole, getAllByRole, container } = render(() => <PinInput label="Code" class="mine" />);
    const fields = getAllByRole('textbox');

    expect(getByRole('group', { name: 'Code' })).toBeInTheDocument();
    expect(fields).toHaveLength(4);
    expect(fields[0]).toHaveAccessibleName('Character 1 of 4');
    expect(fields[0]).toHaveAttribute('autocomplete', 'one-time-code');
    expect(fields[1]).toHaveAttribute('autocomplete', 'off');
    expect(fields[0]).toHaveAttribute('inputmode', 'numeric');
    expect(container.firstElementChild).toHaveClass('slp-pin-input', 'slp-input-wrapper', 'mine');
  });

  test('typing fills a field and moves to the next; the code is reported, then completed', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { getAllByRole } = render(() => <PinInput label="Code" onChange={onChange} onComplete={onComplete} />);
    const fields = getAllByRole('textbox');

    fields[0].focus();
    type(fields[0], '1');
    expect(fields[1]).toHaveFocus();
    type(fields[1], '2');
    type(fields[2], '3');
    expect(onComplete).not.toHaveBeenCalled();
    type(fields[3], '4');

    expect(values(fields)).toEqual(['1', '2', '3', '4']);
    expect(onChange).toHaveBeenLastCalledWith('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  test('characters that do not belong are dropped: letters in a number code', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(() => <PinInput label="Code" onChange={onChange} />);
    const fields = getAllByRole('textbox');

    type(fields[0], 'a');

    expect(values(fields)[0]).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('alphanumeric takes letters; mask hides the characters', () => {
    const { getAllByLabelText } = render(() => <PinInput label="Voucher" type="alphanumeric" mask />);
    const fields = getAllByLabelText(/Character/);

    type(fields[0], 'x');

    expect(values(fields)[0]).toBe('x');
    expect(fields[0]).toHaveAttribute('type', 'password');
    expect(fields[0]).toHaveAttribute('inputmode', 'text');
  });

  test('a pasted or autofilled code spreads over the fields from where it lands', () => {
    const { getAllByRole } = render(() => <PinInput label="Code" length={6} />);
    const fields = getAllByRole('textbox');

    fireEvent.paste(fields[1], { clipboardData: { getData: () => '98-76x5' } });
    flush();
    expect(values(fields)).toEqual(['', '9', '8', '7', '6', '5']);

    type(fields[0], '123456');
    expect(values(fields)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(fields[5]).toHaveFocus();
  });

  test('Backspace in an empty field clears the one before and moves there; arrows move', () => {
    const { getAllByRole } = render(() => <PinInput label="Code" defaultValue="12" />);
    const fields = getAllByRole('textbox');

    fields[2].focus();
    fireEvent.keyDown(fields[2], { key: 'Backspace' });
    flush();
    expect(values(fields)).toEqual(['1', '', '', '']);
    expect(fields[1]).toHaveFocus();

    fireEvent.keyDown(fields[1], { key: 'ArrowLeft' });
    expect(fields[0]).toHaveFocus();
    fireEvent.keyDown(fields[0], { key: 'ArrowRight' });
    expect(fields[1]).toHaveFocus();
  });

  test('controlled: the fields follow value', () => {
    const [value, setValue] = createSignal('12');
    const onChange = vi.fn();
    const { getAllByRole } = render(() => <PinInput label="Code" value={value()} onChange={onChange} />);
    const fields = getAllByRole('textbox');

    type(fields[2], '3');
    expect(onChange).toHaveBeenCalledWith('123');
    expect(values(fields)).toEqual(['1', '2', '', '']);

    setValue('4321');
    flush();
    expect(values(fields)).toEqual(['4', '3', '2', '1']);
    expect(untrack(value)).toBe('4321');
  });

  test('name submits the whole code from a hidden input; error marks every field invalid', () => {
    const { container, getAllByRole } = render(() => (
      <PinInput label="PIN" name="pin" defaultValue="42" error="Wrong PIN." fieldLabel={(index) => `PIN digit ${index + 1}`} />
    ));
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]')!;

    expect(hidden).toHaveAttribute('name', 'pin');
    expect(hidden.value).toBe('42');
    for (const field of getAllByRole('textbox')) expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(getAllByRole('textbox')[0]).toHaveAccessibleName('PIN digit 1');
  });

  test('typing a character updates it without diagnostics or waste', async () => {
    const { getAllByRole } = render(() => <PinInput label="Code" />);
    flush();
    const fields = getAllByRole('textbox');

    const { artifact } = await captureArtifact(() => type(fields[0], '7'), { scenario: 'pin-input-type' });

    expect(values(fields)[0]).toBe('7');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <PinInput label="Code" description="We sent it by text message." />
        <PinInput label="PIN" length={6} mask name="pin" variant="soft" />
        <PinInput label="Voucher" type="alphanumeric" error="That code has expired." />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./pin-input.fixtures.tsx', 'pinInputs');
  });
});
