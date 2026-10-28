import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import type { JSX } from '@solidjs/web';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { renderInRouter } from '../../../../test/router';
import { NavTabs } from './nav-tabs';

const projectPaths = ['/project', '/project/activity', '/project/members'];
const projectTabs = () => (
  <NavTabs aria-label="Project">
    <NavTabs.Link href="/project/activity">Activity</NavTabs.Link>
    <NavTabs.Link href="/project/members">Members</NavTabs.Link>
    <NavTabs.Link href="/project/settings" disabled>
      Settings
    </NavTabs.Link>
  </NavTabs>
);

describe('<NavTabs />', () => {
  test('a nav of links, with their sections', () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <NavTabs aria-label="Project" class="mine">
        <NavTabs.Link href="/" leftSection={<svg />} class="link">
          Overview
        </NavTabs.Link>
        <NavTabs.Link href="/activity" rightSection={<span>3</span>}>
          Activity
        </NavTabs.Link>
      </NavTabs>
    ));
    const nav = getByRole('navigation', { name: 'Project' });
    const [overview, activity] = getAllByRole('link');

    expect(nav).toHaveClass('slp-nav-tabs', 'mine');
    expect(nav).toHaveAttribute('data-variant', 'underline');
    expect(nav).toHaveAttribute('data-color', 'primary');
    expect(nav).toHaveAttribute('data-size', 'md');
    expect(nav).toHaveAttribute('data-orientation', 'horizontal');
    expect(container.querySelector('[data-slot="nav-tabs-list"]')).toContainElement(overview);
    expect(overview).toHaveClass('slp-nav-tabs-link', 'link');
    expect(overview).toHaveAttribute('href', '/');
    expect(overview).not.toHaveAttribute('aria-current');
    expect(overview).not.toHaveAttribute('data-active');
    expect(overview.querySelector('[data-slot="nav-tabs-link-section"][data-position="left"] svg')).not.toBeNull();
    expect(overview.querySelector('[data-slot="nav-tabs-link-label"]')).toHaveTextContent('Overview');
    expect(overview.querySelector('[data-position="right"]')).toBeNull();
    expect(activity.querySelector('[data-position="right"]')).toHaveTextContent('3');
    expect(container.querySelector('[role="tablist"], [role="tab"]')).toBeNull();
  });

  test('variant, color, size, orientation and grow', () => {
    const { getByRole, container } = render(() => (
      <NavTabs variant="soft" color="accent" size="lg" orientation="vertical" grow>
        <NavTabs.Link href="/">Home</NavTabs.Link>
      </NavTabs>
    ));
    const nav = getByRole('navigation');

    expect(nav).toHaveAttribute('data-variant', 'soft');
    expect(nav).toHaveAttribute('data-color', 'accent');
    expect(nav).toHaveAttribute('data-size', 'lg');
    expect(nav).toHaveAttribute('data-orientation', 'vertical');
    expect(container.querySelector('[data-slot="nav-tabs-list"]')).toHaveAttribute('data-grow', '');
  });

  test('the router marks the link to the current page, and moves the mark as it navigates', async () => {
    const { getByRole, history } = renderInRouter('/project/activity', projectPaths, projectTabs);
    const activity = getByRole('link', { name: 'Activity' });
    const members = getByRole('link', { name: 'Members' });

    expect(activity).toHaveAttribute('data-active', '');
    expect(activity).toHaveAttribute('aria-current', 'page');
    expect(members).not.toHaveAttribute('data-active');
    expect(members).not.toHaveAttribute('aria-current');

    fireEvent.click(members);
    flush();
    await expect.poll(() => history.get()).toBe('/project/members');
    expect(members).toHaveAttribute('data-active', '');
    expect(members).toHaveAttribute('aria-current', 'page');
    expect(activity).not.toHaveAttribute('data-active');
    expect(activity).not.toHaveAttribute('aria-current');
  });

  test('the router marks a link to a parent of the current page too, without aria-current', () => {
    const { getByRole } = renderInRouter('/project/activity', projectPaths, () => (
      <NavTabs>
        <NavTabs.Link href="/project">Overview</NavTabs.Link>
        <NavTabs.Link href="/project/activity">Activity</NavTabs.Link>
      </NavTabs>
    ));
    const overview = getByRole('link', { name: 'Overview' });

    expect(overview).toHaveAttribute('data-active', '');
    expect(overview).not.toHaveAttribute('aria-current');
  });

  test('without a router, data-active and aria-current set by hand mark the current page', () => {
    const { getByRole } = render(() => (
      <NavTabs>
        <NavTabs.Link href="/" data-active aria-current="page">
          Home
        </NavTabs.Link>
      </NavTabs>
    ));
    const link = getByRole('link', { name: 'Home' });

    expect(link).toHaveAttribute('data-active');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('a disabled link has no href, says it is disabled, ignores clicks, and the router never marks it', () => {
    const onClick = vi.fn();
    const { getByRole } = renderInRouter('/settings', ['/settings'], () => (
      <NavTabs>
        <NavTabs.Link href="/settings" disabled onClick={onClick}>
          Settings
        </NavTabs.Link>
      </NavTabs>
    ));
    const link = getByRole('link', { name: 'Settings' });

    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled', '');
    expect(link).not.toHaveAttribute('data-active');
    expect(link).not.toHaveAttribute('aria-current');
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('as renders another link component', () => {
    const RouterLink = (props: { href: string; children?: JSX.Element; class?: string }) => <a {...props} data-router="" />;
    const { getByRole } = render(() => (
      <NavTabs>
        <NavTabs.Link as={RouterLink} href="/settings">
          Settings
        </NavTabs.Link>
      </NavTabs>
    ));
    const link = getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('data-router', '');
    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveClass('slp-nav-tabs-link');
  });

  test('has no axe violations', async () => {
    const { container } = renderInRouter('/project/activity', projectPaths, projectTabs);
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('navigating has no diagnostics or waste', async () => {
    const { getByRole, history } = renderInRouter('/project/activity', projectPaths, projectTabs);

    const { artifact } = await captureArtifact(
      async () => {
        fireEvent.click(getByRole('link', { name: 'Members' }));
        flush();
        await expect.poll(() => history.get()).toBe('/project/members');
      },
      { scenario: 'nav-tabs-navigate' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // The router's own location memos recompute twice to the same value on a navigation; NavTabs adds none.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 2 });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./nav-tabs.fixtures.tsx', 'navTabs');
  });
});
