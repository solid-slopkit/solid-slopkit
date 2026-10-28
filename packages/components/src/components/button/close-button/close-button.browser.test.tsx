import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { CloseButton } from './close-button';

describe('<CloseButton /> in a browser', () => {
  test('a square with the X centered in it, sized with the button', () => {
    const { getAllByRole } = render(() => (
      <>
        <CloseButton size="xs" />
        <CloseButton />
        <CloseButton size="xl" />
      </>
    ));
    const sizes = getAllByRole('button').map((button) => {
      const box = button.getBoundingClientRect();
      const icon = button.querySelector('svg')!.getBoundingClientRect();
      expect(box.width).toBe(box.height);
      expect(icon.left - box.left).toBeCloseTo(box.right - icon.right, 0);
      expect(icon.top - box.top).toBeCloseTo(box.bottom - icon.bottom, 0);
      return [box.width, icon.width];
    });

    expect(sizes[0][0]).toBeLessThan(sizes[1][0]);
    expect(sizes[1][0]).toBeLessThan(sizes[2][0]);
    expect(sizes[0][1]).toBeLessThan(sizes[2][1]);
  });

  test('without a color, transparent and in the color of the text around it', () => {
    const { getByRole } = render(() => (
      <p style={{ color: 'rgb(10, 120, 30)' }}>
        <CloseButton />
      </p>
    ));
    const css = getComputedStyle(getByRole('button'));

    expect(css.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(css.color).toBe('rgb(10, 120, 30)');
  });

  test('Tab reaches it; Enter and Space press it', async () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => <CloseButton onClick={onClick} />);

    await userEvent.tab();
    expect(getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
