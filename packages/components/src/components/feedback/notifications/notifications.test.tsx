import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush, Show, createSignal } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { notifications, SlopkitUi, useNotifications, type UseNotifications } from '../../provider';
import { Notifications, type NotificationsProps } from './notifications';

// Entering takes a frame; leaving settles a microtask after a change when nothing animates, as in jsdom.
const settle = async () => {
  flush();
  if (vi.isFakeTimers()) vi.advanceTimersByTime(20);
  else await new Promise((resolve) => requestAnimationFrame(resolve));
  for (let tick = 0; tick < 4; tick++) await Promise.resolve();
  flush();
};

function setup(props: NotificationsProps = {}) {
  let api!: UseNotifications;
  const Grab = () => {
    api = useNotifications();
    return null;
  };
  const result = render(() => (
    <SlopkitUi>
      <Grab />
      <Notifications {...props} />
    </SlopkitUi>
  ));
  flush();
  // A named `section` is a region, which the queries here don't map, so it's found by its class.
  const region = () => result.container.querySelector<HTMLElement>('.slp-notifications')!;
  const shown = () => [...region().querySelectorAll('[data-slot="notification-message"]')].map((message) => message.textContent);
  return { ...result, api: () => api, region, shown };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('<Notifications />', () => {
  test('a named region, open as a manual popover, with a polite list', () => {
    const { region } = setup({ class: 'mine' });

    expect(region().tagName).toBe('SECTION');
    expect(region()).toHaveAttribute('aria-label', 'Notifications');
    expect(region()).toHaveClass('slp-notifications', 'mine');
    expect(region()).toHaveAttribute('popover', 'manual');
    expect(region()).toHaveAttribute('data-test-popover-open');
    expect(region()).toHaveAttribute('data-position', 'bottom-end');
    expect(region().querySelector('ol')).toHaveAttribute('aria-live', 'polite');
  });

  test('show() adds a notification and returns its id; it enters', async () => {
    const onOpen = vi.fn();
    const { api, region, shown } = setup();

    const id = api().show({ title: 'Saved', message: 'Your changes are saved.', color: 'success', onOpen });
    await settle();

    expect(id).toMatch(/^slp-notification-/);
    expect(shown()).toEqual(['Your changes are saved.']);
    const notification = region().querySelector('.slp-notification')!;
    expect(notification).toHaveAttribute('data-color', 'success');
    expect(notification.querySelector('[data-slot="notification-title"]')).toHaveTextContent('Saved');
    // The list announces it; the notification has no live role of its own.
    expect(notification).not.toHaveAttribute('role');
    expect(region().querySelector('[data-slot="notifications-item"]')).toHaveAttribute('data-status', 'open');
    expect(onOpen).toHaveBeenCalledWith(id);
  });

  test("role: 'alert' keeps an alert's own role", async () => {
    const { api, getByRole } = setup();
    api().show({ message: 'Failed to save', role: 'alert', color: 'error' });
    await settle();
    expect(getByRole('alert', { hidden: true })).toHaveTextContent('Failed to save');
  });

  test('an icon is shown when given, a bar otherwise', async () => {
    const { api, region } = setup();
    api().show({ message: 'Bar' });
    api().show({ message: 'Icon', icon: <svg /> });
    await settle();
    const [bar, icon] = region().querySelectorAll('.slp-notification');
    expect(bar.querySelector('[data-slot="notification-icon"]')).toBeNull();
    expect(icon.querySelector('[data-slot="notification-icon"] svg')).not.toBeNull();
  });

  test('the close button, or hide(), closes it; onClose is called once it has gone', async () => {
    const onClose = vi.fn();
    const { api, shown, getByRole } = setup();
    const first = api().show({ message: 'One', onClose });
    api().show({ message: 'Two', withCloseButton: false });
    await settle();

    expect(getByRole('button', { name: 'Close', hidden: true })).toBeDefined();
    fireEvent.click(getByRole('button', { name: 'Close', hidden: true }));
    await settle();
    expect(shown()).toEqual(['Two']);
    expect(onClose).toHaveBeenCalledWith(first);

    api().hide(api().notifications()[0].id);
    await settle();
    expect(shown()).toEqual([]);
  });

  test('update() changes a notification; show() with its id does too', async () => {
    const { api, region, shown } = setup();
    const id = api().show({ message: 'Uploading', loading: true, autoClose: false });
    await settle();
    expect(region().querySelector('.slp-notification')).toHaveAttribute('data-loading');

    api().update(id, { message: 'Uploaded', loading: false, color: 'success' });
    flush();
    expect(shown()).toEqual(['Uploaded']);
    expect(region().querySelector('.slp-notification')).not.toHaveAttribute('data-loading');

    expect(api().show({ id, message: 'Uploaded again' })).toBe(id);
    flush();
    expect(shown()).toEqual(['Uploaded again']);
  });

  test('limit: the rest wait their turn', async () => {
    const { api, shown } = setup({ limit: 2 });
    for (const message of ['A', 'B', 'C']) api().show({ message });
    await settle();
    expect(shown()).toEqual(['A', 'B']);

    api().hide(api().notifications()[0].id);
    await settle();
    expect(shown()).toEqual(['B', 'C']);
  });

  test('clean() closes them all, the waiting ones too', async () => {
    const { api, shown } = setup({ limit: 1 });
    api().show({ message: 'A' });
    api().show({ message: 'B' });
    await settle();
    api().clean();
    await settle();
    expect(shown()).toEqual([]);
    expect(api().notifications()).toEqual([]);
  });

  test('each closes on its own after autoClose; its own duration, false, or loading keep it longer', async () => {
    vi.useFakeTimers();
    const { api, shown } = setup({ autoClose: 1000 });
    api().show({ message: 'Default' });
    api().show({ message: 'Longer', autoClose: 3000 });
    api().show({ message: 'Stays', autoClose: false });
    const loading = api().show({ message: 'Loading', loading: true });
    await settle();

    vi.advanceTimersByTime(1000);
    await settle();
    expect(shown()).toEqual(['Longer', 'Stays', 'Loading']);

    api().update(loading, { loading: false });
    flush();
    vi.advanceTimersByTime(2000);
    await settle();
    expect(shown()).toEqual(['Stays']);
  });

  test('the countdown pauses while the pointer or focus is in the region, and goes on after', async () => {
    vi.useFakeTimers();
    const { api, shown, region, getByRole } = setup({ autoClose: 1000 });
    api().show({ message: 'Hello' });
    await settle();

    vi.advanceTimersByTime(600);
    fireEvent.pointerEnter(region());
    flush();
    vi.advanceTimersByTime(5000);
    await settle();
    expect(shown()).toEqual(['Hello']);

    fireEvent.pointerLeave(region());
    // jsdom won't focus inside a popover it doesn't show, so the focus events are sent; real focus is in the browser test.
    fireEvent.focusIn(getByRole('button', { name: 'Close', hidden: true }));
    flush();
    vi.advanceTimersByTime(5000);
    await settle();
    expect(shown()).toEqual(['Hello']);

    fireEvent.focusOut(getByRole('button', { name: 'Close', hidden: true }));
    flush();
    // 1000ms, less the 620 that ran before the pause (settle takes 20).
    vi.advanceTimersByTime(370);
    expect(shown()).toEqual(['Hello']);
    vi.advanceTimersByTime(10);
    await settle();
    expect(shown()).toEqual([]);
  });

  test('position and label', () => {
    const { region } = setup({ position: 'top-start', label: 'Alerts' });
    expect(region()).toHaveAttribute('data-position', 'top-start');
    expect(region()).toHaveAttribute('aria-label', 'Alerts');
  });

  test('has no axe violations', async () => {
    const { api, container } = setup();
    api().show({ title: 'Saved', message: 'Your changes are saved.' });
    api().show({ message: 'Failed', role: 'alert', color: 'error', icon: <svg aria-hidden="true" /> });
    await settle();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('showing, updating and closing have no diagnostics or waste', async () => {
    const { api } = setup();
    const { artifact } = await captureArtifact(
      async () => {
        const id = api().show({ message: 'One', loading: true });
        api().show({ message: 'Two' });
        await settle();
        api().update(id, { message: 'Done', loading: false });
        flush();
        api().hide(id);
        await settle();
      },
      { scenario: 'notifications' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // Allowed: the presence's mounted flag, which recomputes on each status but changes on two (three runs here); the
    // close button's guard, which keeps an update from reaching Notification's button; and the list's insert, which
    // reports itself unchanged when one of two notifications leaves.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 5 });
    // Its status, mounted flag and animation effect: four statuses for the one that leaves, two for the one that stays.
    expect(artifact).toStayWithinRerunBudget(18, { scope: /presence\./ });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./notifications.fixtures.tsx', 'region');
  });
});

describe('useNotifications() and the notifications facade', () => {
  test('the hook throws outside <SlopkitUi>', () => {
    const Lost = () => {
      useNotifications();
      return null;
    };
    expect(() => render(() => <Lost />)).toThrow('useNotifications() must be called inside <SlopkitUi>.');
  });

  test('the facade reaches the most recently mounted provider, and the one before once it unmounts', async () => {
    const [second, setSecond] = createSignal(true);
    const { container } = render(() => (
      <>
        <SlopkitUi>
          <Notifications label="First" />
        </SlopkitUi>
        <Show when={second()}>
          <SlopkitUi>
            <Notifications label="Second" />
          </SlopkitUi>
        </Show>
      </>
    ));
    flush();
    const messages = (name: string) =>
      [...container.querySelector(`[aria-label="${name}"]`)!.querySelectorAll('[data-slot="notification-message"]')].map(
        (message) => message.textContent,
      );

    notifications.show({ message: 'To the second' });
    await settle();
    expect(messages('Second')).toEqual(['To the second']);

    setSecond(false);
    flush();
    const id = notifications.show({ message: 'To the first' });
    await settle();
    expect(messages('First')).toEqual(['To the first']);
    notifications.hide(id);
    await settle();
    expect(messages('First')).toEqual([]);
  });

  test('a nested provider shares its root notifications', async () => {
    let inner!: UseNotifications;
    const Grab = () => {
      inner = useNotifications();
      return null;
    };
    const { container } = render(() => (
      <SlopkitUi>
        <Notifications />
        <SlopkitUi locale="de-DE">
          <Grab />
        </SlopkitUi>
      </SlopkitUi>
    ));
    flush();
    inner.show({ message: 'From inside' });
    await settle();
    expect(container.querySelector('.slp-notifications')).toHaveTextContent('From inside');
  });

  test('without a region, show() warns, and hide() drops it at once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let api!: UseNotifications;
    const Grab = () => {
      api = useNotifications();
      return null;
    };
    const onClose = vi.fn();
    render(() => (
      <SlopkitUi>
        <Grab />
      </SlopkitUi>
    ));
    const id = api.show({ message: 'Nowhere', onClose });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no <Notifications> is mounted'));
    api.hide(id);
    expect(onClose).toHaveBeenCalledWith(id);
    expect(api.notifications()).toEqual([]);
  });
});
