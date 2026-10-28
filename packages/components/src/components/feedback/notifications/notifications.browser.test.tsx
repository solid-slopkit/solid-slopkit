import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi, useNotifications, type UseNotifications } from '../../provider';
import { Modal } from '../../overlays/modal';
import { Notifications, type NotificationsProps } from './notifications';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function setup(props: NotificationsProps = {}, opened = false) {
  let api!: UseNotifications;
  const Grab = () => {
    api = useNotifications();
    return null;
  };
  const result = render(() => (
    <SlopkitUi>
      <Grab />
      <button type="button" style={{ position: 'fixed', inset: '0', width: '100vw', height: '100vh' }}>
        Page
      </button>
      <Modal opened={opened} onClose={() => {}} title="Dialog">
        <p>Modal content</p>
      </Modal>
      <Notifications {...props} />
    </SlopkitUi>
  ));
  flush();
  const region = () => result.container.querySelector<HTMLElement>('.slp-notifications')!;
  return { ...result, api: () => api, region };
}

describe('<Notifications /> in a browser', () => {
  test('in the top layer, in its corner; presses outside the notifications reach the page', async () => {
    const { api, region } = setup({ position: 'bottom-end' });
    expect(region().matches(':popover-open')).toBe(true);

    api().show({ title: 'Saved', message: 'Your changes are saved.', autoClose: false });
    flush();
    await wait(300);
    const notification = region().querySelector<HTMLElement>('.slp-notification')!;
    const box = notification.getBoundingClientRect();
    expect(Math.round(window.innerWidth - box.right)).toBe(16);
    expect(Math.round(window.innerHeight - box.bottom)).toBe(20);
    expect(document.elementFromPoint(box.left + 10, box.top + 10)?.closest('.slp-notification')).toBe(notification);

    // The region's padding, above the notification, lets the press through to the page.
    const regionBox = region().getBoundingClientRect();
    expect(document.elementFromPoint(box.left + 10, regionBox.top + 4)?.textContent).toBe('Page');
  });

  test('enters by growing and fading in, and leaves the same way', async () => {
    const { api, region } = setup();
    const id = api().show({ message: 'Hello', autoClose: false });
    flush();
    const item = () => region().querySelector<HTMLElement>('[data-slot="notifications-item"]');
    await wait(50);
    expect(Number(getComputedStyle(item()!).opacity)).toBeLessThan(1);
    await wait(300);
    expect(item()).toHaveAttribute('data-status', 'open');
    expect(getComputedStyle(item()!).opacity).toBe('1');

    api().hide(id);
    flush();
    await wait(50);
    expect(item()).toHaveAttribute('data-status', 'ending');
    await wait(300);
    expect(item()).toBeNull();
  });

  test('one that arrives while a modal is open is shown again, which puts the region above the modal', async () => {
    const { api, region } = setup({}, true);
    await wait(300);
    expect(document.querySelector('dialog')!.matches(':modal')).toBe(true);
    const toggles: string[] = [];
    region().addEventListener('beforetoggle', (event) => toggles.push((event as ToggleEvent).newState));

    api().show({ message: 'Over the modal', autoClose: false });
    flush();
    await wait(50);
    // Last in the top layer is drawn on top. Outside the modal, it's inert, as the rest of the page is, so it can't
    // be hit-tested: the order is what can be checked.
    expect(toggles).toEqual(['closed', 'open']);
    expect(region().matches(':popover-open')).toBe(true);
  });

  test('focus in the region pauses the countdown', async () => {
    const { api, region, getByRole } = setup({ autoClose: 300 });
    api().show({ message: 'Hello' });
    flush();
    await wait(100);
    getByRole('button', { name: 'Close' }).focus();
    await wait(600);
    expect(region()).toHaveTextContent('Hello');

    await userEvent.click(getByRole('button', { name: 'Page' }));
    await wait(700);
    expect(region()).not.toHaveTextContent('Hello');
  });
});
