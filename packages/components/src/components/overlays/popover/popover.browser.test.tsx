import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import type { JSX } from '@solidjs/web';
import { createSignal } from 'solid-js';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Popover, type PopoverProps } from './popover';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const box = (el: Element) => {
  const { left, top, right, bottom, width } = el.getBoundingClientRect();
  return {
    left: Math.round(left),
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
    width: Math.round(width),
  };
};

function setup(props: Partial<PopoverProps> = {}, content?: () => JSX.Element) {
  const result = render(() => (
    <SlopkitUi>
      <button>Before</button>
      <div style={{ padding: '120px 160px' }}>
        <Popover transition="none" {...props}>
          <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
          <Popover.Dropdown aria-label="Details">
            {content?.() ?? (
              <>
                <input aria-label="Name" />
                <button>Save</button>
              </>
            )}
          </Popover.Dropdown>
        </Popover>
      </div>
      <button>After</button>
    </SlopkitUi>
  ));
  const target = () => result.getByText('Open');
  const dropdown = () => result.queryByRole('dialog');
  return { ...result, target, dropdown };
}

describe('<Popover /> in a browser', () => {
  test('the target opens a non-modal dialog in the top layer, below it, with focus inside', async () => {
    const { target, dropdown, getByLabelText } = setup();
    expect(target()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(target()).toHaveAttribute('aria-expanded', 'false');
    expect(target()).not.toHaveAttribute('aria-controls');
    expect(dropdown()).toBeNull();

    await userEvent.click(target());

    expect(dropdown()).toHaveAccessibleName('Details');
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    expect(target()).toHaveAttribute('aria-expanded', 'true');
    expect(target()).toHaveAttribute('aria-controls', dropdown()!.id);
    await expect.poll(() => box(dropdown()!).top).toBe(box(target()).bottom + 8);
    expect(dropdown()).toHaveAttribute('data-placement', 'bottom');
    await expect.poll(() => document.activeElement).toBe(getByLabelText('Name'));
  });

  test('Escape closes it, unmounts the dropdown and moves focus back to the target', async () => {
    const onChange = vi.fn();
    const { target, dropdown } = setup({ onChange });
    await userEvent.click(target());
    await expect.poll(() => dropdown()?.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => dropdown()).toBeNull();
    expect(target()).toHaveFocus();
    expect(target()).toHaveAttribute('aria-expanded', 'false');
    expect(target()).not.toHaveAttribute('aria-controls');
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  test('a press outside closes it; the target toggles it closed', async () => {
    const { target, dropdown, getByText } = setup();
    await userEvent.click(target());
    await userEvent.click(getByText('After'));
    await expect.poll(() => dropdown()).toBeNull();

    await userEvent.click(target());
    expect(dropdown()).not.toBeNull();
    await userEvent.click(target());
    await expect.poll(() => dropdown()).toBeNull();
  });

  test('a press inside the dropdown keeps it open', async () => {
    const { target, dropdown, getByText } = setup();
    await userEvent.click(target());

    await userEvent.click(getByText('Save'));

    expect(dropdown()).not.toBeNull();
  });

  test('closeOnEscape and closeOnClickOutside off keep it open', async () => {
    const { target, dropdown, getByText } = setup({ closeOnEscape: false, closeOnClickOutside: false });
    await userEvent.click(target());

    await userEvent.keyboard('{Escape}');
    await userEvent.click(getByText('After'));

    expect(dropdown()).not.toBeNull();
  });

  test('controlled: it asks with onChange and shows what opened says', async () => {
    const onChange = vi.fn();
    const [opened, setOpened] = createSignal(false);
    const { target, dropdown } = setup({
      get opened() {
        return opened();
      },
      onChange,
    });

    await userEvent.click(target());
    expect(onChange).toHaveBeenCalledWith(true);
    expect(dropdown()).toBeNull();

    setOpened(true);
    await expect.poll(() => dropdown()).not.toBeNull();
  });

  test('defaultOpened: open from the start', async () => {
    const { dropdown } = setup({ defaultOpened: true });

    await expect.poll(() => dropdown()?.matches(':popover-open')).toBe(true);
  });

  test('position, flipping, and matchTargetWidth', async () => {
    const { target, dropdown } = setup({ position: 'right-start', matchTargetWidth: true });
    await userEvent.click(target());

    await expect.poll(() => box(dropdown()!).left).toBe(box(target()).right + 8);
    expect(box(dropdown()!).top).toBe(box(target()).top);
    expect(box(dropdown()!).width).toBe(box(target()).width);
    expect(dropdown()).toHaveAttribute('data-placement', 'right-start');
  });

  test('withArrow: an arrow on the edge facing the target, pointing at its center', async () => {
    const { target, dropdown } = setup({ withArrow: true, position: 'bottom' });
    await userEvent.click(target());
    const arrow = () => dropdown()!.querySelector('[data-slot="popover-arrow"]')!;

    await expect.poll(() => box(dropdown()!).top).toBe(box(target()).bottom + 8);
    const arrowBox = box(arrow());
    const center = (b: { left: number; right: number }) => (b.left + b.right) / 2;
    expect(Math.abs(center(arrowBox) - center(box(target())))).toBeLessThanOrEqual(1);
    // Half of it sticks out above the dropdown, towards the target.
    expect(arrowBox.top).toBeLessThan(box(dropdown()!).top);
  });

  test('trapFocus keeps Tab inside', async () => {
    const { target, getByLabelText, getByText } = setup({ trapFocus: true });
    await userEvent.click(target());
    await expect.poll(() => document.activeElement).toBe(getByLabelText('Name'));

    await userEvent.tab();
    expect(getByText('Save')).toHaveFocus();
    await userEvent.tab();
    expect(getByLabelText('Name')).toHaveFocus();
  });

  test('nested: Escape closes the inner popover first', async () => {
    const { target, getByText, queryByRole } = setup({}, () => (
      <Popover transition="none" position="right">
        <Popover.Target>{(target) => <button {...target}>Inner</button>}</Popover.Target>
        <Popover.Dropdown aria-label="Inner details">
          <button>Inner action</button>
        </Popover.Dropdown>
      </Popover>
    ));
    await userEvent.click(target());
    await userEvent.click(getByText('Inner'));
    await expect.poll(() => queryByRole('dialog', { name: 'Inner details' })).not.toBeNull();

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => queryByRole('dialog', { name: 'Inner details' })).toBeNull();
    expect(queryByRole('dialog', { name: 'Details' })).not.toBeNull();
    expect(getByText('Inner')).toHaveFocus();
  });

  test('animates out before it unmounts', async () => {
    const { target, dropdown } = setup({ transition: 'pop', transitionDuration: 1000 });
    await userEvent.click(target());
    // Fully in: an interrupted enter transition reverses in less time than the exit takes.
    await expect.poll(() => dropdown() && getComputedStyle(dropdown()!).opacity, { timeout: 3000 }).toBe('1');

    await userEvent.keyboard('{Escape}');

    expect(dropdown()).toHaveAttribute('data-status', 'ending');
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    await expect.poll(() => dropdown(), { timeout: 3000 }).toBeNull();
  });

  test('has no axe violations while open', async () => {
    const { target, dropdown, container } = setup({ withArrow: true });
    await userEvent.click(target());
    await expect.poll(() => dropdown()).not.toBeNull();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('opening and closing has no diagnostics', async () => {
    const { target, dropdown } = setup({ withArrow: true });

    const { artifact } = await captureArtifact(
      async () => {
        await userEvent.click(target());
        await expect.poll(() => dropdown()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => dropdown()).toBeNull();
      },
      { scenario: 'popover-open-close' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // presence.mounted recomputes on each status but only changes on two of them; the other two runs are the only waste.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 2 });
  });
});
