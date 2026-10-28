import { render } from '@solidjs/testing-library';
import { createRouter, memoryHistory } from '@solidjs/router';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Tabs } from '../tabs';
import { NavTabs, type NavTabsProps } from './nav-tabs';

/** Three links in a router at `/one`: One is the current page's, Three is disabled. */
function setup(props: Partial<NavTabsProps> = {}) {
  const Router = createRouter({
    routes: ['/one', '/two'].map((path) => ({ path, component: () => null })),
    history: memoryHistory('/one'),
  });
  return render(() => (
    <Router>
      {(page) => (
        <div style={{ padding: '20px', width: '400px' }}>
          <NavTabs aria-label="Project" {...props}>
            <NavTabs.Link href="/one">One</NavTabs.Link>
            <NavTabs.Link href="/two">Two</NavTabs.Link>
            <NavTabs.Link href="/three" disabled>
              Three
            </NavTabs.Link>
          </NavTabs>
          {page.children}
        </div>
      )}
    </Router>
  ));
}

describe('<NavTabs /> in a browser', () => {
  test('the links look like tabs: the current one marked, the disabled one faded, no underline', () => {
    const { getByRole } = setup();
    const one = getComputedStyle(getByRole('link', { name: 'One' }));
    const two = getComputedStyle(getByRole('link', { name: 'Two' }));
    const three = getComputedStyle(getByRole('link', { name: 'Three' }));

    expect(one.boxShadow).toContain('inset');
    expect(two.boxShadow).toBe('none');
    expect(one.color).not.toBe(two.color);
    expect(two.textDecorationLine).toBe('none');
    expect(Number(three.opacity)).toBeLessThan(1);
  });

  test('a link is drawn like the tab of the same variant', () => {
    const links = setup({ variant: 'pills', size: 'lg' });
    const link = links.getByRole('link', { name: 'One' });
    const linkStyle = getComputedStyle(link);
    const look = [linkStyle.backgroundColor, linkStyle.color, linkStyle.borderTopLeftRadius, linkStyle.fontSize];
    const height = link.getBoundingClientRect().height;
    links.unmount();

    const { getByRole } = render(() => (
      <Tabs variant="pills" size="lg" defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">One</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    ));
    const tab = getByRole('tab');
    const tabStyle = getComputedStyle(tab);

    expect(look).toEqual([tabStyle.backgroundColor, tabStyle.color, tabStyle.borderTopLeftRadius, tabStyle.fontSize]);
    expect(height).toBe(tab.getBoundingClientRect().height);
  });

  test('the link the router marks is drawn as selected, and the selection follows navigation', async () => {
    const { getByRole } = setup({ variant: 'pills' });
    const one = getByRole('link', { name: 'One' });
    const two = getByRole('link', { name: 'Two' });
    const filled = (link: HTMLElement) => getComputedStyle(link).backgroundColor !== 'rgba(0, 0, 0, 0)';

    expect(filled(one)).toBe(true);
    expect(filled(two)).toBe(false);

    await userEvent.click(two);
    await expect.poll(() => filled(two)).toBe(true);
    await expect.poll(() => filled(one)).toBe(false);
  });

  test('vertical links stack in a column', () => {
    const { getByRole } = setup({ orientation: 'vertical' });
    const one = getByRole('link', { name: 'One' }).getBoundingClientRect();
    const two = getByRole('link', { name: 'Two' }).getBoundingClientRect();

    expect(two.top).toBeGreaterThan(one.top);
    expect(two.left).toBe(one.left);
  });
});
