import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { Autocomplete, type AutocompleteData, type AutocompleteProps } from './autocomplete';

const fruits: AutocompleteData = ['Apple', 'Apricot', 'Banana', { value: 'Blackberry', disabled: true }, 'Cherry'];

function setup(props: Partial<AutocompleteProps> = {}) {
  const onChange = vi.fn();
  const onOptionSubmit = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <Autocomplete label="Fruit" data={fruits} onChange={onChange} onOptionSubmit={onOptionSubmit} {...props} />
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('combobox', { name: 'Fruit' }) as HTMLInputElement;
  const type = (value: string) => {
    fireEvent.input(field(), { target: { value } });
    flush();
  };
  const key = (key: string) => {
    fireEvent.keyDown(field(), { key });
    flush();
  };
  const options = () => result.queryAllByRole('option', { hidden: true }).map((option) => option.textContent);
  const active = () => {
    const id = field().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : undefined;
  };
  return { ...result, field, type, key, options, active, onChange, onOptionSubmit };
}

describe('<Autocomplete />', () => {
  test('a labelled text combobox with list autocomplete, closed', () => {
    const { field, container } = setup({ class: 'mine', placeholder: 'Type' });

    expect(container.querySelector('.slp-autocomplete')).toHaveClass('mine');
    expect(field().tagName).toBe('INPUT');
    expect(field()).toHaveAttribute('aria-autocomplete', 'list');
    expect(field()).toHaveAttribute('autocomplete', 'off');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveAttribute('placeholder', 'Type');
  });

  test('typing is the value, and opens the suggestions that contain it, none active', () => {
    const { field, type, options, active, onChange } = setup();

    type('ap');
    expect(onChange).toHaveBeenLastCalledWith('ap');
    expect(field()).toHaveValue('ap');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(options()).toEqual(['Apple', 'Apricot']);
    expect(active()).toBeUndefined();
  });

  test('Enter without an active suggestion keeps the text and lets the key through', () => {
    const { field, type, onOptionSubmit } = setup();
    type('ap');

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    field().dispatchEvent(enter);
    flush();
    expect(enter.defaultPrevented).toBe(false);
    expect(onOptionSubmit).not.toHaveBeenCalled();
    expect(field()).toHaveValue('ap');
  });

  test('the arrows move to a suggestion, and Enter fills it in and closes', () => {
    const { field, type, key, active, onChange, onOptionSubmit } = setup();
    type('ap');

    key('ArrowDown');
    key('ArrowDown');
    expect(active()).toBe('Apricot');
    key('Enter');
    expect(onOptionSubmit).toHaveBeenCalledWith('Apricot');
    expect(onChange).toHaveBeenLastCalledWith('Apricot');
    expect(field()).toHaveValue('Apricot');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('no match closes it, and the arrows do not open it onto nothing', () => {
    const { field, type, key } = setup();
    type('ap');

    type('zz');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    key('ArrowDown');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('an empty field offers every suggestion: ArrowDown opens on the first; disabled ones are skipped', () => {
    const { key, options, active } = setup();

    key('ArrowDown');
    expect(options()).toEqual(['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry']);
    expect(active()).toBe('Apple');
    key('ArrowDown');
    key('ArrowDown');
    key('ArrowDown');
    expect(active()).toBe('Cherry');
  });

  test('a click opens it while there are suggestions', () => {
    const { field } = setup({ defaultValue: 'Ban' });

    fireEvent.click(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('limit caps the suggestions, across groups', () => {
    const { key, options } = setup({
      limit: 2,
      data: [
        { group: 'A', items: ['Apple'] },
        { group: 'B', items: ['Banana', 'Blueberry'] },
      ],
    });

    key('ArrowDown');
    expect(options()).toEqual(['Apple', 'Banana']);
  });

  test('controlled: shows value, and reports what was typed', () => {
    const [value, setValue] = createSignal('Ch');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Autocomplete label="Fruit" data={fruits} value={value()} onChange={onChange} />
      </SlopkitUi>
    ));
    flush();
    const field = getByRole('combobox', { name: 'Fruit' });

    expect(field).toHaveValue('Ch');
    fireEvent.input(field, { target: { value: 'Che' } });
    flush();
    expect(onChange).toHaveBeenCalledWith('Che');
    setValue('Banana');
    flush();
    expect(field).toHaveValue('Banana');
  });

  test('disabled and readOnly: no suggestions', () => {
    const { field, type } = setup({ readOnly: true });

    type('ap');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('other props, such as name, go to the input', () => {
    const { field } = setup({ name: 'fruit', defaultValue: 'Apple' });

    expect(field()).toHaveAttribute('name', 'fruit');
    expect(field()).toHaveValue('Apple');
  });

  test('has no axe violations, closed and open', async () => {
    const { container, type, key } = setup({ description: 'Any fruit' });
    expect((await axe.run(container)).violations).toEqual([]);
    type('a');
    key('ArrowDown');
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('typing and choosing have no diagnostics', async () => {
    const { type, key } = setup();

    const { artifact } = await captureArtifact(
      () => {
        type('a');
        type('ap');
        key('ArrowDown');
        key('Enter');
      },
      { scenario: 'autocomplete-type' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('moving through the suggestions has no waste', async () => {
    const { type, key } = setup();
    type('a');
    key('ArrowDown');

    const { artifact } = await captureArtifact(
      () => {
        key('ArrowDown');
        key('ArrowUp');
      },
      { scenario: 'autocomplete-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./autocomplete.fixtures.tsx', 'autocompletes');
  });
});
