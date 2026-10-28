import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Popover } from '../popover';
import { Modal, type ModalProps } from './modal';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup(props: Partial<ModalProps> = {}, content = () => <input aria-label="Name" />) {
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
      <div style={{ height: '3000px' }}>Page</div>
      <Modal opened={opened()} onClose={onClose} title="Edit profile" transitionDuration={0} {...props}>
        {content()}
      </Modal>
    </SlopkitUi>
  ));
  const dialog = () => document.querySelector('dialog');
  const open = async () => {
    await userEvent.click(result.getByText('Open'));
    await expect.poll(() => dialog()?.open).toBe(true);
  };
  return { ...result, dialog, open, onClose, setOpened };
}

describe('<Modal /> in a browser', () => {
  test('opens as a modal dialog in the top layer, and focuses the first focusable element', async () => {
    const { dialog, open, getByText } = setup();

    await open();
    expect(dialog()!.matches(':modal')).toBe(true);
    // The rest of the page is under it: what's at the button's place is the dialog.
    const { left, top } = getByText('Open').getBoundingClientRect();
    expect(dialog()!.contains(document.elementFromPoint(left + 2, top + 2))).toBe(true);
    // The close button comes first.
    expect(document.activeElement).toHaveAttribute('data-slot', 'modal-close');
  });

  test('data-autofocus picks what is focused', async () => {
    const { open, getByLabelText } = setup({}, () => <input aria-label="Name" data-autofocus />);

    await open();
    expect(getByLabelText('Name')).toHaveFocus();
  });

  test('Escape asks it to close, and focus goes back to what opened it', async () => {
    const { dialog, open, onClose, getByText } = setup();

    await open();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
    expect(getByText('Open')).toHaveFocus();
  });

  test('closeOnEscape={false} keeps it open, also when the browser cancels it', async () => {
    const { dialog, open, onClose } = setup({ closeOnEscape: false });

    await open();
    await userEvent.keyboard('{Escape}');
    dialog()!.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog()!.open).toBe(true);
  });

  test('a press on the backdrop asks it to close; a press inside does not', async () => {
    const { dialog, open, onClose, getByLabelText } = setup();

    await open();
    await userEvent.click(getByLabelText('Name'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(document.body, { position: { x: 5, y: 5 } });
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
  });

  test('closeOnClickOutside={false} keeps it open on a backdrop press', async () => {
    const { open, onClose } = setup({ closeOnClickOutside: false });

    await open();
    await userEvent.click(document.body, { position: { x: 5, y: 5 } });
    expect(onClose).not.toHaveBeenCalled();
  });

  test('the page does not scroll while it is open, unless lockScroll is off', async () => {
    const locked = setup();
    await locked.open();
    expect(getComputedStyle(document.documentElement).overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await expect.poll(locked.dialog).toBeNull();
    expect(getComputedStyle(document.documentElement).overflow).toBe('visible');
    locked.unmount();

    const free = setup({ lockScroll: false });
    await free.open();
    expect(getComputedStyle(document.documentElement).overflow).toBe('visible');
  });

  test('sizes and centering lay out the content box', async () => {
    const { dialog, open } = setup({ size: 'sm', centered: true });

    await open();
    const box = dialog()!.querySelector('[data-slot="modal-content"]')!.getBoundingClientRect();
    expect(Math.round(box.width)).toBe(Math.min(384, window.innerWidth - 32));
    expect(Math.abs(box.top + box.height / 2 - window.innerHeight / 2)).toBeLessThanOrEqual(1);
  });

  test('a popover inside closes first on Escape, then the modal', async () => {
    const { dialog, open, onClose, getByText } = setup({}, () => (
      <Popover transition="none">
        <Popover.Target>{(target) => <button {...target}>Details</button>}</Popover.Target>
        <Popover.Dropdown aria-label="Details">Inner</Popover.Dropdown>
      </Popover>
    ));

    await open();
    await userEvent.click(getByText('Details'));
    await expect.poll(() => getByText('Inner')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="dialog"][popover]')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog()!.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
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
      { scenario: 'modal-open-close' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\.layer/ });
  });
});
