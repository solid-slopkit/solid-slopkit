import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Menu, type MenuProps } from './menu';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup(props: Partial<MenuProps> = {}, handlers: { onRename?: (event: MouseEvent) => void } = {}) {
  const result = render(() => (
    <SlopkitUi>
      <button>Before</button>
      <div style={{ padding: '20px 160px 260px' }}>
        <Menu transition="none" {...props}>
          <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Project</Menu.Label>
            <Menu.Item onClick={handlers.onRename}>Rename</Menu.Item>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Item disabled>Archive</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="error">Delete</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      <button>After</button>
    </SlopkitUi>
  ));
  const target = () => result.getByText('Actions');
  const menu = () => result.queryByRole('menu');
  const item = (name: string) => result.getByRole('menuitem', { name });
  return { ...result, target, menu, item };
}

const focusTarget = async () => {
  (document.querySelector('button') as HTMLButtonElement).focus();
  await userEvent.keyboard('{Tab}');
};

describe('<Menu /> in a browser', () => {
  test('a click opens it below the target, with focus on the menu, and another closes it', async () => {
    const { target, menu } = setup();

    await userEvent.click(target());
    await expect.poll(() => menu()?.matches(':popover-open')).toBe(true);
    expect(menu()).toHaveFocus();
    expect(Math.round(menu()!.getBoundingClientRect().top)).toBe(Math.round(target().getBoundingClientRect().bottom) + 4);
    expect(Math.round(menu()!.getBoundingClientRect().left)).toBe(Math.round(target().getBoundingClientRect().left));

    await userEvent.click(target());
    await expect.poll(menu).toBeNull();
  });

  test('Enter, Space and ArrowDown open it on the first item, ArrowUp on the last', async () => {
    const { target, menu, item } = setup();

    for (const [key, first] of [
      ['{Enter}', 'Rename'],
      [' ', 'Rename'],
      ['{ArrowDown}', 'Rename'],
      ['{ArrowUp}', 'Delete'],
    ] as const) {
      await focusTarget();
      await userEvent.keyboard(key);
      await expect.poll(() => item(first)).toHaveFocus();
      await userEvent.keyboard('{Escape}');
      await expect.poll(menu).toBeNull();
      expect(target()).toHaveFocus();
    }
  });

  test('arrows loop over the items, skipping disabled ones and labels; Home and End', async () => {
    const { item } = setup();
    await focusTarget();
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => item('Rename')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Delete')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Rename')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(item('Rename')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(item('Delete')).toHaveFocus();
  });

  test('loop={false} stops at the ends', async () => {
    const { item } = setup({ loop: false });
    await focusTarget();
    await userEvent.keyboard('{ArrowUp}');
    await expect.poll(() => item('Delete')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(item('Delete')).toHaveFocus();
  });

  test('typing moves to the item that starts with it', async () => {
    const { item } = setup();
    await focusTarget();
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => item('Rename')).toHaveFocus();

    await userEvent.keyboard('d');
    expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('e');
    expect(item('Delete')).toHaveFocus();
  });

  test('choosing an item runs it, closes the menu and moves focus back to the target', async () => {
    const onRename = vi.fn();
    const onChange = vi.fn();
    const { target, menu } = setup({ onChange }, { onRename });
    await focusTarget();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => document.activeElement?.textContent).toBe('Rename');

    await userEvent.keyboard('{Enter}');
    expect(onRename).toHaveBeenCalledTimes(1);
    await expect.poll(menu).toBeNull();
    expect(target()).toHaveFocus();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  test("an item's preventDefault, or closeOnItemClick={false}, keeps it open", async () => {
    const prevented = setup({}, { onRename: (event) => event.preventDefault() });
    await userEvent.click(prevented.target());
    await userEvent.click(prevented.item('Rename'));
    expect(prevented.menu()).not.toBeNull();
    prevented.unmount();

    const kept = setup({ closeOnItemClick: false });
    await userEvent.click(kept.target());
    await userEvent.click(kept.item('Duplicate'));
    expect(kept.menu()).not.toBeNull();
  });

  test('a disabled item does nothing', async () => {
    const { target, menu, item } = setup();
    await userEvent.click(target());
    await userEvent.click(item('Archive'), { force: true });

    expect(menu()).not.toBeNull();
  });

  test('the pointer moves focus over the items', async () => {
    const { target, item } = setup();
    await userEvent.click(target());

    await userEvent.hover(item('Duplicate'));
    expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Delete')).toHaveFocus();
  });

  test('Tab closes it, and focus moves on from the target', async () => {
    const { menu, item, getByText } = setup();
    await focusTarget();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => item('Rename')).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    await expect.poll(menu).toBeNull();
    expect(getByText('After')).toHaveFocus();
  });

  test('a press outside closes it', async () => {
    const { target, menu, getByText } = setup();
    await userEvent.click(target());
    await userEvent.click(getByText('Before'));

    await expect.poll(menu).toBeNull();
  });

  test('a menu that starts open leaves focus where it is', async () => {
    const { menu } = setup({ defaultOpened: true });

    await expect.poll(() => menu()?.matches(':popover-open')).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  test('open, it has no axe violations', async () => {
    const { target, menu, container } = setup();
    await userEvent.click(target());
    await expect.poll(() => menu()?.matches(':popover-open')).toBe(true);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('opening, moving and closing has no diagnostics', async () => {
    const { menu } = setup();
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        await focusTarget();
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => menu()?.matches(':popover-open')).toBe(true);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}');
        await expect.poll(menu).toBeNull();
      },
      { scenario: 'menu-keyboard' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\.layer/ });
  });
});
