import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import type { JSX } from '@solidjs/web';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { renderInRouter } from '../../../../test/router';
import { NavLink } from './nav-link';

describe('<NavLink />', () => {
  test('a link with its label, description and sections', () => {
    const { getByRole, container } = render(() => (
      <NavLink
        href="/inbox"
        label="Inbox"
        description="3 unread"
        leftSection={<svg />}
        rightSection={<span>3</span>}
        class="mine"
      />
    ));
    const link = getByRole('link');

    expect(link).toHaveAttribute('href', '/inbox');
    expect(link).toHaveClass('slp-nav-link', 'mine');
    expect(link).toHaveAttribute('data-variant', 'soft');
    expect(link).toHaveAttribute('data-color', 'primary');
    expect(link).not.toHaveAttribute('aria-current');
    expect(link).not.toHaveAttribute('data-active');
    expect(container.querySelector('[data-slot="nav-link-label"]')).toHaveTextContent('Inbox');
    expect(container.querySelector('[data-slot="nav-link-description"]')).toHaveTextContent('3 unread');
    expect(container.querySelector('[data-slot="nav-link-left-section"] svg')).not.toBeNull();
    expect(container.querySelector('[data-slot="nav-link-right-section"]')).toHaveTextContent('3');
    expect(container.querySelector('[data-slot="nav-link-chevron"]')).toBeNull();
  });

  test('parts that are not passed are not rendered', () => {
    const { container } = render(() => <NavLink href="/" label="Home" />);
    expect(container.querySelector('[data-slot="nav-link-description"]')).toBeNull();
    expect(container.querySelector('[data-slot="nav-link-left-section"]')).toBeNull();
    expect(container.querySelector('[data-slot="nav-link-right-section"]')).toBeNull();
  });

  test('the router marks the link to the current page, and moves the mark as it navigates', async () => {
    const { getByRole, history } = renderInRouter('/', ['/', '/inbox'], () => (
      <nav>
        <NavLink href="/" label="Home" />
        <NavLink href="/inbox" label="Inbox" />
      </nav>
    ));
    const home = getByRole('link', { name: 'Home' });
    const inbox = getByRole('link', { name: 'Inbox' });

    expect(home).toHaveAttribute('data-active', '');
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(inbox).not.toHaveAttribute('data-active');
    expect(inbox).not.toHaveAttribute('aria-current');

    fireEvent.click(inbox);
    flush();
    await expect.poll(() => history.get()).toBe('/inbox');
    expect(inbox).toHaveAttribute('data-active', '');
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(home).not.toHaveAttribute('data-active');
    expect(home).not.toHaveAttribute('aria-current');
  });

  test('without a router, data-active and aria-current set by hand mark the current page', () => {
    const { getByRole } = render(() => <NavLink href="/" label="Home" data-active aria-current="page" />);
    const link = getByRole('link', { name: 'Home' });

    expect(link).toHaveAttribute('data-active');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('a disabled link has no href, says it is disabled, ignores clicks, and the router never marks it', () => {
    const onClick = vi.fn();
    const { getByRole } = renderInRouter('/archive', ['/archive'], () => (
      <NavLink href="/archive" label="Archive" disabled onClick={onClick} />
    ));
    const link = getByRole('link', { name: 'Archive' });

    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('data-active');
    expect(link).not.toHaveAttribute('aria-current');
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('as renders another link component', () => {
    const RouterLink = (props: { href: string; children?: JSX.Element; class?: string }) => <a {...props} data-router="" />;
    const { getByRole } = render(() => <NavLink as={RouterLink} href="/settings" label="Settings" />);
    const link = getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('data-router', '');
    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveClass('slp-nav-link');
  });

  test('with children, a button that shows and hides them', () => {
    const onChange = vi.fn();
    const { getByRole, container } = render(() => (
      <NavLink label="Settings" onChange={onChange}>
        <NavLink href="/profile" label="Profile" />
      </NavLink>
    ));
    const button = getByRole('button', { name: 'Settings' });
    const group = document.getElementById(button.getAttribute('aria-controls')!)!;

    expect(button).toHaveClass('slp-nav-link');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(group).toHaveClass('slp-nav-link-children');
    expect(group).not.toHaveAttribute('data-opened');
    expect(group).toContainElement(container.querySelector('a[href="/profile"]'));
    expect(container.querySelector('[data-slot="nav-link-chevron"]')).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(button);
    flush();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(group).toHaveAttribute('data-opened', '');
    expect(onChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(button);
    flush();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  test('controlled: shows opened, and only asks to change it', () => {
    const [opened, setOpened] = createSignal(true);
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <NavLink label="Settings" opened={opened()} onChange={onChange}>
        <NavLink href="/profile" label="Profile" />
      </NavLink>
    ));
    const button = getByRole('button', { name: 'Settings' });

    fireEvent.click(button);
    flush();
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    setOpened(false);
    flush();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('a parent can start open, take its own chevron, keep it still, and be disabled', () => {
    const { getByRole, getByTestId } = render(() => (
      <NavLink label="Settings" defaultOpened disabled chevron={<svg data-testid="mine" />} disableChevronRotation>
        <NavLink href="/profile" label="Profile" />
      </NavLink>
    ));
    const button = getByRole('button', { name: 'Settings' });

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('data-rotate');
    expect(getByTestId('mine')).toBeDefined();
  });

  test('a click handler that prevents the default keeps a parent as it is', () => {
    const { getByRole } = render(() => (
      <NavLink label="Settings" onClick={(event: MouseEvent) => event.preventDefault()}>
        <NavLink href="/profile" label="Profile" />
      </NavLink>
    ));
    fireEvent.click(getByRole('button'));
    flush();
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('has no axe violations, closed and open', async () => {
    const { container, getByRole } = renderInRouter('/inbox', ['/', '/inbox'], () => (
      <nav aria-label="Main">
        <NavLink href="/" label="Home" />
        <NavLink href="/inbox" label="Inbox" description="3 unread" variant="solid" />
        <NavLink href="/archive" label="Archive" disabled />
        <NavLink label="Settings">
          <NavLink href="/profile" label="Profile" />
        </NavLink>
      </nav>
    ));
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(getByRole('button', { name: 'Settings' }));
    flush();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('opening a parent and navigating have no diagnostics or waste', async () => {
    const { getByRole, history } = renderInRouter('/', ['/', '/inbox', '/profile'], () => (
      <>
        <NavLink href="/" label="Home" />
        <NavLink href="/inbox" label="Inbox" />
        <NavLink label="Settings">
          <NavLink href="/profile" label="Profile" />
        </NavLink>
      </>
    ));

    const { artifact } = await captureArtifact(
      async () => {
        fireEvent.click(getByRole('button', { name: 'Settings' }));
        flush();
        fireEvent.click(getByRole('link', { name: 'Profile' }));
        flush();
        await expect.poll(() => history.get()).toBe('/profile');
      },
      { scenario: 'nav-link-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // The router's own location memos recompute twice to the same value on a navigation; NavLink adds none.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 2 });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./nav-link.fixtures.tsx', 'navLinks');
  });
});
