import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { MultiSelect, type MultiSelectData, type MultiSelectProps } from './multi-select';

const fruits: MultiSelectData = [
  'Apple',
  'Banana',
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date', disabled: true },
];

function setup(props: Partial<MultiSelectProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <MultiSelect label="Fruit" data={fruits} placeholder="Pick some" onChange={onChange} {...props} />
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('combobox', { name: 'Fruit' }) as HTMLInputElement;
  const key = (key: string) => {
    fireEvent.keyDown(field(), { key });
    flush();
  };
  const type = (value: string) => {
    fireEvent.input(field(), { target: { value } });
    flush();
  };
  const pills = () =>
    [...result.container.querySelectorAll('[data-slot="multi-select-pill"] [data-slot="pill-label"]')].map(
      (pill) => pill.textContent,
    );
  const options = () => result.queryAllByRole('option', { hidden: true }).map((option) => option.textContent);
  const option = (text: string) => result.getByRole('option', { name: text, hidden: true });
  const active = () => {
    const id = field().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : undefined;
  };
  return { ...result, field, key, type, pills, options, option, active, onChange };
}

describe('<MultiSelect />', () => {
  test('a labelled text combobox in a pills box, closed, with the placeholder while empty', () => {
    const { field, container } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-multi-select')).toHaveClass('mine');
    expect(container.querySelector('[data-slot="pills-input-box"]')).toContainElement(field());
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveAttribute('aria-autocomplete', 'list');
    expect(field()).toHaveAttribute('placeholder', 'Pick some');
  });

  test('the values show as pills with their labels; the placeholder goes', () => {
    const { pills, field } = setup({ defaultValue: ['Apple', 'cherry'] });

    expect(pills()).toEqual(['Apple', 'Cherry']);
    expect(field()).not.toHaveAttribute('placeholder');
  });

  test('Enter on an option adds it and keeps it open; again takes it out', () => {
    const { field, key, pills, active, option, onChange } = setup();

    key('ArrowDown');
    key('ArrowDown');
    expect(active()).toBe('Banana');
    key('Enter');
    expect(onChange).toHaveBeenLastCalledWith(['Banana'], [{ value: 'Banana', label: 'Banana', disabled: false }]);
    expect(pills()).toEqual(['Banana']);
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(option('Banana')).toHaveAttribute('aria-selected', 'true');
    expect(active()).toBe('Banana');

    key('Enter');
    expect(onChange).toHaveBeenLastCalledWith([], []);
    expect(pills()).toEqual([]);
  });

  test('the listbox is multiselectable and named by the label', () => {
    const { key, getByRole } = setup();
    key('ArrowDown');

    expect(getByRole('listbox', { name: 'Fruit', hidden: true })).toHaveAttribute('aria-multiselectable', 'true');
  });

  test('typing filters with the first match active; choosing clears the search', () => {
    const { field, type, key, options, active, pills } = setup();

    type('an');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(options()).toEqual(['Banana']);
    expect(active()).toBe('Banana');
    key('Enter');

    expect(pills()).toEqual(['Banana']);
    expect(field()).toHaveValue('');
    expect(options()).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);
    expect(active()).toBe('Banana');
  });

  test('nothingFoundMessage when nothing matches; closing drops the search', () => {
    const { field, type, key, getByText } = setup({ nothingFoundMessage: 'No fruit' });

    type('zz');
    expect(getByText('No fruit')).toBeDefined();
    key('Escape');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveValue('');
  });

  test('Backspace in the empty field takes out the last value', () => {
    const { key, pills, type, onChange } = setup({ defaultValue: ['Apple', 'Banana'] });

    type('a');
    key('Backspace');
    expect(onChange).not.toHaveBeenCalled();

    type('');
    key('Backspace');
    expect(pills()).toEqual(['Apple']);
    expect(onChange).toHaveBeenLastCalledWith(['Apple'], expect.anything());
  });

  test("a pill's remove button takes it out and focuses the field", () => {
    const { getByRole, pills, field } = setup({ defaultValue: ['Apple', 'Banana'] });

    fireEvent.click(getByRole('button', { name: 'Remove Apple' }));
    flush();
    expect(pills()).toEqual(['Banana']);
    expect(field()).toHaveFocus();
  });

  test('a press on the field opens it; on the box it toggles; not on a pill’s button', () => {
    const { field, container, getByRole } = setup({ defaultValue: ['Apple'] });
    const box = container.querySelector<HTMLElement>('[data-slot="pills-input-box"]')!;

    fireEvent.mouseDown(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.mouseDown(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.mouseDown(box);
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.mouseDown(getByRole('button', { name: 'Remove Apple' }));
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('a click on an option toggles it', () => {
    const { field, option, pills } = setup();
    fireEvent.mouseDown(field());
    flush();

    fireEvent.click(option('Cherry'));
    flush();
    expect(pills()).toEqual(['Cherry']);
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('hidePickedOptions leaves the selected ones out of the list', () => {
    const { key, options, active } = setup({ defaultValue: ['Apple'], hidePickedOptions: true });

    key('ArrowDown');
    expect(options()).toEqual(['Banana', 'Cherry', 'Date']);
    key('Enter');
    expect(options()).toEqual(['Cherry', 'Date']);
    expect(active()).toBe('Cherry');
  });

  test('maxValues disables the other options once reached', () => {
    const { key, option, onChange } = setup({ defaultValue: ['Apple'], maxValues: 1 });

    key('ArrowDown');
    expect(option('Banana')).toHaveAttribute('aria-disabled', 'true');
    expect(option('Apple')).not.toHaveAttribute('aria-disabled');
    key('Enter');
    expect(onChange).toHaveBeenLastCalledWith([], []);
    expect(option('Banana')).not.toHaveAttribute('aria-disabled');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<string[]>(['Apple']);
    const onChange = vi.fn();
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <MultiSelect label="Fruit" data={fruits} value={value()} onChange={onChange} />
      </SlopkitUi>
    ));
    flush();
    const field = getByRole('combobox', { name: 'Fruit' });
    const pills = () => [...container.querySelectorAll('[data-slot="pill-label"]')].map((pill) => pill.textContent);

    for (const key of ['ArrowDown', 'ArrowDown', 'Enter']) {
      fireEvent.keyDown(field, { key });
      flush();
    }
    expect(onChange).toHaveBeenCalledWith(['Apple', 'Banana'], expect.anything());
    expect(pills()).toEqual(['Apple']);

    setValue(['cherry', 'Kiwi']);
    flush();
    expect(pills()).toEqual(['Cherry', 'Kiwi']);
  });

  test('clearable: a clear button while there are values', () => {
    const { getByRole, queryByRole, pills, field, onChange } = setup({ defaultValue: ['Apple'], clearable: true });

    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();
    expect(onChange).toHaveBeenCalledWith([], []);
    expect(pills()).toEqual([]);
    expect(field()).toHaveFocus();
    expect(queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  test('name submits each value through a hidden input; required stays off the text field', () => {
    const { container, field } = setup({ name: 'fruit', defaultValue: ['Apple', 'cherry'], required: true });
    const hidden = [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')];

    expect(hidden.map((input) => [input.name, input.value])).toEqual([
      ['fruit', 'Apple'],
      ['fruit', 'cherry'],
    ]);
    expect(field().required).toBe(false);
    expect(field()).toHaveAttribute('aria-required', 'true');
  });

  test('disabled and readOnly: it does not open, and the pills cannot be removed', () => {
    const { field, key, getByRole } = setup({ disabled: true, defaultValue: ['Apple'] });
    expect(field()).toBeDisabled();
    expect(getByRole('button', { name: 'Remove Apple' })).toBeDisabled();
    key('ArrowDown');

    const readOnly = setup({ readOnly: true, label: 'Read only', defaultValue: ['Apple'] });
    const other = readOnly.getByRole('combobox', { name: 'Read only' });
    expect(other).toHaveAttribute('aria-readonly', 'true');
    expect(readOnly.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
    fireEvent.keyDown(other, { key: 'ArrowDown' });
    fireEvent.keyDown(other, { key: 'Backspace' });
    fireEvent.mouseDown(other);
    flush();
    expect(other).toHaveAttribute('aria-expanded', 'false');
    expect(readOnly.pills()).toEqual(['Apple']);
  });

  test('has no axe violations, closed and open', async () => {
    const { container, key } = setup({ defaultValue: ['Apple'], clearable: true, description: 'Your favorites' });
    expect((await axe.run(container)).violations).toEqual([]);
    key('ArrowDown');
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('moving has no diagnostics or waste', async () => {
    const { key } = setup();
    key('ArrowDown');

    const { artifact } = await captureArtifact(
      () => {
        key('ArrowDown');
        key('ArrowDown');
        key('ArrowUp');
      },
      { scenario: 'multi-select-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('choosing and searching have no diagnostics', async () => {
    const { key, type } = setup();
    key('ArrowDown');

    const { artifact } = await captureArtifact(
      () => {
        key('ArrowDown');
        key('Enter');
        type('ch');
        key('Enter');
        key('Backspace');
      },
      { scenario: 'multi-select-choose' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./multi-select.fixtures.tsx', 'multiSelects');
  });
});
