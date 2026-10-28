import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { Select, type SelectData, type SelectProps } from './select';

const fruits: SelectData = [
  'Apple',
  'Banana',
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date', disabled: true },
];

function setup(props: Partial<SelectProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <Select label="Fruit" data={fruits} placeholder="Pick one" onChange={onChange} {...props} />
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('combobox', { name: 'Fruit' });
  const key = (key: string, init: KeyboardEventInit = {}) => {
    fireEvent.keyDown(field(), { key, ...init });
    flush();
  };
  const option = (text: string) => result.getByText(text, { selector: '[data-slot="select-option-label"]' }).parentElement!;
  const active = () => {
    const id = field().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : undefined;
  };
  return { ...result, field, key, option, active, onChange };
}

describe('<Select />', () => {
  test('a labelled button combobox that shows the placeholder, closed', () => {
    const { field, container } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-select')).toHaveClass('mine');
    expect(field().tagName).toBe('BUTTON');
    expect(field()).toHaveAttribute('type', 'button');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveTextContent('Pick one');
    expect(field().querySelector('[data-slot="select-value"]')).toHaveAttribute('data-placeholder', '');
  });

  test('ArrowDown opens it on the first option; Enter chooses the active one and closes', () => {
    const { field, key, active, onChange } = setup();

    key('ArrowDown');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('Apple');
    key('ArrowDown');
    key('ArrowDown');
    expect(active()).toBe('Cherry');
    key('Enter');

    expect(onChange).toHaveBeenCalledWith('cherry', { value: 'cherry', label: 'Cherry', disabled: false });
    expect(field()).toHaveTextContent('Cherry');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('opening starts on the selected option, which is marked selected; disabled ones are skipped', () => {
    const { key, active, option } = setup({ defaultValue: 'Banana' });

    key('Enter');
    expect(active()).toBe('Banana');
    expect(option('Banana')).toHaveAttribute('aria-selected', 'true');
    key('ArrowDown');
    key('ArrowDown');
    expect(active()).toBe('Apple');
    expect(option('Date')).toHaveAttribute('aria-disabled', 'true');
  });

  test('Space opens it, and chooses the active option', () => {
    const { field, key, onChange } = setup();

    key(' ');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    key('ArrowDown');
    key(' ');
    expect(onChange).toHaveBeenCalledWith('Banana', expect.objectContaining({ value: 'Banana' }));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('typing opens it on the first option that starts with what was typed', () => {
    const { field, key, active } = setup();

    key('c');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('Cherry');
  });

  test('a press toggles it, and opens it on the selected option; a click alone does not', () => {
    const { field, active } = setup({ defaultValue: 'cherry' });

    fireEvent.click(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseDown(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('Cherry');
    fireEvent.mouseDown(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('a click on an option chooses it', () => {
    const { field, option, onChange } = setup();
    fireEvent.mouseDown(field());
    flush();

    fireEvent.click(option('Apple'));
    flush();
    expect(onChange).toHaveBeenCalledWith('Apple', expect.objectContaining({ value: 'Apple' }));
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<string | null>('Apple');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Select label="Fruit" data={fruits} value={value()} onChange={onChange} />
      </SlopkitUi>
    ));
    flush();
    const field = getByRole('combobox', { name: 'Fruit' });

    for (const key of ['ArrowDown', 'ArrowDown', 'Enter']) {
      fireEvent.keyDown(field, { key });
      flush();
    }
    expect(onChange).toHaveBeenCalledWith('Banana', expect.anything());
    expect(field).toHaveTextContent('Apple');

    setValue(null);
    flush();
    expect(field).toHaveTextContent('');
  });

  test('choosing the selected option again keeps it, without a change, and closes', () => {
    const { field, key, onChange } = setup({ defaultValue: 'Apple' });

    key('Enter');
    key('Enter');
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveTextContent('Apple');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('groups are named by their heading', () => {
    const { getByRole, key } = setup({
      data: [
        { group: 'Fruit', items: ['Apple'] },
        { group: 'Vegetables', items: ['Leek'] },
      ],
    });
    key('ArrowDown');

    expect(getByRole('group', { name: 'Vegetables', hidden: true })).toBeDefined();
    expect(getByRole('listbox', { name: 'Fruit', hidden: true })).toBeDefined();
  });

  test('name submits the value through a hidden input', () => {
    const { container, key } = setup({ name: 'fruit', defaultValue: 'Apple' });
    const hidden = () => container.querySelector('input[type="hidden"]') as HTMLInputElement;

    expect(hidden()).toHaveAttribute('name', 'fruit');
    expect(hidden().value).toBe('Apple');
    key('ArrowDown');
    key('ArrowDown');
    key('Enter');
    expect(hidden().value).toBe('Banana');
  });

  test('disabled and readOnly: it does not open', () => {
    const { field, key } = setup({ disabled: true });
    expect(field()).toBeDisabled();

    const readOnly = setup({ readOnly: true, label: 'Read only' });
    const other = readOnly.getByRole('combobox', { name: 'Read only' });
    expect(other).toHaveAttribute('aria-readonly', 'true');
    fireEvent.keyDown(other, { key: 'ArrowDown' });
    fireEvent.mouseDown(other);
    flush();
    expect(other).toHaveAttribute('aria-expanded', 'false');
    key('ArrowDown');
  });

  test('has no axe violations, closed and open, and with an error', async () => {
    const { container, key } = setup({ defaultValue: 'Apple', description: 'Your favorite' });
    expect((await axe.run(container)).violations).toEqual([]);
    key('ArrowDown');
    expect((await axe.run(container)).violations).toEqual([]);

    const invalid = render(() => (
      <SlopkitUi>
        <Select label="City" data={['Oslo']} error="Required" />
      </SlopkitUi>
    ));
    expect((await axe.run(invalid.container)).violations).toEqual([]);
  });

  test('moving and choosing have no diagnostics or waste', async () => {
    const { key } = setup();
    key('ArrowDown');

    const { artifact } = await captureArtifact(
      () => {
        key('ArrowDown');
        key('ArrowDown');
        key('Enter');
      },
      { scenario: 'select-choose' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./select.fixtures.tsx', 'selects');
  });
});
