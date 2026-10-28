import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import type { JSX } from '@solidjs/web';
import axe from 'axe-core';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { renderInRouter } from '../../../../test/router';
import { SlopkitUi } from '../../provider';
import { AppShell, useAppShell, type AppShellProps, type AppShellSidebarProps, type UseAppShell } from './app-shell';

const Icon = () => <svg aria-hidden="true" />;

// The browser hides a closed popover, which the sidebar always is on a wide screen; its stylesheet shows it, but jsdom
// loads no stylesheets, and its own rule for popovers wins over an author rule that isn't important.
beforeAll(() => {
  const sheet = document.createElement('style');
  sheet.textContent = '.slp-app-shell-sidebar { display: flex !important }';
  document.head.append(sheet);
});

function setup(props: Partial<AppShellProps> = {}, sidebar: Partial<AppShellSidebarProps> = {}) {
  let shell: UseAppShell | undefined;
  const Probe = () => {
    shell = useAppShell();
    return null;
  };
  const result = render(() => (
    <SlopkitUi>
      <AppShell {...props}>
        <AppShell.Sidebar {...sidebar}>
          <AppShell.SidebarHeader>Acme</AppShell.SidebarHeader>
          <AppShell.SidebarContent>
            <AppShell.Group label="Platform">
              <AppShell.GroupAction label="Add project">
                <Icon />
              </AppShell.GroupAction>
              <AppShell.Menu>
                <AppShell.MenuItem>
                  <AppShell.MenuButton href="/" icon={<Icon />} tooltip="Home">
                    Home
                  </AppShell.MenuButton>
                  <AppShell.MenuBadge>24</AppShell.MenuBadge>
                </AppShell.MenuItem>
                <AppShell.MenuItem>
                  <AppShell.MenuButton icon={<Icon />}>Projects</AppShell.MenuButton>
                  <AppShell.MenuAction label="More" showOnHover>
                    <Icon />
                  </AppShell.MenuAction>
                  <AppShell.MenuSub>
                    <AppShell.MenuSubItem>
                      <AppShell.MenuSubButton href="/projects/design">Design</AppShell.MenuSubButton>
                    </AppShell.MenuSubItem>
                  </AppShell.MenuSub>
                </AppShell.MenuItem>
              </AppShell.Menu>
            </AppShell.Group>
          </AppShell.SidebarContent>
          <AppShell.SidebarFooter>Footer</AppShell.SidebarFooter>
          <AppShell.Rail />
        </AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Trigger />
          <Probe />
        </AppShell.Main>
      </AppShell>
    </SlopkitUi>
  ));
  const root = () => result.container.querySelector<HTMLElement>('.slp-app-shell')!;
  const sidebarElement = () => result.container.querySelector<HTMLElement>('.slp-app-shell-sidebar')!;
  const trigger = () => result.getByRole('button', { name: 'Toggle sidebar' });
  return { ...result, root, sidebar: sidebarElement, trigger, shell: () => shell! };
}

describe('<AppShell />', () => {
  test('renders the sidebar, its parts and the main area, with their classes and slots', () => {
    const { root, sidebar, container, getByRole } = setup({ class: 'mine' }, { class: 'side' });

    expect(root()).toHaveClass('slp-app-shell', 'mine');
    expect(root()).toHaveAttribute('data-state', 'expanded');
    expect(sidebar()).toHaveClass('side');
    expect(sidebar()).toHaveAttribute('popover', 'manual');
    expect(sidebar()).toHaveAttribute('data-state', 'expanded');
    expect(sidebar()).toHaveAttribute('data-position', 'left');
    expect(sidebar()).toHaveAttribute('data-variant', 'sidebar');
    expect(sidebar()).toHaveAttribute('data-collapsible', 'offcanvas');
    // Not a dialog while it's in the layout.
    expect(sidebar()).not.toHaveAttribute('role');
    expect(sidebar()).not.toHaveAttribute('aria-label');
    for (const name of [
      'sidebar-header',
      'sidebar-content',
      'sidebar-footer',
      'group',
      'group-action',
      'menu',
      'menu-item',
      'menu-button',
      'menu-badge',
      'menu-action',
      'menu-sub',
      'menu-sub-item',
      'menu-sub-button',
      'rail',
      'trigger',
      'main',
    ]) {
      expect(container.querySelector(`.slp-app-shell-${name}`), name).not.toBeNull();
    }
    expect(sidebar().querySelector(':scope > [data-slot="app-shell-sidebar-panel"]')).not.toBeNull();
    expect(container.querySelector('main.slp-app-shell-main')).not.toBeNull();
    expect(container.querySelector('ul.slp-app-shell-menu > li.slp-app-shell-menu-item')).not.toBeNull();
    expect(getByRole('group', { name: 'Platform' })).toHaveClass('slp-app-shell-group');
    expect(container.querySelector('.slp-app-shell-rail')).toHaveAttribute('aria-hidden', 'true');
  });

  test('a menu button is a link with href, else a button', () => {
    const { getByRole, container } = setup();
    const home = getByRole('link', { name: 'Home' });
    const projects = getByRole('button', { name: 'Projects' });

    expect(home).toHaveAttribute('href', '/');
    expect(home).not.toHaveAttribute('aria-current');
    expect(home).not.toHaveAttribute('data-active');
    expect(home).toHaveAttribute('data-size', 'md');
    expect(home.querySelector('[data-slot="app-shell-menu-button-icon"] svg')).not.toBeNull();
    expect(home.querySelector('[data-slot="app-shell-menu-button-label"]')).toHaveTextContent('Home');
    expect(projects).toHaveAttribute('type', 'button');
    expect(projects).not.toHaveAttribute('aria-current');
    expect(getByRole('link', { name: 'Design' })).not.toHaveAttribute('aria-current');
    expect(container.querySelector('[data-slot="app-shell-menu-sub-button-label"]')).toHaveTextContent('Design');
    // The tooltip only describes the row while the label is hidden.
    expect(home).not.toHaveAttribute('aria-describedby');
    expect(getByRole('button', { name: 'More' })).toHaveAttribute('data-show-on-hover', '');
  });

  test('a disabled menu button: a link loses its href, a button is disabled', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <SlopkitUi>
        <AppShell>
          <AppShell.Sidebar>
            <AppShell.Menu>
              <AppShell.MenuItem>
                <AppShell.MenuButton href="/archive" disabled onClick={onClick}>
                  Archive
                </AppShell.MenuButton>
              </AppShell.MenuItem>
              <AppShell.MenuItem>
                <AppShell.MenuButton disabled>Trash</AppShell.MenuButton>
              </AppShell.MenuItem>
            </AppShell.Menu>
          </AppShell.Sidebar>
        </AppShell>
      </SlopkitUi>
    ));
    const link = getByRole('link', { name: 'Archive' });

    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled', '');
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Trash' })).toBeDisabled();
  });

  test('as renders another link component', () => {
    const RouterLink = (props: { href: string; children?: JSX.Element }) => <a {...props} data-router="" />;
    const { getByRole } = render(() => (
      <SlopkitUi>
        <AppShell>
          <AppShell.Sidebar>
            <AppShell.Menu>
              <AppShell.MenuItem>
                <AppShell.MenuButton as={RouterLink} href="/settings">
                  Settings
                </AppShell.MenuButton>
              </AppShell.MenuItem>
            </AppShell.Menu>
          </AppShell.Sidebar>
        </AppShell>
      </SlopkitUi>
    ));
    const link = getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('data-router', '');
    expect(link).toHaveClass('slp-app-shell-menu-button');
  });

  test('the router marks the rows that link to the current page, and moves the mark as it navigates', async () => {
    const { getByRole, history } = renderInRouter('/', ['/', '/projects/design'], () => (
      <SlopkitUi>
        <AppShell>
          <AppShell.Sidebar>
            <AppShell.Menu>
              <AppShell.MenuItem>
                <AppShell.MenuButton href="/">Home</AppShell.MenuButton>
              </AppShell.MenuItem>
              <AppShell.MenuItem>
                <AppShell.MenuButton>Projects</AppShell.MenuButton>
                <AppShell.MenuSub>
                  <AppShell.MenuSubItem>
                    <AppShell.MenuSubButton href="/projects/design">Design</AppShell.MenuSubButton>
                  </AppShell.MenuSubItem>
                </AppShell.MenuSub>
              </AppShell.MenuItem>
              <AppShell.MenuItem>
                <AppShell.MenuButton href="/" disabled>
                  Archive
                </AppShell.MenuButton>
              </AppShell.MenuItem>
            </AppShell.Menu>
          </AppShell.Sidebar>
        </AppShell>
      </SlopkitUi>
    ));
    const home = getByRole('link', { name: 'Home' });
    const design = getByRole('link', { name: 'Design' });

    expect(home).toHaveAttribute('data-active', '');
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(design).not.toHaveAttribute('data-active');
    // A disabled row has no href, so the router never marks it.
    expect(getByRole('link', { name: 'Archive' })).not.toHaveAttribute('data-active');

    fireEvent.click(design);
    flush();
    await expect.poll(() => history.get()).toBe('/projects/design');
    expect(design).toHaveAttribute('data-active', '');
    expect(design).toHaveAttribute('aria-current', 'page');
    expect(home).not.toHaveAttribute('data-active');
    expect(home).not.toHaveAttribute('aria-current');
  });

  test('the trigger collapses and expands the sidebar, and says whether it is expanded', () => {
    const onChange = vi.fn();
    const { trigger, sidebar, root, shell } = setup({ onChange });

    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', sidebar().id);
    fireEvent.click(trigger());
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar()).toHaveAttribute('data-state', 'collapsed');
    expect(root()).toHaveAttribute('data-state', 'collapsed');
    expect(shell().opened()).toBe(false);

    fireEvent.click(trigger());
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(sidebar()).toHaveAttribute('data-state', 'expanded');
  });

  test('defaultOpened starts it collapsed; the rail toggles it', () => {
    const { sidebar, container } = setup({ defaultOpened: false });

    expect(sidebar()).toHaveAttribute('data-state', 'collapsed');
    fireEvent.click(container.querySelector('.slp-app-shell-rail')!);
    expect(sidebar()).toHaveAttribute('data-state', 'expanded');
  });

  test('controlled: shows opened, and only asks to change it', () => {
    const [opened, setOpened] = createSignal(true);
    const onChange = vi.fn();
    const { trigger, sidebar } = setup({
      get opened() {
        return opened();
      },
      onChange,
    });

    fireEvent.click(trigger());
    expect(onChange).toHaveBeenCalledWith(false);
    expect(sidebar()).toHaveAttribute('data-state', 'expanded');
    setOpened(false);
    flush();
    expect(sidebar()).toHaveAttribute('data-state', 'collapsed');
  });

  test('Ctrl+B toggles it from anywhere; another shortcut, or none, can be set', () => {
    const { sidebar, unmount } = setup();

    fireEvent.keyDown(document.body, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(sidebar()).toHaveAttribute('data-state', 'collapsed');
    fireEvent.keyDown(document.body, { key: 'b', code: 'KeyB', ctrlKey: true, shiftKey: true });
    expect(sidebar()).toHaveAttribute('data-state', 'collapsed');
    fireEvent.keyDown(document.body, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(sidebar()).toHaveAttribute('data-state', 'expanded');
    unmount();

    const custom = setup({ shortcut: 'alt+S' });
    fireEvent.keyDown(document.body, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(custom.sidebar()).toHaveAttribute('data-state', 'expanded');
    fireEvent.keyDown(document.body, { key: 'ß', code: 'KeyS', altKey: true });
    expect(custom.sidebar()).toHaveAttribute('data-state', 'collapsed');
    custom.unmount();

    const none = setup({ shortcut: null });
    fireEvent.keyDown(document.body, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(none.sidebar()).toHaveAttribute('data-state', 'expanded');
  });

  test('collapsible none never collapses; the variant and position are attributes', () => {
    const { sidebar, trigger } = setup({}, { collapsible: 'none', variant: 'floating', position: 'right' });

    fireEvent.click(trigger());
    expect(sidebar()).toHaveAttribute('data-state', 'expanded');
    expect(sidebar()).toHaveAttribute('data-variant', 'floating');
    expect(sidebar()).toHaveAttribute('data-position', 'right');
  });

  test('collapsed to icons, a row with a tooltip is described by it', () => {
    const { sidebar, trigger, getByRole } = setup({}, { collapsible: 'icon' });
    const home = getByRole('link', { name: 'Home' });

    fireEvent.click(trigger());
    expect(sidebar()).toHaveAttribute('data-state', 'collapsed');
    const tooltip = document.getElementById(home.getAttribute('aria-describedby')!);
    expect(tooltip).toHaveAttribute('role', 'tooltip');
    expect(tooltip).toHaveTextContent('Home');
    // Still named by its label, which is only hidden from sight.
    expect(home).toHaveAccessibleName('Home');
  });

  test('parts throw outside their parent', () => {
    expect(() => render(() => <AppShell.Trigger />)).toThrow('<AppShell.Trigger> must be rendered inside <AppShell>.');
    expect(() =>
      render(() => (
        <SlopkitUi>
          <AppShell>
            <AppShell.MenuButton>Home</AppShell.MenuButton>
          </AppShell>
        </SlopkitUi>
      )),
    ).toThrow('<AppShell.MenuButton> must be rendered inside <AppShell.Sidebar>.');
  });

  test('has no axe violations, expanded and collapsed, in each variant', async () => {
    for (const variant of ['sidebar', 'floating', 'inset'] as const) {
      for (const collapsible of ['offcanvas', 'icon'] as const) {
        const { container, trigger, unmount } = setup({}, { variant, collapsible });
        expect((await axe.run(container)).violations, `${variant} ${collapsible}`).toEqual([]);
        fireEvent.click(trigger());
        expect((await axe.run(container)).violations, `${variant} ${collapsible} collapsed`).toEqual([]);
        unmount();
      }
    }
  });

  test('toggling has no diagnostics, and only the shell state re-runs', async () => {
    const { trigger } = setup({}, { collapsible: 'icon' });

    const { artifact } = await captureArtifact(
      async () => {
        fireEvent.click(trigger());
        fireEvent.click(trigger());
      },
      { scenario: 'app-shell-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /AppShell\.opened/ });
  });

  test('hydrates without a mismatch', async () => {
    await expectHydration('./app-shell.fixtures.tsx', 'expanded');
    await expectHydration('./app-shell.fixtures.tsx', 'collapsedToIcons');
  });
});
