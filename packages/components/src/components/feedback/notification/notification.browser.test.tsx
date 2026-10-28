import { render } from '@solidjs/testing-library';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { Notification } from './notification';

const slot = (root: Element, name: string) => root.querySelector(`[data-slot="notification-${name}"]`)!;

describe('<Notification /> in a browser', () => {
  test('a card on the surface color with a shadow; without an icon, a bar of the role down the start edge', () => {
    const { getByRole, getByTestId } = render(() => (
      <>
        <Notification color="success" title="Saved">
          Your changes are saved.
        </Notification>
        <span data-testid="surface" style={{ color: 'var(--slp-color-base-100)' }} />
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));
    const notification = getByRole('status');
    const css = getComputedStyle(notification);
    const bar = getComputedStyle(notification, '::before');

    expect(css.backgroundColor).toBe(getComputedStyle(getByTestId('surface')).color);
    expect(css.boxShadow).not.toBe('none');
    expect(bar.backgroundColor).toBe(getComputedStyle(getByTestId('role')).color);
    expect(bar.width).toBe('4px');
    expect(parseFloat(bar.left)).toBeLessThan(parseFloat(css.paddingLeft));
  });

  test('with an icon: a circle of the role beside the text, and no bar', () => {
    const { getByRole, getByTestId } = render(() => (
      <>
        <Notification color="success" icon={<svg viewBox="0 0 24 24" />} title="Deployed">
          Version 0.0.1 is live.
        </Notification>
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
        <span data-testid="content" style={{ color: 'var(--slp-color-success-content)' }} />
      </>
    ));
    const notification = getByRole('status');
    const icon = slot(notification, 'icon');
    const css = getComputedStyle(icon);

    expect(getComputedStyle(notification, '::before').content).toBe('none');
    expect([css.width, css.height, css.borderTopLeftRadius]).toEqual(['32px', '32px', '50%']);
    expect([css.backgroundColor, css.color]).toEqual([
      getComputedStyle(getByTestId('role')).color,
      getComputedStyle(getByTestId('content')).color,
    ]);
    expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(slot(notification, 'title').getBoundingClientRect().left);
  });

  test('the close button sits at the end edge, centered on the icon', () => {
    const { getByRole } = render(() => (
      <Notification icon={<svg viewBox="0 0 24 24" />} title="Deployed" onClose={() => {}}>
        Version 0.0.1 is live.
      </Notification>
    ));
    const notification = getByRole('status');
    const box = notification.getBoundingClientRect();
    const icon = slot(notification, 'icon').getBoundingClientRect();
    const button = getByRole('button', { name: 'Close' }).getBoundingClientRect();

    expect(button.left).toBeGreaterThanOrEqual(slot(notification, 'content').getBoundingClientRect().right);
    expect(button.right).toBeLessThan(box.right);
    expect(Math.round(button.top + button.height / 2)).toBe(Math.round(icon.top + icon.height / 2));
  });

  test('loading: the Loader in the role color, with no circle', () => {
    const { getByRole, getByTestId } = render(() => (
      <>
        <Notification loading color="info" title="Uploading">
          3 of 5 files
        </Notification>
        <span data-testid="role" style={{ color: 'var(--slp-color-info)' }} />
      </>
    ));
    const icon = slot(getByRole('status'), 'icon');

    expect(getComputedStyle(icon).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(icon.querySelector('.slp-loader')!).borderTopColor).toBe(getComputedStyle(getByTestId('role')).color);
  });

  test('title and message stay readable in both color schemes', async () => {
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div data-slp-color-scheme={scheme} style={{ background: 'var(--slp-color-base-100)' }}>
          <Notification title="Saved">Your changes are saved.</Notification>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.map((v) => `${scheme}: ${v.id}`)).toEqual([]);
      unmount();
    }
  });
});
