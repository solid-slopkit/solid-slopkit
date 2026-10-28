import { render } from '@solidjs/testing-library';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { Dialog } from './dialog';

describe('<Dialog />', () => {
  test('closed: renders nothing', () => {
    const { queryByRole } = render(() => (
      <Dialog opened={false} aria-label="Feedback">
        Content
      </Dialog>
    ));

    expect(queryByRole('dialog', { hidden: true })).toBeNull();
  });

  test('open: a manual popover dialog with its root class, defaults and close button', () => {
    const { getByRole } = render(() => (
      <Dialog opened aria-label="Feedback" class="mine" style={{ color: 'red' }}>
        Content
      </Dialog>
    ));
    const dialog = getByRole('dialog', { hidden: true });

    expect(dialog.tagName).toBe('DIV');
    expect(dialog).toHaveAttribute('popover', 'manual');
    expect(dialog).toHaveAttribute('aria-label', 'Feedback');
    expect(dialog).toHaveClass('slp-dialog', 'slp-transition', 'mine');
    expect(dialog).toHaveAttribute('data-position', 'bottom-right');
    expect(dialog).toHaveAttribute('data-size', 'md');
    expect(dialog).toHaveAttribute('data-transition', 'fade-up');
    expect(dialog).toHaveAttribute('data-with-close-button', '');
    expect(dialog.style.getPropertyValue('--_dialog-offset')).toBe('16px');
    expect(dialog.style.color).toBe('red');
    expect(getByRole('button', { name: 'Close', hidden: true })).toHaveAttribute('data-slot', 'dialog-close');
  });

  test('at the top it fades down; its props become attributes', () => {
    const { getByRole } = render(() => (
      <Dialog opened aria-label="Feedback" position="top" size="xl" offset={24} withCloseButton={false}>
        Content
      </Dialog>
    ));
    const dialog = getByRole('dialog', { hidden: true });

    expect(dialog).toHaveAttribute('data-position', 'top');
    expect(dialog).toHaveAttribute('data-size', 'xl');
    expect(dialog).toHaveAttribute('data-transition', 'fade-down');
    expect(dialog).not.toHaveAttribute('data-with-close-button');
    expect(dialog.style.getPropertyValue('--_dialog-offset')).toBe('24px');
    expect(dialog.querySelector('[data-slot="dialog-close"]')).toBeNull();
  });

  test('the close button calls onClose, with its label', () => {
    const onClose = vi.fn();
    const { getByRole } = render(() => (
      <Dialog opened onClose={onClose} aria-label="Feedback" closeButtonLabel="Dismiss">
        Content
      </Dialog>
    ));

    getByRole('button', { name: 'Dismiss', hidden: true }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <Dialog opened aria-label="Feedback">
        <p>How was it?</p>
      </Dialog>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['closed', 'open'])('hydrates the %s server render without mismatches or diagnostics', async (name) => {
    await expectHydration('./dialog.fixtures.tsx', name);
  });
});
