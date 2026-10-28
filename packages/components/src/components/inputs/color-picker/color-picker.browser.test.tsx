import { render } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { ColorPicker } from './color-picker';

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
}

describe('<ColorPicker /> in a browser', () => {
  test('dragging in the area sets saturation and brightness; on the hue slider, the hue', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { getByRole } = render(() => (
      <ColorPicker label="Color" defaultValue="#ff0000" onChange={onChange} onChangeEnd={onChangeEnd} />
    ));
    const area = getByRole('slider', { name: 'Saturation and brightness' });
    const rect = area.getBoundingClientRect();

    pointer(area, 'pointerdown', rect.left, rect.top);
    expect(onChange).toHaveBeenLastCalledWith('#ffffff');
    pointer(area, 'pointermove', rect.right, rect.bottom);
    pointer(area, 'pointerup', rect.right, rect.bottom);
    expect(onChange).toHaveBeenLastCalledWith('#000000');
    expect(onChangeEnd).toHaveBeenCalledTimes(1);

    pointer(area, 'pointerdown', rect.right, rect.top);
    pointer(area, 'pointerup', rect.right, rect.top);
    const hue = getByRole('slider', { name: 'Hue' });
    const line = hue.getBoundingClientRect();
    pointer(hue, 'pointerdown', line.left + line.width / 3, line.top + line.height / 2);
    pointer(hue, 'pointerup', line.left + line.width / 3, line.top + line.height / 2);

    expect(hue).toHaveAttribute('aria-valuenow', '120');
    expect(onChange).toHaveBeenLastCalledWith('#00ff00');
  });

  test('the area shows the hue; the thumb sits at the color', () => {
    const { getByRole } = render(() => <ColorPicker label="Color" defaultValue="#0000ff" />);
    const area = getByRole('slider', { name: 'Saturation and brightness' });
    const rect = area.getBoundingClientRect();
    const thumb = area.querySelector('[data-slot="color-picker-thumb"]')!.getBoundingClientRect();

    expect(getComputedStyle(area).backgroundColor).toBe('rgb(0, 0, 255)');
    expect(thumb.left + thumb.width / 2).toBeCloseTo(rect.right, 0);
    expect(thumb.top + thumb.height / 2).toBeCloseTo(rect.top, 0);
  });
});
