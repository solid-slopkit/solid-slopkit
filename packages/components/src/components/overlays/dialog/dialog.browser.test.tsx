import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Menu } from '../menu';
import { Dialog, type DialogProps } from './dialog';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup(props: Partial<DialogProps> = {}) {
  const [opened, setOpened] = createSignal(true);
  const onClose = vi.fn(() => {
    setOpened(false);
    flush();
  });
  const result = render(() => (
    <SlopkitUi>
      <button>Page</button>
      <Dialog opened={opened()} onClose={onClose} aria-label="Feedback" transition="none" {...props}>
        <input aria-label="Comment" />
      </Dialog>
    </SlopkitUi>
  ));
  const dialog = () => result.queryByRole('dialog');
  const box = () => dialog()!.getBoundingClientRect();
  return { ...result, dialog, box, onClose, setOpened };
}

const shown = (element: Element | null) => !!element?.matches(':popover-open');

describe('<Dialog /> in a browser', () => {
  test('sits in the bottom right corner, in the top layer, without moving focus or blocking the page', async () => {
    const { dialog, box, getByText } = setup();

    await expect.poll(() => shown(dialog())).toBe(true);
    expect(Math.round(window.innerWidth - box().right)).toBe(16);
    expect(Math.round(window.innerHeight - box().bottom)).toBe(16);
    expect(document.activeElement).toBe(document.body);

    await userEvent.click(getByText('Page'));
    expect(getByText('Page')).toHaveFocus();
    expect(shown(dialog())).toBe(true);
  });

  test.each([
    ['top-left', (box: DOMRect) => [Math.round(box.left), Math.round(box.top)], [24, 24]],
    ['bottom-left', (box: DOMRect) => [Math.round(box.left), Math.round(window.innerHeight - box.bottom)], [24, 24]],
    ['top', (box: DOMRect) => [Math.round(box.left - (window.innerWidth - box.right)), Math.round(box.top)], [0, 24]],
  ] as const)('at %s, with the offset', async (position, measure, expected) => {
    const { dialog, box } = setup({ position, offset: 24 });

    await expect.poll(() => shown(dialog())).toBe(true);
    expect(measure(box())).toEqual(expected);
  });

  test('its width follows size, and never past the viewport', async () => {
    const { dialog, box } = setup({ size: 'xl' });

    await expect.poll(() => shown(dialog())).toBe(true);
    expect(Math.round(box().width)).toBe(Math.min(512, window.innerWidth - 32));
  });

  test('Escape closes it only while focus is inside', async () => {
    const { dialog, onClose, getByText, getByLabelText } = setup();
    await expect.poll(() => shown(dialog())).toBe(true);

    await userEvent.click(getByText('Page'));
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(getByLabelText('Comment'));
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
  });

  test('closeOnEscape={false} keeps it open', async () => {
    const { dialog, onClose, getByLabelText } = setup({ closeOnEscape: false });
    await expect.poll(() => shown(dialog())).toBe(true);

    await userEvent.click(getByLabelText('Comment'));
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  test('a menu open inside it takes Escape first', async () => {
    const onClose = vi.fn();
    const { getByText, queryByRole } = render(() => (
      <SlopkitUi>
        <Dialog opened onClose={onClose} aria-label="Feedback" transition="none">
          <Menu transition="none">
            <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>Report</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Dialog>
      </SlopkitUi>
    ));

    await userEvent.click(getByText('Actions'));
    await expect.poll(() => queryByRole('menu')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => queryByRole('menu')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('opening and closing has no diagnostics', async () => {
    const { dialog, setOpened } = setup();
    await expect.poll(() => shown(dialog())).toBe(true);

    const { artifact } = await captureArtifact(
      async () => {
        setOpened(false);
        flush();
        await expect.poll(dialog).toBeNull();
        setOpened(true);
        flush();
        await expect.poll(() => shown(dialog())).toBe(true);
      },
      { scenario: 'dialog-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });
});
