import { render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import type { SlopColor } from '../../../core';
import { Alert } from './alert';

const slot = (root: Element, name: string) => root.querySelector(`[data-slot="alert-${name}"]`)!;

describe('<Alert /> in a browser', () => {
  test('the icon sits on the start side, centered on the first line; the title is above the message', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '320px' }}>
        <Alert title="Heads up" icon={<svg viewBox="0 0 24 24" />}>
          A message long enough to wrap onto a second line in a narrow box.
        </Alert>
      </div>
    ));
    const alert = getByRole('alert');
    const icon = slot(alert, 'icon').querySelector('svg')!.getBoundingClientRect();
    const title = slot(alert, 'title').getBoundingClientRect();
    const message = slot(alert, 'message').getBoundingClientRect();

    expect(icon.right).toBeLessThanOrEqual(title.left);
    expect(Math.round(icon.width)).toBe(20);
    expect(Math.round(icon.top + icon.height / 2)).toBe(Math.round(title.top + title.height / 2));
    expect(message.top).toBeGreaterThanOrEqual(title.bottom);
    expect(getComputedStyle(slot(alert, 'title')).fontWeight).toBe('600');
  });

  test('the close button sits at the end edge, centered on the first line', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '320px' }}>
        <Alert title="Heads up" onClose={() => {}}>
          A message long enough to wrap onto a second line in a narrow box.
        </Alert>
      </div>
    ));
    const alert = getByRole('alert');
    const box = alert.getBoundingClientRect();
    const button = getByRole('button', { name: 'Close' }).getBoundingClientRect();
    const title = slot(alert, 'title').getBoundingClientRect();

    expect(button.left).toBeGreaterThanOrEqual(title.right);
    expect(button.right).toBeLessThan(box.right);
    expect(button.top).toBeGreaterThan(box.top);
    expect(Math.round(button.top + button.height / 2)).toBe(Math.round(title.top + title.height / 2));
  });

  test('soft: a tint and edge of the role, base-colored text, a role-colored icon', () => {
    const { getByRole, getByTestId } = render(() => (
      <>
        <Alert color="success" icon={<svg viewBox="0 0 24 24" />}>
          Saved.
        </Alert>
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
        <span data-testid="text" style={{ color: 'var(--slp-color-base-content)' }} />
      </>
    ));
    const alert = getByRole('alert');
    const css = getComputedStyle(alert);

    expect(css.backgroundColor).toMatch(/\/ 0\.12\)$/);
    expect(css.borderTopColor).toMatch(/\/ 0\.3\)$/);
    expect(css.color).toBe(getComputedStyle(getByTestId('text')).color);
    expect(getComputedStyle(slot(alert, 'icon')).color).toBe(getComputedStyle(getByTestId('role')).color);
  });

  test('solid fills the box with the role; outline only draws its edge', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <Alert color="error" variant="solid">
          Solid
        </Alert>
        <Alert color="error" variant="outline">
          Outline
        </Alert>
        <span data-testid="role" style={{ color: 'var(--slp-color-error)' }} />
        <span data-testid="content" style={{ color: 'var(--slp-color-error-content)' }} />
      </>
    ));
    const [solid, outline] = getAllByRole('alert').map((el) => getComputedStyle(el));
    const role = getComputedStyle(getByTestId('role')).color;

    expect([solid.backgroundColor, solid.color]).toEqual([role, getComputedStyle(getByTestId('content')).color]);
    expect(outline.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    // The border is half the role.
    expect(outline.borderTopColor).toMatch(/\/ 0\.5\)$/);
  });

  test('soft and outline text stay readable for every color, in both color schemes', async () => {
    const colors: SlopColor[] = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'];
    for (const scheme of ['light', 'dark']) {
      const { container, unmount } = render(() => (
        <div
          data-slp-color-scheme={scheme}
          style={{ background: 'var(--slp-color-base-100)', color: 'var(--slp-color-base-content)' }}
        >
          <For each={['soft', 'outline'] as const}>
            {(variant) => (
              <For each={colors}>
                {(color) => (
                  <Alert color={color} variant={variant} title={`${variant} ${color}`}>
                    The message.
                  </Alert>
                )}
              </For>
            )}
          </For>
        </div>
      ));

      const results = await axe.run(container, { runOnly: ['color-contrast'] });
      expect(results.violations.flatMap((v) => v.nodes.map((n) => `${scheme}: ${n.html.slice(0, 60)}`))).toEqual([]);
      unmount();
    }
  });
});
