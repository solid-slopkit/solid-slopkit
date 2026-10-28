import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Drawer, type DrawerProps } from './drawer';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup(props: Partial<DrawerProps> = {}, lines = 3) {
  const [opened, setOpened] = createSignal(false);
  const onClose = vi.fn(() => {
    setOpened(false);
    flush();
  });
  const result = render(() => (
    <SlopkitUi>
      <button
        onClick={() => {
          setOpened(true);
          flush();
        }}
      >
        Open
      </button>
      <Drawer opened={opened()} onClose={onClose} title="Filters" transitionDuration={0} {...props}>
        <input aria-label="Search" />
        <For each={Array.from({ length: lines })}>{() => <p style={{ height: '100px', margin: 0 }}>Line</p>}</For>
      </Drawer>
    </SlopkitUi>
  ));
  const dialog = () => document.querySelector('dialog');
  const panel = () => dialog()!.querySelector('[data-slot="drawer-content"]')!.getBoundingClientRect();
  const open = async () => {
    await userEvent.click(result.getByText('Open'));
    await expect.poll(() => dialog()?.open).toBe(true);
  };
  return { ...result, dialog, panel, open, onClose };
}

describe('<Drawer /> in a browser', () => {
  test('from the left: a full-height panel of its size against the left edge, as a modal dialog', async () => {
    const { dialog, panel, open } = setup();

    await open();
    expect(dialog()!.matches(':modal')).toBe(true);
    const box = panel();
    expect(Math.round(box.left)).toBe(0);
    expect(Math.round(box.top)).toBe(0);
    expect(Math.round(box.height)).toBe(window.innerHeight);
    expect(Math.round(box.width)).toBe(Math.min(384, window.innerWidth));
  });

  test.each([
    ['right', (box: DOMRect) => [Math.round(box.right), window.innerWidth]],
    ['top', (box: DOMRect) => [Math.round(box.top), 0]],
    ['bottom', (box: DOMRect) => [Math.round(box.bottom), window.innerHeight]],
  ] as const)('from the %s, against that edge', async (position, edge) => {
    const { panel, open } = setup({ position, size: 'xs' });

    await open();
    const [actual, expected] = edge(panel());
    expect(actual).toBe(expected);
  });

  test('top and bottom drawers span the width, at their size in height', async () => {
    const { panel, open } = setup({ position: 'bottom', size: 'xs' });

    await open();
    expect(Math.round(panel().width)).toBe(window.innerWidth);
    expect(Math.round(panel().height)).toBe(Math.min(256, window.innerHeight));
  });

  test('long content scrolls inside the panel, and the page is locked', async () => {
    const { dialog, open } = setup({}, 30);

    await open();
    const content = dialog()!.querySelector<HTMLElement>('[data-slot="drawer-content"]')!;
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    expect(getComputedStyle(content).overflowY).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  test('focus goes in, Escape and the backdrop ask it to close, and focus comes back', async () => {
    const { dialog, open, onClose, getByText } = setup({ position: 'right', size: 'xs' });

    await open();
    expect(document.activeElement).toHaveAttribute('data-slot', 'drawer-close');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
    expect(getByText('Open')).toHaveFocus();

    await open();
    await userEvent.click(document.body, { position: { x: 5, y: 5 } });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('open, it has no axe violations', async () => {
    const { open, container } = setup();

    await open();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('opening and closing has no diagnostics', async () => {
    const { dialog, open } = setup();
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        await open();
        await userEvent.keyboard('{Escape}');
        await expect.poll(dialog).toBeNull();
      },
      { scenario: 'drawer-open-close' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\.layer/ });
  });
});
