import { render } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { SlopkitUi } from '../../provider';
import { Drawer, type DrawerPosition } from './drawer';

describe('<Drawer />', () => {
  test('closed: renders nothing', () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Drawer opened={false} onClose={() => {}} title="Filters">
          Content
        </Drawer>
      </SlopkitUi>
    ));

    expect(container.querySelector('dialog')).toBeNull();
  });

  test('open: a dialog with its root class, defaults, slots, and named by the title', () => {
    const { getByRole, getByText } = render(() => (
      <SlopkitUi>
        <Drawer opened onClose={() => {}} title="Filters" class="mine">
          Content
        </Drawer>
      </SlopkitUi>
    ));
    const dialog = getByRole('dialog', { hidden: true });

    expect(dialog).toHaveClass('slp-drawer', 'mine');
    expect(dialog).toHaveAttribute('data-position', 'left');
    expect(dialog).toHaveAttribute('data-size', 'md');
    expect(dialog).toHaveAttribute('aria-labelledby', getByText('Filters').id);
    expect(getByText('Filters')).toHaveAttribute('data-slot', 'drawer-title');
    expect(getByText('Content')).toHaveAttribute('data-slot', 'drawer-body');
    expect(dialog.querySelector('[data-slot="drawer-header"]')).not.toBeNull();
    expect(getByRole('button', { name: 'Close', hidden: true })).toHaveAttribute('data-slot', 'drawer-close');
  });

  test.each([
    ['left', 'slide-right'],
    ['right', 'slide-left'],
    ['top', 'slide-down'],
    ['bottom', 'slide-up'],
  ] as const)('from the %s, it slides in with %s unless transition says otherwise', (position, transition) => {
    const { getByRole, unmount } = render(() => (
      <SlopkitUi>
        <Drawer opened onClose={() => {}} position={position as DrawerPosition} size="xl">
          Content
        </Drawer>
      </SlopkitUi>
    ));
    const dialog = getByRole('dialog', { hidden: true });

    expect(dialog).toHaveAttribute('data-position', position);
    expect(dialog).toHaveAttribute('data-size', 'xl');
    expect(dialog.querySelector('[data-slot="drawer-content"]')).toHaveAttribute('data-transition', transition);
    unmount();
  });

  test('transition replaces the slide', () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Drawer opened onClose={() => {}} transition="fade">
          Content
        </Drawer>
      </SlopkitUi>
    ));

    expect(getByRole('dialog', { hidden: true }).querySelector('[data-slot="drawer-content"]')).toHaveAttribute(
      'data-transition',
      'fade',
    );
  });

  test('the close button calls onClose', () => {
    const onClose = vi.fn();
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Drawer opened onClose={onClose} aria-label="Navigation">
          Content
        </Drawer>
      </SlopkitUi>
    ));

    expect(getByRole('dialog', { hidden: true })).toHaveAttribute('aria-label', 'Navigation');
    getByRole('button', { name: 'Close', hidden: true }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('throws outside the provider', () => {
    expect(() => render(() => <Drawer opened onClose={() => {}} />)).toThrow('<Drawer> must be rendered inside <SlopkitUi>.');
  });

  test.each(['closed', 'open'])('hydrates the %s server render without mismatches or diagnostics', async (name) => {
    await expectHydration('./drawer.fixtures.tsx', name);
  });
});
