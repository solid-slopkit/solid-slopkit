import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { For } from 'solid-js';
import { describe, expect, test } from 'vitest';
import type { SlopSize } from '../../../core';
import { PasswordInput } from './password-input';

describe('<PasswordInput /> in a browser', () => {
  test('the toggle is square and fits inside the box at every size', () => {
    const sizes: SlopSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const { getAllByRole } = render(() => <For each={sizes}>{(size) => <PasswordInput label={size} size={size} />}</For>);

    for (const toggle of getAllByRole('button')) {
      const button = toggle.getBoundingClientRect();
      const box = toggle.closest('.slp-input')!.getBoundingClientRect();
      expect(button.width).toBe(button.height);
      expect(button.top).toBeGreaterThan(box.top);
      expect(button.bottom).toBeLessThan(box.bottom);
      expect(button.right).toBeLessThan(box.right);
    }
  });

  test('Tab goes from the password to the toggle; Space shows it; typing goes on in the field', async () => {
    const { getByRole, container } = render(() => <PasswordInput label="Password" />);
    const control = container.querySelector<HTMLInputElement>('[data-slot="input-control"]')!;

    await userEvent.click(control);
    await userEvent.keyboard('abc');
    await userEvent.tab();
    expect(getByRole('button')).toHaveFocus();
    await userEvent.keyboard(' ');

    expect(control).toHaveAttribute('type', 'text');
    expect(control.value).toBe('abc');
  });
});
