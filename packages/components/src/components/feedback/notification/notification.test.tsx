import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Notification } from './notification';

const Icon = () => <svg aria-hidden="true" data-testid="icon" viewBox="0 0 24 24" />;
const slot = (root: Element, name: string) => root.querySelector(`[data-slot="notification-${name}"]`);

describe('<Notification />', () => {
  test('a div with role="status", primary by default, with the message in a slot and no icon slot', () => {
    const { getByRole } = render(() => <Notification>Saved.</Notification>);
    const notification = getByRole('status');

    expect(notification.tagName).toBe('DIV');
    expect(notification).toHaveClass('slp-notification');
    expect(notification).toHaveAttribute('data-color', 'primary');
    expect(notification).not.toHaveAttribute('aria-busy');
    expect(slot(notification, 'message')).toHaveTextContent('Saved.');
    expect(slot(notification, 'title')).toBeNull();
    expect(slot(notification, 'icon')).toBeNull();
  });

  test('title and icon get their slots; color, role and other props pass through', () => {
    const { getByRole, getByTestId } = render(() => (
      <Notification title="Deploy failed" icon={<Icon />} color="error" role="alert" id="n" class="mine">
        The build broke.
      </Notification>
    ));
    const notification = getByRole('alert');

    expect(slot(notification, 'title')).toHaveTextContent('Deploy failed');
    expect(slot(notification, 'icon')).toContainElement(getByTestId('icon'));
    expect(notification).toHaveAttribute('data-color', 'error');
    expect(notification).toHaveAttribute('id', 'n');
    expect(notification).toHaveClass('slp-notification', 'mine');
    expect(notification).not.toHaveAttribute('title');
  });

  test('onClose shows a close button at the end, which calls it; closeButtonLabel names it', () => {
    const onClose = vi.fn();
    const { getAllByRole, getByRole } = render(() => (
      <>
        <Notification onClose={onClose} closeButtonLabel="Dismiss">
          Closable.
        </Notification>
        <Notification>Not closable.</Notification>
      </>
    ));
    const [closable, plain] = getAllByRole('status');
    const button = getByRole('button', { name: 'Dismiss' });

    expect(slot(closable, 'close-button')).toBe(button);
    expect(closable.lastElementChild).toBe(button);
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(slot(plain, 'close-button')).toBeNull();

    button.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('loading shows a hidden Loader in place of the icon and marks it busy', () => {
    const { getByRole, queryByTestId } = render(() => (
      <Notification loading icon={<Icon />} title="Uploading">
        3 of 5 files
      </Notification>
    ));
    const notification = getByRole('status', { name: '' });
    const loader = slot(notification, 'icon')!.querySelector('.slp-loader')!;

    expect(notification).toHaveAttribute('aria-busy', 'true');
    expect(notification).toHaveAttribute('data-loading', '');
    expect(loader).toHaveAttribute('aria-hidden', 'true');
    expect(queryByTestId('icon')).toBeNull();
  });

  test('finishing loading brings the icon back without diagnostics or waste', async () => {
    const [loading, setLoading] = createSignal(true, { name: 'loading' });
    const { container, getByTestId } = render(() => (
      <Notification loading={loading()} icon={<Icon />} title="Uploading">
        Done soon
      </Notification>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setLoading(false), { scenario: 'notification-loaded' });

    const notification = container.firstElementChild!;
    expect(notification).not.toHaveAttribute('aria-busy');
    expect(slot(notification, 'icon')).toContainElement(getByTestId('icon'));
    expect(notification.querySelector('.slp-loader')).toBeNull();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(8);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Notification title="Saved">Your changes are saved.</Notification>
        <Notification color="success" icon={<Icon />} title="Deployed" onClose={() => {}}>
          Version 0.0.1 is live.
        </Notification>
        <Notification loading title="Uploading">
          3 of 5 files
        </Notification>
        <Notification color="error" role="alert" title="Deploy failed">
          The build broke.
        </Notification>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./notification.fixtures.tsx', 'notifications');
  });
});
