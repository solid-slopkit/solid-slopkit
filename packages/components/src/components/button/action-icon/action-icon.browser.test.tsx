import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { ActionIcon } from './action-icon';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

describe('<ActionIcon /> in a browser', () => {
  test('a square at every size, as tall as a Button of that size, with the icon centered', () => {
    const { getAllByRole } = render(() => (
      <>
        <ActionIcon label="xs" size="xs">
          <Icon />
        </ActionIcon>
        <ActionIcon label="md">
          <Icon />
        </ActionIcon>
        <ActionIcon label="xl" size="xl">
          <Icon />
        </ActionIcon>
      </>
    ));
    const heights = getAllByRole('button').map((button) => {
      const box = button.getBoundingClientRect();
      const icon = button.querySelector('svg')!.getBoundingClientRect();
      expect(box.width).toBe(box.height);
      expect(icon.left - box.left).toBeCloseTo(box.right - icon.right, 0);
      expect(icon.top - box.top).toBeCloseTo(box.bottom - icon.bottom, 0);
      return box.height;
    });

    expect(heights).toEqual([24, 32, 48]);
  });

  test('circle is round', () => {
    const { getByRole } = render(() => (
      <ActionIcon label="Add" shape="circle">
        <Icon />
      </ActionIcon>
    ));

    expect(parseFloat(getComputedStyle(getByRole('button')).borderTopLeftRadius)).toBeGreaterThanOrEqual(16);
  });

  test('ghost, without a color, is transparent and in the color of the text around it', () => {
    const { getByRole } = render(() => (
      <p style={{ color: 'rgb(10, 120, 30)' }}>
        <ActionIcon label="Edit">
          <Icon />
        </ActionIcon>
      </p>
    ));
    const css = getComputedStyle(getByRole('button'));

    expect(css.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(css.color).toBe('rgb(10, 120, 30)');
  });

  test('Tab reaches it; Enter and Space press it', async () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <ActionIcon label="Edit" onClick={onClick}>
        <Icon />
      </ActionIcon>
    ));

    await userEvent.tab();
    expect(getByRole('button', { name: 'Edit' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
