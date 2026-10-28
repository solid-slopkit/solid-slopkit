import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { ColorPicker } from './color-picker';

const key = (el: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
  fireEvent.keyDown(el, { key, ...init });
  flush();
};

describe('<ColorPicker />', () => {
  test('a group named by the label: a saturation area and a hue slider, no alpha for hex', () => {
    const { getByRole, queryByRole, container } = render(() => (
      <ColorPicker label="Brand color" defaultValue="#ff0000" class="mine" />
    ));

    expect(getByRole('group', { name: 'Brand color' })).toBeInTheDocument();
    const area = getByRole('slider', { name: 'Saturation and brightness' });
    expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%');
    expect(getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '0');
    expect(queryByRole('slider', { name: 'Alpha' })).toBeNull();
    expect(container.firstElementChild).toHaveClass('slp-color-picker', 'slp-input-wrapper', 'mine');
  });

  test('keys move each part and report the color in the format', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { getByRole } = render(() => (
      <ColorPicker label="Color" defaultValue="#ff0000" onChange={onChange} onChangeEnd={onChangeEnd} />
    ));

    key(getByRole('slider', { name: 'Hue' }), 'ArrowRight', { shiftKey: true });
    expect(getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '10');
    expect(onChange).toHaveBeenLastCalledWith('#ff2a00');

    key(getByRole('slider', { name: 'Saturation and brightness' }), 'Home');
    expect(onChange).toHaveBeenLastCalledWith('#ffffff');
    key(getByRole('slider', { name: 'Saturation and brightness' }), 'PageDown');
    expect(getByRole('slider', { name: 'Saturation and brightness' })).toHaveAttribute(
      'aria-valuetext',
      'Saturation 0%, brightness 90%',
    );
    expect(onChangeEnd).toHaveBeenLastCalledWith('#e6e6e6');
  });

  test('the hue stays put while the color is grey', () => {
    const { getByRole } = render(() => <ColorPicker label="Color" defaultValue="#00ff00" />);
    const area = getByRole('slider', { name: 'Saturation and brightness' });

    key(area, 'Home');
    key(area, 'End');

    expect(getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '120');
  });

  test('formats with alpha add the alpha slider', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <ColorPicker label="Overlay" format="rgba" defaultValue="rgba(0, 0, 255, 0.5)" onChange={onChange} />
    ));
    const alpha = getByRole('slider', { name: 'Alpha' });

    expect(alpha).toHaveAttribute('aria-valuenow', '50');
    key(alpha, 'ArrowLeft', { shiftKey: true });

    expect(onChange).toHaveBeenLastCalledWith('rgba(0, 0, 255, 0.4)');
  });

  test('swatches: buttons named by their color, pressed for the current one; a click picks it', () => {
    const onChangeEnd = vi.fn();
    const { getByRole } = render(() => (
      <ColorPicker label="Color" defaultValue="#ff0000" swatches={['#ff0000', '#0000ff']} onChangeEnd={onChangeEnd} />
    ));

    expect(getByRole('button', { name: '#ff0000' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(getByRole('button', { name: '#0000ff' }));
    flush();

    expect(onChangeEnd).toHaveBeenCalledWith('#0000ff');
    expect(getByRole('button', { name: '#0000ff' })).toHaveAttribute('aria-pressed', 'true');
    expect(getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '240');
  });

  test('controlled: a new value moves the picker', () => {
    const [value, setValue] = createSignal('#ff0000');
    const { getByRole } = render(() => <ColorPicker label="Color" value={value()} onChange={setValue} />);

    setValue('#00ff00');
    flush();

    expect(getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '120');
    expect(untrack(value)).toBe('#00ff00');
  });

  test('labels can be renamed; disabled takes the parts out of the tab order', () => {
    const { getByRole } = render(() => (
      <ColorPicker label="Color" format="hexa" disabled hueLabel="Tint" saturationLabel="Shade" alphaLabel="Opacity" />
    ));

    for (const name of ['Tint', 'Shade', 'Opacity']) {
      expect(getByRole('slider', { name })).toHaveAttribute('tabindex', '-1');
      expect(getByRole('slider', { name })).toHaveAttribute('aria-disabled', 'true');
    }
  });

  test('a key step updates it without diagnostics or waste', async () => {
    const { getByRole } = render(() => <ColorPicker label="Color" defaultValue="#ff0000" />);
    flush();
    const hue = getByRole('slider', { name: 'Hue' });

    const { artifact } = await captureArtifact(() => key(hue, 'ArrowRight'), { scenario: 'color-picker-step' });

    expect(hue).toHaveAttribute('aria-valuenow', '1');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(16);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <ColorPicker label="Brand color" defaultValue="#1971c2" />
        <ColorPicker label="Overlay" format="rgba" swatches={['#ff0000', '#00ff00']} />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./color-picker.fixtures.tsx', 'colorPickers');
  });
});
