import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { Radio } from './radio';

describe('<Radio /> in a browser', () => {
  test('Tab reaches the chosen radio; arrow keys move the choice, skipping disabled radios', async () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Radio.Group label="Plan" defaultValue="b" onChange={onChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
        <Radio value="c" label="C" disabled />
        <Radio value="d" label="D" />
      </Radio.Group>
    ));

    await userEvent.tab();
    expect(getByRole('radio', { name: 'B' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(getByRole('radio', { name: 'D' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('d');
    await userEvent.keyboard('{ArrowUp}');
    expect(getByRole('radio', { name: 'B' })).toBeChecked();
  });

  test('a round circle, filled with the role when chosen, with a dot', async () => {
    const { getByRole, getByTestId } = render(() => (
      <>
        <Radio.Group label="Plan" defaultValue="a">
          <Radio value="a" label="A" color="secondary" />
        </Radio.Group>
        <span data-testid="role" style={{ color: 'var(--slp-color-secondary)' }} />
      </>
    ));
    const radio = getByRole('radio');
    const css = getComputedStyle(radio);

    expect(css.borderTopLeftRadius).toBe('50%');
    expect(css.backgroundColor).toBe(getComputedStyle(getByTestId('role')).color);
    await expect.poll(() => getComputedStyle(radio.parentElement!.querySelector('svg')!).opacity).toBe('1');
  });

  test('labels, descriptions, errors and cards stay readable in both color schemes', async () => {
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <Radio.Group label="Plan" description="Pick one." error="Required." defaultValue="a">
            <Radio value="a" label="Monthly" description="Billed every month." />
            <Radio.Card value="b">Yearly</Radio.Card>
          </Radio.Group>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${scheme}: ${n.html.slice(0, 60)}`))).toEqual([]);
      unmount();
    }
  });
});
