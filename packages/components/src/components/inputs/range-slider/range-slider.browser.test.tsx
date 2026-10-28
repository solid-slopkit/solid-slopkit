import { render } from '@solidjs/testing-library';
import { type JSX } from '@solidjs/web';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { RangeSlider } from './range-slider';

const renderIn = (ui: () => JSX.Element) => render(() => <SlopkitUi>{ui()}</SlopkitUi>);

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
}

describe('<RangeSlider /> in a browser', () => {
  test('a press moves the nearest thumb; dragging past the other stops at it', () => {
    const onChange = vi.fn();
    const { getByRole, container } = renderIn(() => (
      <div style={{ width: '400px' }}>
        <RangeSlider label="Price" defaultValue={[20, 80]} onChange={onChange} />
      </div>
    ));
    const track = container.querySelector('[data-slot="slider-track"]')!;
    const rect = track.getBoundingClientRect();
    const y = rect.top + rect.height / 2;

    pointer(track, 'pointerdown', rect.left + rect.width * 0.7, y);
    expect(getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '70');
    expect(getByRole('slider', { name: 'Maximum' })).toHaveFocus();
    pointer(track, 'pointermove', rect.left + rect.width * 0.1, y);
    pointer(track, 'pointerup', rect.left + rect.width * 0.1, y);

    expect(getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '20');
    expect(onChange).toHaveBeenLastCalledWith([20, 20]);

    pointer(track, 'pointerdown', rect.left + rect.width * 0.05, y);
    pointer(track, 'pointerup', rect.left + rect.width * 0.05, y);
    expect(getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '5');
  });

  test('the bar spans the two thumbs', () => {
    const { getAllByRole, container } = renderIn(() => (
      <div style={{ width: '400px' }}>
        <RangeSlider label="Price" defaultValue={[25, 75]} />
      </div>
    ));
    const bar = container.querySelector('[data-slot="slider-bar"]')!.getBoundingClientRect();
    const [low, high] = getAllByRole('slider').map((thumb) => thumb.getBoundingClientRect());

    expect(bar.left).toBeCloseTo(low.left + low.width / 2, 0);
    expect(bar.right).toBeCloseTo(high.left + high.width / 2, 0);
  });
});
