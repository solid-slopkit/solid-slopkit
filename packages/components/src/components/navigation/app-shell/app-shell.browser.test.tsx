import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { AppShell, type AppShellSidebarProps } from './app-shell';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const Icon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
);

function setup(sidebar: Partial<AppShellSidebarProps> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <AppShell>
        <AppShell.Sidebar {...sidebar}>
          <AppShell.SidebarHeader>Acme</AppShell.SidebarHeader>
          <AppShell.SidebarContent>
            <AppShell.Group label="Platform">
              <AppShell.Menu>
                <AppShell.MenuItem>
                  <AppShell.MenuButton href="#home" icon={<Icon />} tooltip="Home" data-active aria-current="page">
                    Home
                  </AppShell.MenuButton>
                  <AppShell.MenuBadge>24</AppShell.MenuBadge>
                </AppShell.MenuItem>
                <AppShell.MenuItem>
                  <AppShell.MenuButton icon={<Icon />}>Projects</AppShell.MenuButton>
                </AppShell.MenuItem>
              </AppShell.Menu>
            </AppShell.Group>
          </AppShell.SidebarContent>
          <AppShell.Rail />
        </AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Trigger />
          <h1 id="home" tabindex="-1">
            Home
          </h1>
        </AppShell.Main>
      </AppShell>
    </SlopkitUi>
  ));
  const sidebarElement = () => result.container.querySelector<HTMLElement>('.slp-app-shell-sidebar')!;
  const main = () => result.container.querySelector<HTMLElement>('.slp-app-shell-main')!;
  const trigger = () => result.getByRole('button', { name: 'Toggle sidebar' });
  const width = (element: Element) => element.getBoundingClientRect().width;
  return { ...result, sidebar: sidebarElement, main, trigger, width };
}

describe('<AppShell /> on a wide screen', () => {
  beforeAll(() => page.viewport(1024, 768));

  test('the sidebar is a 16rem column as tall as the viewport, and the main area fills the rest', () => {
    const { sidebar, main, width } = setup();

    expect(width(sidebar())).toBe(256);
    expect(sidebar().getBoundingClientRect().height).toBe(768);
    expect(width(main())).toBe(1024 - 256);
    expect(getComputedStyle(sidebar()).position).toBe('sticky');
    expect(sidebar().matches(':popover-open')).toBe(false);
  });

  test('collapsed off the canvas, it takes no room and leaves the tab order', async () => {
    const { sidebar, main, trigger, width, container } = setup();

    await userEvent.click(trigger());
    await expect.poll(() => width(sidebar())).toBe(0);
    expect(width(main())).toBe(1024);
    await expect.poll(() => getComputedStyle(sidebar()).visibility).toBe('hidden');
    expect(container.querySelector('a')!.checkVisibility({ visibilityProperty: true })).toBe(false);

    // The rail stays at the shell's edge, where it brings the sidebar back.
    const rail = document.querySelector<HTMLElement>('.slp-app-shell-rail')!;
    expect(getComputedStyle(rail).visibility).toBe('visible');
    expect(rail.getBoundingClientRect().right).toBeGreaterThanOrEqual(12);
    await userEvent.click(rail);
    await expect.poll(() => width(sidebar())).toBe(256);
  });

  test('collapsed to icons, it is as wide as an icon row, and a row shows its tooltip', async () => {
    const { sidebar, trigger, width, getByRole } = setup({ collapsible: 'icon' });
    const home = getByRole('link', { name: 'Home' });

    await userEvent.click(trigger());
    await expect.poll(() => width(sidebar())).toBe(48);
    await expect.poll(() => width(home)).toBe(32);
    expect(home.getBoundingClientRect().height).toBe(32);
    const badge = document.querySelector<HTMLElement>('.slp-app-shell-menu-badge')!;
    expect(getComputedStyle(badge).display).toBe('none');

    await userEvent.hover(home);
    const tooltip = document.getElementById(home.getAttribute('aria-describedby')!)!;
    await expect.poll(() => tooltip.matches(':popover-open')).toBe(true);
    expect(tooltip).toHaveTextContent('Home');
    // Beside the row, on the main area's side.
    expect(tooltip.getBoundingClientRect().left).toBeGreaterThan(home.getBoundingClientRect().right);
  });

  test('floating and inset sidebars keep a gap; inset raises the main area', () => {
    const floating = setup({ variant: 'floating' });
    const panel = floating.sidebar().querySelector<HTMLElement>('[data-slot="app-shell-sidebar-panel"]')!;
    expect(panel.getBoundingClientRect().left).toBe(8);
    expect(getComputedStyle(panel).borderTopLeftRadius).toBe('12px');
    floating.unmount();

    const inset = setup({ variant: 'inset' });
    const main = inset.main().getBoundingClientRect();
    expect(main.top).toBe(8);
    expect(main.left).toBe(256);
    expect(getComputedStyle(inset.main()).borderTopLeftRadius).toBe('12px');
  });

  test('has no axe violations, expanded and collapsed to icons', async () => {
    const { container, trigger, sidebar, width } = setup({ collapsible: 'icon' });
    expect((await axe.run(container)).violations).toEqual([]);
    await userEvent.click(trigger());
    // Once the labels have faded out, so contrast isn't measured mid-transition.
    await expect.poll(() => width(sidebar())).toBe(48);
    await expect.poll(() => sidebar().getAnimations({ subtree: true }).length).toBe(0);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});

describe('<AppShell /> on a narrow screen', () => {
  beforeAll(() => page.viewport(400, 800));
  afterAll(() => page.viewport(1024, 768));

  const open = async (shell: ReturnType<typeof setup>) => {
    await expect.poll(() => getComputedStyle(shell.sidebar()).display).toBe('none');
    // The shell learns the screen is narrow once hydrated.
    await expect.poll(() => shell.trigger().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(shell.trigger());
    await expect.poll(() => shell.sidebar().matches(':popover-open')).toBe(true);
    await expect.poll(() => shell.sidebar().getAttribute('data-status')).toBe('open');
    await expect.poll(() => shell.sidebar().getAnimations().length).toBe(0);
  };

  test('the trigger opens the sidebar as a modal drawer, with focus kept inside; Escape closes it', async () => {
    const shell = setup();
    await open(shell);
    const { sidebar, main, trigger, getByRole } = shell;

    expect(sidebar()).toHaveAttribute('role', 'dialog');
    expect(sidebar()).toHaveAttribute('aria-modal', 'true');
    expect(sidebar()).toHaveAccessibleName('Sidebar');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    const box = sidebar().getBoundingClientRect();
    expect(box.left).toBe(0);
    expect(box.width).toBe(288);
    expect(box.height).toBe(800);
    expect(main().inert).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Focus moves in, and Tab wraps around inside.
    const home = getByRole('link', { name: 'Home' });
    const projects = getByRole('button', { name: 'Projects' });
    await expect.poll(() => document.activeElement).toBe(home);
    await userEvent.tab();
    expect(document.activeElement).toBe(projects);
    await userEvent.tab();
    expect(document.activeElement).toBe(home);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => sidebar().matches(':popover-open')).toBe(false);
    expect(sidebar()).not.toHaveAttribute('role');
    expect(main().inert).toBe(false);
    expect(document.activeElement).toBe(trigger());
    expect(getComputedStyle(sidebar()).display).toBe('none');
  });

  test('a press on the backdrop or on a link closes it', async () => {
    const shell = setup();
    await open(shell);
    await userEvent.click(document.body, { position: { x: 360, y: 400 } });
    await expect.poll(() => shell.sidebar().matches(':popover-open')).toBe(false);

    await open(shell);
    await userEvent.click(shell.getByRole('link', { name: 'Home' }));
    await expect.poll(() => shell.sidebar().matches(':popover-open')).toBe(false);
  });

  test('widening the screen closes it, and the sidebar is back in the layout', async () => {
    const shell = setup();
    await open(shell);
    await page.viewport(1024, 768);
    await expect.poll(() => shell.sidebar().matches(':popover-open')).toBe(false);
    expect(shell.width(shell.sidebar())).toBe(256);
    expect(shell.trigger()).toHaveAttribute('aria-expanded', 'true');
    await page.viewport(400, 800);
  });

  test('open, it has no axe violations', async () => {
    const shell = setup();
    await open(shell);
    expect((await axe.run(shell.container)).violations).toEqual([]);
  });

  test('opening and closing has no diagnostics', async () => {
    const shell = setup();
    flush();
    await expect.poll(() => shell.trigger().getAttribute('aria-expanded')).toBe('false');

    const { artifact } = await captureArtifact(
      async () => {
        await open(shell);
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => shell.sidebar().matches(':popover-open')).toBe(false);
      },
      { scenario: 'app-shell-drawer' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\.layer/ });
  });
});
