import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { Rating } from './rating';

describe('<Rating /> in a browser', () => {
  test('a click on the left half of a star picks the half; on the right half, the whole', async () => {
    const onChange = vi.fn();
    const { container } = render(() => <Rating label="Rating" fractions={2} onChange={onChange} />);
    const third = container.querySelectorAll('[data-slot="rating-item"]')[2] as HTMLElement;
    const box = third.getBoundingClientRect();

    await userEvent.click(third, { position: { x: box.width * 0.25, y: box.height / 2 } });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
    await userEvent.click(third, { position: { x: box.width * 0.75, y: box.height / 2 } });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  test('Tab reaches the chosen star; arrow keys move the rating', async () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => <Rating label="Rating" defaultValue={2} onChange={onChange} />);

    await userEvent.tab();
    expect(getByRole('radio', { name: '2 stars' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  test('the filled part of a star is clipped to its fill', () => {
    const { container } = render(() => <Rating readOnly value={2.5} />);
    const third = container.querySelectorAll('[data-slot="rating-star"]')[2];

    expect(getComputedStyle(third.querySelector('svg:last-child')!).clipPath).toBe('inset(0px 50% 0px 0px)');
  });
});
