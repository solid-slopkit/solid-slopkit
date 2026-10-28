import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { type JSX } from '@solidjs/web';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Slider } from './slider';

const renderIn = (ui: () => JSX.Element) => render(() => <SlopkitUi>{ui()}</SlopkitUi>);

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
}

describe('<Slider /> in a browser', () => {
  test('a press on the track jumps there; dragging follows the pointer; letting go reports the end', async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { getByRole, container } = renderIn(() => (
      <div style={{ width: '300px' }}>
        <Slider label="Volume" onChange={onChange} onChangeEnd={onChangeEnd} />
      </div>
    ));
    const track = container.querySelector('[data-slot="slider-track"]')!;
    const rect = track.getBoundingClientRect();
    const y = rect.top + rect.height / 2;

    pointer(track, 'pointerdown', rect.left + rect.width * 0.25, y);
    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '25');
    expect(getByRole('slider')).toHaveFocus();
    pointer(track, 'pointermove', rect.left + rect.width * 0.6, y);
    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '60');
    pointer(track, 'pointermove', rect.left + rect.width * 2, y);
    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
    pointer(track, 'pointerup', rect.left + rect.width * 2, y);

    expect(onChange).toHaveBeenLastCalledWith(100);
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenCalledWith(100);
  });

  test('the thumb is centered on its value, over the track', () => {
    const { getByRole, container } = renderIn(() => (
      <div style={{ width: '300px' }}>
        <Slider label="Volume" defaultValue={50} />
      </div>
    ));
    const track = container.querySelector('[data-slot="slider-track"]')!.getBoundingClientRect();
    const thumb = getByRole('slider').getBoundingClientRect();

    expect(thumb.left + thumb.width / 2).toBeCloseTo(track.left + track.width / 2, 0);
    expect(thumb.top + thumb.height / 2).toBeCloseTo(track.top + track.height / 2, 0);
  });

  test('the value bubble shows on keyboard focus', async () => {
    const { getByRole } = renderIn(() => <Slider label="Volume" defaultValue={50} />);
    const bubble = getByRole('slider').querySelector('[data-slot="slider-value-label"]')!;

    expect(getComputedStyle(bubble).opacity).toBe('0');
    await userEvent.tab();
    await expect.poll(() => getComputedStyle(bubble).opacity).toBe('1');
  });
});
