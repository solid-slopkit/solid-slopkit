import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import type { SlopSize } from '../../../core';
import { Button } from '../../button';
import { InputWrapper } from '../input-wrapper';
import { Input } from './input';

const sizes: SlopSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const boxOf = (control: HTMLElement) => control.closest<HTMLElement>('.slp-input')!;

describe('<Input /> in a browser', () => {
  test('as tall as a Button of the same size, at every size', () => {
    const { getAllByRole } = render(() => (
      <For each={sizes}>
        {(size) => (
          <div style={{ display: 'flex' }}>
            <Input aria-label={size} size={size} />
            <Button size={size}>Go</Button>
          </div>
        )}
      </For>
    ));
    const controls = getAllByRole('textbox');
    const buttons = getAllByRole('button');

    expect(controls.map((control) => boxOf(control).getBoundingClientRect().height)).toEqual(
      buttons.map((button) => button.getBoundingClientRect().height),
    );
  });

  test('the control fills the box between the sections; sections are square at least', () => {
    const { getByRole } = render(() => (
      <Input
        aria-label="Search"
        style={{ width: '300px' }}
        leftSection={<svg viewBox="0 0 24 24" />}
        rightSection={<span>USD</span>}
      />
    ));
    const control = getByRole('textbox');
    const box = boxOf(control).getBoundingClientRect();
    const left = boxOf(control).querySelector('[data-slot="input-left-section"]')!.getBoundingClientRect();
    const right = boxOf(control).querySelector('[data-slot="input-right-section"]')!.getBoundingClientRect();
    const rect = control.getBoundingClientRect();

    expect(left.width).toBe(left.height);
    expect(right.width).toBeGreaterThanOrEqual(right.height);
    expect(rect.left).toBe(left.right);
    expect(rect.right).toBe(right.left);
    expect(rect.height).toBe(box.height - 2);
  });

  test('focusing draws a ring of the primary color, or of the error color when invalid', async () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <Input aria-label="One" />
        <Input aria-label="Two" invalid />
        <span data-testid="primary" style={{ color: 'var(--slp-color-primary)' }} />
        <span data-testid="error" style={{ color: 'var(--slp-color-error)' }} />
      </>
    ));
    const [one, two] = getAllByRole('textbox');
    const color = (testId: string) => getComputedStyle(getByTestId(testId)).color;

    expect(getComputedStyle(boxOf(one)).boxShadow).toBe('none');

    await userEvent.click(one);
    await expect.poll(() => getComputedStyle(boxOf(one)).borderTopColor).toBe(color('primary'));
    expect(getComputedStyle(boxOf(one)).boxShadow).toContain(color('primary'));

    await userEvent.click(two);
    await expect.poll(() => getComputedStyle(boxOf(two)).borderTopColor).toBe(color('error'));
  });

  test('a click on a section focuses the control; Tab goes on to a section button, and back', async () => {
    const { getByRole, getByTestId } = render(() => (
      <Input
        aria-label="Search"
        leftSection={<svg data-testid="icon" viewBox="0 0 24 24" />}
        rightSection={<button type="button">Clear</button>}
      />
    ));

    await userEvent.click(getByTestId('icon'));
    expect(getByRole('textbox')).toHaveFocus();

    await userEvent.tab();
    expect(getByRole('button', { name: 'Clear' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(getByRole('textbox')).toHaveFocus();
  });

  test('a textarea grows the box, with its sections on the first line', () => {
    const { getByRole } = render(() => (
      <Input as="textarea" aria-label="Notes" rows={4} leftSection={<svg viewBox="0 0 24 24" />} />
    ));
    const control = getByRole('textbox');
    const box = boxOf(control).getBoundingClientRect();
    const section = boxOf(control).querySelector('[data-slot="input-left-section"]')!.getBoundingClientRect();

    expect(box.height).toBeGreaterThan(64);
    expect(section.height).toBe(30);
    expect(section.top).toBe(box.top + 1);
  });

  test('text, placeholder, description and error stay readable in every variant, in both color schemes', async () => {
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <For each={['outline', 'soft', 'ghost'] as const}>
            {(variant) => (
              <InputWrapper label={`Name (${variant})`} description="Help text." error="An error.">
                <Input variant={variant} value="Text" />
              </InputWrapper>
            )}
          </For>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${scheme}: ${n.html.slice(0, 60)}`))).toEqual([]);
      unmount();
    }
  });
});
