import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Burger } from './burger';

const lines = (button: HTMLElement) => button.querySelector<HTMLElement>('[data-slot="burger-lines"]')!;

describe('<Burger /> in a browser', () => {
  test('closed: three lines of the text color, centered in a square', () => {
    const { getByRole } = render(() => (
      <p style={{ color: 'rgb(10, 120, 30)' }}>
        <Burger />
      </p>
    ));
    const button = getByRole('button');
    const box = button.getBoundingClientRect();
    const middle = lines(button);
    const top = getComputedStyle(middle, '::before');
    const bottom = getComputedStyle(middle, '::after');
    const rect = middle.getBoundingClientRect();

    expect(box.width).toBe(box.height);
    expect(getComputedStyle(middle).backgroundColor).toBe('rgb(10, 120, 30)');
    expect(top.backgroundColor).toBe('rgb(10, 120, 30)');
    expect(rect.left - box.left).toBeCloseTo(box.right - rect.right, 0);
    expect(rect.top - box.top).toBeCloseTo(box.bottom - rect.bottom, 0);
    // The outer lines sit above and below the middle one, the same distance away.
    expect(parseFloat(top.translate.split(' ')[1])).toBeLessThan(0);
    expect(parseFloat(bottom.translate.split(' ')[1])).toBe(-parseFloat(top.translate.split(' ')[1]));
  });

  test('opened: the middle line fades and the outer two cross', async () => {
    const { getByRole } = render(() => <Burger defaultOpened />);
    const middle = lines(getByRole('button'));

    expect(getComputedStyle(middle).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(middle, '::before').rotate).toBe('45deg');
    expect(getComputedStyle(middle, '::after').rotate).toBe('-45deg');
  });

  test('the lines grow with size', () => {
    const { getAllByRole } = render(() => (
      <>
        <Burger size="xs" label="Small" />
        <Burger size="xl" label="Large" />
      </>
    ));
    const [small, large] = getAllByRole('button').map((button) => lines(button).getBoundingClientRect().width);

    expect(large).toBeGreaterThan(small);
  });

  test('Tab reaches it; Enter and Space toggle it', async () => {
    const { getByRole } = render(() => <Burger />);

    await userEvent.tab();
    expect(getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });
});
