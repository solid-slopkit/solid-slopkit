import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { SlopkitUi } from '../../provider';
import { Modal } from './modal';

describe('<Modal />', () => {
  test('closed: renders nothing', () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Modal opened={false} onClose={() => {}} title="Edit">
          Content
        </Modal>
      </SlopkitUi>
    ));

    expect(container.querySelector('dialog')).toBeNull();
  });

  test('open: a dialog with the root class, its slots, and named by the title', () => {
    const { getByRole, getByText } = render(() => (
      <SlopkitUi>
        <Modal opened onClose={() => {}} title="Edit profile" size="xl" centered fullScreen class="mine" data-testid="modal">
          Content
        </Modal>
      </SlopkitUi>
    ));
    const dialog = getByRole('dialog', { hidden: true });

    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveClass('slp-modal', 'mine');
    expect(dialog).toHaveAttribute('data-testid', 'modal');
    expect(dialog).toHaveAttribute('data-size', 'xl');
    expect(dialog).toHaveAttribute('data-centered', '');
    expect(dialog).toHaveAttribute('data-full-screen', '');
    expect(dialog).toHaveAttribute('aria-labelledby', getByText('Edit profile').id);
    expect(getByText('Edit profile').tagName).toBe('H2');
    expect(getByText('Edit profile')).toHaveAttribute('data-slot', 'modal-title');
    expect(getByText('Content')).toHaveAttribute('data-slot', 'modal-body');
    expect(dialog.querySelector('[data-slot="modal-content"]')).toHaveAttribute('data-transition', 'pop');
    expect(getByRole('button', { name: 'Close', hidden: true })).toHaveAttribute('data-slot', 'modal-close');
  });

  test('without a title or close button there is no header; aria-label names it', () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Modal opened onClose={() => {}} withCloseButton={false} aria-label="Confirm" lockScroll={false}>
          Content
        </Modal>
      </SlopkitUi>
    ));
    const dialog = getByRole('dialog', { hidden: true });

    expect(dialog).toHaveAttribute('aria-label', 'Confirm');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(dialog.querySelector('[data-slot="modal-header"]')).toBeNull();
  });

  test('the close button calls onClose, with its label', () => {
    const onClose = vi.fn();
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Modal opened onClose={onClose} closeButtonLabel="Schließen">
          Content
        </Modal>
      </SlopkitUi>
    ));

    getByRole('button', { name: 'Schließen', hidden: true }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('onExited is called once it has closed, not before', async () => {
    const [opened, setOpened] = createSignal(true);
    const onExited = vi.fn();
    const { container } = render(() => (
      <SlopkitUi>
        <Modal opened={opened()} onClose={() => setOpened(false)} onExited={onExited} title="Edit">
          Content
        </Modal>
      </SlopkitUi>
    ));
    flush();
    expect(container.querySelector('dialog')).not.toBeNull();
    expect(container.querySelector('dialog')).not.toHaveAttribute('onexited');

    setOpened(false);
    flush();
    expect(onExited).not.toHaveBeenCalled();
    // With nothing animating, as in jsdom, it leaves a microtask later.
    for (let tick = 0; tick < 4; tick++) await Promise.resolve();
    flush();
    expect(onExited).toHaveBeenCalledTimes(1);
    expect(container.querySelector('dialog')).toBeNull();
  });

  test('throws outside the provider', () => {
    expect(() => render(() => <Modal opened onClose={() => {}} />)).toThrow('<Modal> must be rendered inside <SlopkitUi>.');
  });

  test.each(['closed', 'open', 'untitled'])('hydrates the %s server render without mismatches or diagnostics', async (name) => {
    await expectHydration('./modal.fixtures.tsx', name);
  });
});
