import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import type { SlopColor } from '../../../core';
import { Button } from '../../button';
import { Chip } from './chip';

describe('<Chip /> in a browser', () => {
  test('a pill as tall as a Button of the same size', () => {
    const { container, getByRole } = render(() => (
      <>
        <Chip size="sm">Tag</Chip>
        <Button size="sm">Go</Button>
      </>
    ));
    const chip = container.querySelector('.slp-chip')!.getBoundingClientRect();

    expect(chip.height).toBe(getByRole('button').getBoundingClientRect().height);
    expect(parseFloat(getComputedStyle(container.querySelector('.slp-chip')!).borderTopLeftRadius)).toBeGreaterThanOrEqual(
      chip.height / 2,
    );
  });

  test('Tab focuses it with a ring around the pill; Space toggles it', async () => {
    const { container, getByRole } = render(() => <Chip>Tag</Chip>);

    await userEvent.tab();
    expect(getByRole('checkbox')).toHaveFocus();
    expect(getComputedStyle(container.firstElementChild!).outlineStyle).toBe('solid');
    await userEvent.keyboard(' ');
    expect(getByRole('checkbox')).toBeChecked();
  });

  test('in a single-choice group, arrow keys move the choice', async () => {
    const { getByRole } = render(() => (
      <Chip.Group aria-label="Size" defaultValue="s">
        <Chip value="s">Small</Chip>
        <Chip value="m">Medium</Chip>
      </Chip.Group>
    ));

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(getByRole('radio', { name: 'Medium' })).toBeChecked();
  });

  test('the check shows only while it is on', async () => {
    const { container, getByRole } = render(() => <Chip>Tag</Chip>);
    const icon = container.querySelector('[data-slot="chip-icon"]')!;

    expect(getComputedStyle(icon).display).toBe('none');
    await userEvent.click(container.firstElementChild!);
    expect(getByRole('checkbox')).toBeChecked();
    expect(getComputedStyle(icon).display).toBe('block');
  });

  test('an outline chip that is on has a border of half its color, over the faint border of one that is off', () => {
    const { container } = render(() => (
      <>
        <Chip variant="outline" color="primary" defaultChecked>
          On
        </Chip>
        <Chip variant="outline" color="primary">
          Off
        </Chip>
      </>
    ));
    const [on, off] = [...container.querySelectorAll('.slp-chip')].map((el) => getComputedStyle(el).borderTopColor);

    expect(on).toMatch(/\/ 0\.5\)$/);
    expect(off).toMatch(/\/ 0\.2\)$/);
  });

  test('chips wrap in a group', () => {
    const { container } = render(() => (
      <div style={{ width: '160px' }}>
        <Chip.Group multiple aria-label="Tags">
          <For each={['One', 'Two', 'Three', 'Four']}>{(tag) => <Chip value={tag}>{tag}</Chip>}</For>
        </Chip.Group>
      </div>
    ));
    const tops = new Set(Array.from(container.querySelectorAll('.slp-chip')).map((chip) => chip.getBoundingClientRect().top));

    expect(tops.size).toBeGreaterThan(1);
  });

  test('every variant and color stays readable on and off, in both color schemes', async () => {
    const colors: SlopColor[] = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'];
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <Chip>Off</Chip>
          <For each={['soft', 'outline'] as const}>
            {(variant) => (
              <For each={colors}>
                {(color) => (
                  <Chip variant={variant} color={color} defaultChecked>
                    {`${variant} ${color}`}
                  </Chip>
                )}
              </For>
            )}
          </For>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${scheme}: ${n.html.slice(0, 80)}`))).toEqual([]);
      unmount();
    }
  });
});
