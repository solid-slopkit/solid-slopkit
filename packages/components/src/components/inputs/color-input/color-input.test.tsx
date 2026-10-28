import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { ColorInput, type ColorInputProps } from './color-input';

function setup(props: Partial<ColorInputProps> = {}) {
  const onChange = vi.fn();
  const onChangeEnd = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <ColorInput label="Color" onChange={onChange} onChangeEnd={onChangeEnd} {...props} />
      <button type="button">After</button>
    </SlopkitUi>
  ));
  flush();
  const field = () =>
    result.getByRole(props.withPicker === false ? 'textbox' : 'combobox', { name: 'Color' }) as HTMLInputElement;
  const type = (value: string) => {
    fireEvent.input(field(), { target: { value } });
    flush();
  };
  const blur = (to: Element | null = null) => {
    fireEvent.focusOut(field(), { relatedTarget: to });
    flush();
  };
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="color-input-dropdown"]');
  const swatch = () => result.container.querySelector<HTMLElement>('[data-slot="color-input-swatch"]');
  return { ...result, field, type, blur, dropdown, swatch, onChange, onChangeEnd };
}

afterEach(() => {
  delete (window as { EyeDropper?: unknown }).EyeDropper;
});

describe('<ColorInput />', () => {
  test('a labelled text field with a swatch of the color, closed', () => {
    const { field, swatch, container } = setup({ class: 'mine', defaultValue: '#1971c2' });

    expect(container.querySelector('.slp-color-input')).toHaveClass('mine');
    expect(field()).toHaveValue('#1971c2');
    expect(field()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(swatch()!.style.getPropertyValue('--_swatch-color')).toBe('#1971c2');
    expect(swatch()).toHaveAttribute('aria-hidden', 'true');
  });

  test('a click opens the picker in a dialog named by the label; ArrowDown too', () => {
    const { field, dropdown, getByRole, getByText } = setup();

    fireEvent.click(field());
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(field()).toHaveAttribute('aria-controls', dropdown()!.id);
    expect(getByRole('dialog', { hidden: true })).toBe(dropdown());
    expect(dropdown()).toHaveAttribute('aria-labelledby', getByText('Color').id);
    expect(dropdown()!.querySelector('.slp-color-picker')).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    flush();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('typing a color sets it in the format; leaving the field shows it formatted', () => {
    const { field, type, blur, swatch, onChange, onChangeEnd } = setup();

    type('#f00');
    expect(onChange).toHaveBeenLastCalledWith('#ff0000');
    expect(field()).toHaveValue('#f00');
    expect(swatch()!.style.getPropertyValue('--_swatch-color')).toBe('#ff0000');

    type('rgb(0, 128, 0)');
    expect(onChange).toHaveBeenLastCalledWith('#008000');
    blur();
    expect(field()).toHaveValue('#008000');
    expect(onChangeEnd).toHaveBeenCalledWith('#008000');
  });

  test('text that is not a color changes nothing and goes on leaving the field', () => {
    const { field, type, blur, onChange } = setup({ defaultValue: '#123456' });

    type('#12');
    expect(onChange).not.toHaveBeenCalled();
    blur();
    expect(field()).toHaveValue('#123456');
  });

  test('emptying the field clears the color', () => {
    const { type, swatch, onChange } = setup({ defaultValue: '#123456' });

    type('');
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(swatch()!.style.getPropertyValue('--_swatch-color')).toBe('transparent');
  });

  test('format: rgba keeps alpha, hex drops it', () => {
    const rgba = setup({ format: 'rgba', label: 'Overlay' });
    fireEvent.input(rgba.getByRole('combobox', { name: 'Overlay' }), { target: { value: '#ff000080' } });
    flush();
    expect(rgba.onChange).toHaveBeenLastCalledWith('rgba(255, 0, 0, 0.5)');

    const hex = setup();
    hex.type('rgba(255, 0, 0, 0.5)');
    expect(hex.onChange).toHaveBeenLastCalledWith('#ff0000');
  });

  test('the picker changes the color, and the field follows', () => {
    const { field, getByRole, onChange } = setup({ defaultValue: '#ff0000' });
    fireEvent.click(field());
    flush();

    fireEvent.keyDown(getByRole('slider', { name: 'Hue', hidden: true }), { key: 'ArrowRight', shiftKey: true });
    flush();
    expect(onChange).toHaveBeenCalled();
    expect(field()).toHaveValue(onChange.mock.lastCall![0]);
    expect(field().value).not.toBe('#ff0000');
  });

  test('a swatch in the picker sets the color and ends the change', () => {
    const { field, getByRole, onChangeEnd } = setup({ swatches: ['#2f9e44'] });
    fireEvent.click(field());
    flush();

    fireEvent.click(getByRole('button', { name: '#2f9e44', hidden: true }));
    flush();
    expect(field()).toHaveValue('#2f9e44');
    expect(onChangeEnd).toHaveBeenCalledWith('#2f9e44');
  });

  test('focus that leaves the field and the picker closes it; focus into the picker does not', () => {
    const { field, blur, getByRole, getByText } = setup();
    fireEvent.click(field());
    flush();

    blur(getByRole('slider', { name: 'Hue', hidden: true }));
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    blur(getByText('After'));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('a ref gets the field, and the field keeps its own', () => {
    let ref: HTMLElement | undefined;
    const { field, blur, getByRole } = setup({ ref: (element: HTMLElement) => (ref = element) });

    expect(ref).toBe(field());
    fireEvent.click(field());
    flush();
    // Focus into the picker is inside the field's box, which the field's own ref finds.
    blur(getByRole('slider', { name: 'Hue', hidden: true }));
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal('#000000');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <SlopkitUi>
        <ColorInput label="Color" value={value()} onChange={onChange} />
      </SlopkitUi>
    ));
    flush();
    const field = getByRole('combobox', { name: 'Color' });

    fireEvent.input(field, { target: { value: '#fff' } });
    fireEvent.focusOut(field);
    flush();
    expect(onChange).toHaveBeenCalledWith('#ffffff');
    expect(field).toHaveValue('#000000');

    setValue('#abcdef');
    flush();
    expect(field).toHaveValue('#abcdef');
  });

  test('withPicker={false}: no dropdown and no popup', () => {
    const { field } = setup({ withPicker: false });

    expect(field()).not.toHaveAttribute('aria-haspopup');
    expect(field()).not.toHaveAttribute('role');
    expect(field()).not.toHaveAttribute('aria-expanded');
    fireEvent.click(field());
    flush();
    expect(document.querySelector('[data-slot="color-input-dropdown"]')).toBeNull();
  });

  test('hideSwatch, and sections that replace the swatch and the eye dropper', () => {
    const { swatch } = setup({ hideSwatch: true });
    expect(swatch()).toBeNull();

    const sections = setup({ label: 'Other', leftSection: <span>L</span>, rightSection: <span>R</span> });
    expect(sections.getAllByText('L')).toHaveLength(1);
    expect(sections.getAllByText('R')).toHaveLength(1);
  });

  test('the eye dropper button shows where the browser has one, and picks a color', async () => {
    const open = vi.fn(async () => ({ sRGBHex: '#e03131' }));
    (window as { EyeDropper?: unknown }).EyeDropper = class {
      open = open;
    };
    const { field, getByRole, onChangeEnd } = setup();

    fireEvent.click(getByRole('button', { name: 'Pick a color from the screen' }));
    await vi.waitFor(() => expect(field()).toHaveValue('#e03131'));
    expect(onChangeEnd).toHaveBeenCalledWith('#e03131');
  });

  test('no eye dropper button where the browser has none', () => {
    const { queryByRole } = setup();
    expect(queryByRole('button', { name: 'Pick a color from the screen' })).toBeNull();
  });

  test('disabled and readOnly: the picker does not open', () => {
    const { field } = setup({ disabled: true });
    expect(field()).toBeDisabled();

    const readOnly = setup({ readOnly: true, label: 'Read only' });
    const other = readOnly.getByRole('combobox', { name: 'Read only' });
    fireEvent.click(other);
    fireEvent.keyDown(other, { key: 'ArrowDown' });
    flush();
    expect(other).toHaveAttribute('aria-expanded', 'false');
  });

  test('has no axe violations, closed and open', async () => {
    const { container, field } = setup({ defaultValue: '#1971c2', description: 'Your brand color', swatches: ['#000000'] });
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(field());
    flush();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('typing and picking have no diagnostics', async () => {
    const { field, type, getByRole } = setup();

    const { artifact } = await captureArtifact(
      () => {
        type('#f00');
        type('#ff0000');
        fireEvent.click(field());
        flush();
        fireEvent.keyDown(getByRole('slider', { name: 'Hue', hidden: true }), { key: 'ArrowRight' });
        flush();
      },
      { scenario: 'color-input-type' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./color-input.fixtures.tsx', 'colorInputs');
  });
});
