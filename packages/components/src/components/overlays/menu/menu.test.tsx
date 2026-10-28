import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { SlopkitUi } from '../../provider';
import { Menu } from './menu';

function renderOpen() {
  return render(() => (
    <SlopkitUi>
      <Menu defaultOpened withArrow position="right-end" transition="scale">
        <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
        <Menu.Dropdown class="mine">
          <Menu.Label>Project</Menu.Label>
          <Menu.Item leftSection={<span>L</span>} rightSection={<span>R</span>}>
            Rename
          </Menu.Item>
          <Menu.Item as="a" href="#settings" disabled>
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="error" disabled class="danger">
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </SlopkitUi>
  ));
}

describe('<Menu />', () => {
  test('closed: only the target, with its menu-button attributes', () => {
    const { getByText, queryByRole } = render(() => (
      <SlopkitUi>
        <Menu>
          <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>Rename</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </SlopkitUi>
    ));

    expect(getByText('Actions')).toHaveAttribute('aria-haspopup', 'menu');
    expect(getByText('Actions')).toHaveAttribute('aria-expanded', 'false');
    expect(getByText('Actions')).not.toHaveAttribute('aria-controls');
    expect(getByText('Actions').id).toMatch(/^slp-menu-target-/);
    expect(queryByRole('menu', { hidden: true })).toBeNull();
  });

  test('the dropdown: a manual popover menu, labelled by the target, with its classes and attributes', () => {
    const { getByText, getByRole } = renderOpen();
    const menu = getByRole('menu', { hidden: true });

    expect(menu).toHaveAttribute('popover', 'manual');
    expect(menu).toHaveAttribute('tabindex', '-1');
    expect(menu).toHaveAttribute('aria-labelledby', getByText('Actions').id);
    expect(getByText('Actions')).toHaveAttribute('aria-controls', menu.id);
    expect(getByText('Actions')).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveAttribute('data-slot', 'menu-dropdown');
    expect(menu).toHaveAttribute('data-placement', 'right-end');
    expect(menu).toHaveAttribute('data-transition', 'scale');
    expect(menu).toHaveClass('slp-menu', 'slp-transition', 'mine');
    expect(menu.querySelector('[data-slot="menu-arrow"]')).not.toBeNull();
  });

  test('items, a label and a divider', () => {
    const { getByText, getAllByRole, getByRole } = renderOpen();
    const [rename, settings, remove] = getAllByRole('menuitem', { hidden: true });

    expect(rename.tagName).toBe('BUTTON');
    expect(rename).toHaveAttribute('type', 'button');
    expect(rename).toHaveAttribute('tabindex', '-1');
    expect(rename).toHaveClass('slp-menu-item');
    expect(getByText('Rename')).toHaveAttribute('data-slot', 'menu-item-label');
    expect(getByText('L').parentElement).toHaveAttribute('data-position', 'left');
    expect(getByText('R').parentElement).toHaveAttribute('data-position', 'right');

    expect(settings.tagName).toBe('A');
    expect(settings).toHaveAttribute('href', '#settings');
    expect(settings).toHaveAttribute('aria-disabled', 'true');
    expect(settings).toHaveAttribute('data-disabled', '');

    expect(remove).toBeDisabled();
    expect(remove).not.toHaveAttribute('aria-disabled');
    expect(remove).toHaveAttribute('data-color', 'error');
    expect(remove).toHaveClass('danger');

    expect(getByText('Project')).toHaveClass('slp-menu-label');
    expect(getByText('Project')).toHaveAttribute('role', 'presentation');
    expect(getByRole('separator', { hidden: true })).toHaveClass('slp-menu-divider');
  });

  test("the target's render function runs once: a signal it reads doesn't rebuild the target", () => {
    const [label, setLabel] = createSignal('One');
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Menu>
          <Menu.Target>
            {(target) => {
              // Read directly, outside any JSX expression.
              const name = label();
              return (
                <button {...target} aria-label={name}>
                  Actions
                </button>
              );
            }}
          </Menu.Target>
          <Menu.Dropdown>Content</Menu.Dropdown>
        </Menu>
      </SlopkitUi>
    ));
    flush();
    const target = getByRole('button');

    setLabel('Two');
    flush();
    expect(getByRole('button')).toBe(target);
  });

  test('its parts throw outside a Menu, and Menu throws outside the provider', () => {
    expect(() => render(() => <Menu.Item>Alone</Menu.Item>)).toThrow('<Menu.Item> must be rendered inside <Menu>.');
    expect(() =>
      render(() => (
        <Menu>
          <Menu.Target>{(target) => <button {...target}>Actions</button>}</Menu.Target>
        </Menu>
      )),
    ).toThrow('<Menu> must be rendered inside <SlopkitUi>.');
  });

  test('has no axe violations, open', async () => {
    const { container } = renderOpen();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['closed', 'open'])('hydrates the %s server render without mismatches or diagnostics', async (name) => {
    await expectHydration('./menu.fixtures.tsx', name);
  });
});
