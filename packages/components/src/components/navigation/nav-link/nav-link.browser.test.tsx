import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { NavLink } from './nav-link';

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

describe('<NavLink /> in a browser', () => {
  test('the row fills its container, and noWrap cuts the label with an ellipsis', () => {
    const { getByRole, container } = render(() => (
      <div style={{ width: '160px' }}>
        <NavLink href="/" label="A label far too long to fit in the row" noWrap />
      </div>
    ));
    const label = container.querySelector<HTMLElement>('[data-slot="nav-link-label"]')!;

    expect(getByRole('link').getBoundingClientRect().width).toBe(160);
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  });

  test('closed children take no space and are out of the tab order; opened, they are indented', async () => {
    const { getByRole, container } = render(() => (
      <div style={{ width: '240px' }}>
        <NavLink label="Settings">
          <NavLink href="/profile" label="Profile" />
        </NavLink>
      </div>
    ));
    const group = container.querySelector<HTMLElement>('[data-slot="nav-link-children"]')!;
    const parent = getByRole('button', { name: 'Settings' });

    expect(group.getBoundingClientRect().height).toBe(0);
    expect(getComputedStyle(group).visibility).toBe('hidden');

    parent.click();
    flush();
    await settle();
    const child = container.querySelector<HTMLElement>('a[href="/profile"]')!;
    expect(group.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(getComputedStyle(group).visibility).toBe('visible');
    expect(child.getBoundingClientRect().left).toBeGreaterThan(parent.getBoundingClientRect().left);
  });
});
