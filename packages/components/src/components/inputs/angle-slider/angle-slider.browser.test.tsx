import { render } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { AngleSlider } from './angle-slider';

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
}

describe('<AngleSlider /> in a browser', () => {
  test('a press on the dial points the angle at it: right is 90, bottom 180, left 270', () => {
    const onChangeEnd = vi.fn();
    const { getByRole } = render(() => <AngleSlider label="Direction" size="xl" onChangeEnd={onChangeEnd} />);
    const dial = getByRole('slider');
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    pointer(dial, 'pointerdown', rect.right - 2, cy);
    expect(dial).toHaveAttribute('aria-valuenow', '90');
    expect(dial).toHaveFocus();
    pointer(dial, 'pointermove', cx, rect.bottom - 2);
    expect(dial).toHaveAttribute('aria-valuenow', '180');
    pointer(dial, 'pointermove', rect.left + 2, cy);
    pointer(dial, 'pointerup', rect.left + 2, cy);

    expect(dial).toHaveAttribute('aria-valuenow', '270');
    expect(onChangeEnd).toHaveBeenCalledWith(270);
  });

  test('the thumb sits on the ring at the angle', () => {
    const { getByRole } = render(() => <AngleSlider label="Direction" defaultValue={90} size="xl" />);
    const dial = getByRole('slider');
    const rect = dial.getBoundingClientRect();
    const thumb = dial.querySelector('[data-slot="angle-slider-thumb"]')!.getBoundingClientRect();

    // Turned to 90°, the thumb's arm points right from the center.
    expect(thumb.left).toBeGreaterThan(rect.left + rect.width / 2 - 2);
    expect(Math.abs(thumb.top + thumb.height / 2 - (rect.top + rect.height / 2))).toBeLessThan(3);
  });
});
