import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import type { SlopSize } from '../../../core';
import { Checkbox } from './checkbox';

const icon = (root: Element) => root.querySelector('[data-slot="checkbox-icon"]')!;

describe('<Checkbox /> in a browser', () => {
  test('the box grows with size and stays centered on the label line', () => {
    const sizes: SlopSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const { getAllByRole } = render(() => <For each={sizes}>{(size) => <Checkbox label={`Size ${size}`} size={size} />}</For>);
    const boxes = getAllByRole('checkbox').map((input) => {
      const box = input.getBoundingClientRect();
      const label = input.closest('.slp-checkbox')!.querySelector('label')!.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(input.closest('.slp-checkbox')!.querySelector('label')!).lineHeight);
      expect(box.width).toBe(box.height);
      expect(Math.abs(box.top + box.height / 2 - (label.top + lineHeight / 2))).toBeLessThanOrEqual(1);
      return box.width;
    });

    expect(boxes).toEqual([...boxes].sort((a, b) => a - b));
    expect(new Set(boxes).size).toBe(5);
  });

  test('checked: the box fills with the role and the check shows; unchecked it is hidden', async () => {
    const { getByRole, getByTestId, container } = render(() => (
      <>
        <Checkbox label="Terms" color="success" />
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));
    const input = getByRole('checkbox');

    expect(getComputedStyle(icon(container)).opacity).toBe('0');
    await userEvent.click(input);
    await expect.poll(() => getComputedStyle(input).backgroundColor).toBe(getComputedStyle(getByTestId('role')).color);
    await expect.poll(() => getComputedStyle(icon(container)).opacity).toBe('1');
  });

  test('Tab focuses it with a ring; Space toggles it', async () => {
    const { getByRole } = render(() => <Checkbox label="Terms" />);
    const input = getByRole('checkbox');

    await userEvent.tab();
    expect(input).toHaveFocus();
    expect(getComputedStyle(input).outlineStyle).toBe('solid');
    await userEvent.keyboard(' ');
    expect(input).toBeChecked();
  });

  test('a card shows a focus ring around it while its hidden checkbox has focus, and Space toggles it', async () => {
    const { getByRole, container } = render(() => <Checkbox.Card value="pro">Pro</Checkbox.Card>);
    const card = container.firstElementChild as HTMLElement;

    await userEvent.tab();
    expect(getByRole('checkbox')).toHaveFocus();
    expect(getComputedStyle(card).outlineStyle).toBe('solid');
    await userEvent.keyboard(' ');
    expect(getByRole('checkbox')).toBeChecked();
    expect(card).toHaveAttribute('data-checked', '');
  });

  test('labels, descriptions and errors stay readable in both color schemes', async () => {
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <Checkbox label="Terms" description="Read them first." error="You have to accept this." />
          <Checkbox.Group label="Toppings" description="Pick any.">
            <Checkbox value="a" label="Cheese" />
          </Checkbox.Group>
          <Checkbox.Card value="pro" defaultChecked>
            Pro plan
          </Checkbox.Card>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${scheme}: ${n.html.slice(0, 60)}`))).toEqual([]);
      unmount();
    }
  });
});
