import { render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { Pill } from './pill';
import { TextInput } from '../text-input';
import type { SlopSize } from '../../../core';

const sizes: SlopSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

describe('<Pill /> in a browser', () => {
  test.each(sizes)('at %s it fits inside an input of the same size, with room around it', (size) => {
    const { getByText, getByRole } = render(() => (
      <>
        <TextInput size={size} aria-label="Field" />
        <Pill size={size} withRemoveButton>
          Apple
        </Pill>
      </>
    ));
    const pill = getByText('Apple').parentElement!.getBoundingClientRect();
    const input = getByRole('textbox').getBoundingClientRect();

    expect(input.height - pill.height).toBeGreaterThanOrEqual(6);
    expect(getByRole('button').getBoundingClientRect().height).toBeLessThan(pill.height);
  });

  test('sizes grow from xs to xl', () => {
    const { getAllByText } = render(() => <For each={sizes}>{(size) => <Pill size={size}>Pill</Pill>}</For>);
    const heights = getAllByText('Pill').map((label) => label.parentElement!.getBoundingClientRect().height);

    expect([...heights].sort((a, b) => a - b)).toEqual(heights);
    expect(new Set(heights).size).toBe(sizes.length);
  });

  test('a color tints the background and colors the text; without one it uses the base colors', () => {
    const { getByText, getByTestId } = render(() => (
      <div style={{ 'background-color': 'var(--slp-color-base-100)' }}>
        <Pill>Plain</Pill>
        <Pill color="primary">Primary</Pill>
        <div data-testid="custom" style={{ '--slp-pill-color': 'rgb(200, 0, 0)' }}>
          <Pill>Custom</Pill>
        </div>
        <span data-testid="base200" style={{ 'background-color': 'var(--slp-color-base-200)' }} />
        <span data-testid="primary" style={{ color: 'var(--slp-color-primary)' }} />
      </div>
    ));
    const look = (text: string) => getComputedStyle(getByText(text).parentElement!);
    const reference = (id: string) => getComputedStyle(getByTestId(id));

    expect(look('Plain').backgroundColor).toBe(reference('base200').backgroundColor);
    expect(look('Primary').color).toBe(reference('primary').color);
    // A 15% tint of the role.
    expect(look('Primary').backgroundColor).toContain('0.15');
    expect(look('Custom').color).toBe('rgb(200, 0, 0)');
    expect(look('Custom').backgroundColor).not.toBe(reference('base200').backgroundColor);
  });

  test('a long label truncates inside a narrow parent', () => {
    const { getByText } = render(() => (
      <div style={{ width: '100px' }}>
        <Pill withRemoveButton>A label far too long for the space it has</Pill>
      </div>
    ));
    const label = getByText(/far too long/);

    expect(label.parentElement!.getBoundingClientRect().width).toBeLessThanOrEqual(100);
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  });

  test('the remove button is reached with Tab and pressed with Enter and Space', async () => {
    const onRemove = vi.fn();
    const { getByRole } = render(() => (
      <Pill withRemoveButton onRemove={onRemove}>
        Apple
      </Pill>
    ));

    // The browser's own name computation: the button's aria-label, then the pill's text.
    await expect.element(page.getByRole('button', { name: 'Remove Apple', exact: true })).toBeInTheDocument();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Remove Apple' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(2);
  });
});
