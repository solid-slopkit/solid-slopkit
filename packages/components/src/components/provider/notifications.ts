import { createSignal, type Accessor } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import { createFacadeRegistry, warn } from './facade';
import type { SlopColor } from '../../core';

/** What a notification shows and how long it stays. Everything but `message` is optional. */
export interface NotificationData {
  /** Names it, for `update` and `hide`. Showing one with an id that's already shown updates that one. Generated when left out. */
  id?: string;
  /** A short heading, above the message. */
  title?: JSX.Element;
  /** The message. */
  message: JSX.Element;
  /** An icon in a circle of the color; without one, a bar of the color. */
  icon?: JSX.Element;
  /** Color role of the icon circle or the bar. Defaults to `primary`. */
  color?: SlopColor;
  /** Shows a Loader in place of the icon. A loading notification doesn't close on its own until it's done. */
  loading?: boolean;
  /** How long it stays, in milliseconds, or `false` to stay until closed. Defaults to the region's `autoClose`. */
  autoClose?: number | false;
  /** Whether it has a close button. Defaults to `true`. */
  withCloseButton?: boolean;
  /** Accessible name of the close button. Defaults to `'Close'`. */
  closeButtonLabel?: string;
  /** `alert` for one the reader must hear at once, such as an error. Others are announced politely. */
  role?: 'alert';
  /** A class on the notification. */
  class?: string;
  /** Called once it's shown. */
  onOpen?: (id: string) => void;
  /** Called once it's gone, however it was closed. */
  onClose?: (id: string) => void;
}

/** A notification in the store. */
export interface NotificationEntry {
  id: string;
  data: Accessor<NotificationData>;
  /** Whether it's on its way out: hidden, and leaving once its exit animation has run. */
  leaving: Accessor<boolean>;
}

export interface UseNotifications {
  /** Shows a notification and returns its id. */
  show: (data: NotificationData) => string;
  /** Changes a shown notification: the fields given replace its own. */
  update: (id: string, data: Partial<NotificationData>) => void;
  /** Closes a notification. */
  hide: (id: string) => void;
  /** Closes every notification, and drops those waiting to be shown. */
  clean: () => void;
  /** The notifications, shown and waiting, oldest first. */
  notifications: Accessor<readonly NotificationEntry[]>;
}

export interface NotificationStore extends UseNotifications {
  /** Takes a notification out once it has left. */
  remove: (id: string) => void;
  /** Called by a region while it's mounted, which then animates notifications out. Returns the function that unregisters it. */
  attachRegion: () => () => void;
}

interface Entry extends NotificationEntry {
  // Plain copies of the signals' values: a signal written outside a flush still reads its old value, and the
  // store's methods may be called several times before one (show, then hide at once).
  current: NotificationData;
  isLeaving: boolean;
  setData: (data: NotificationData) => void;
  setLeaving: (leaving: boolean) => void;
}

let generated = 0;

/**
 * The notifications of one provider tree, oldest first. Writes happen outside rendering, from event handlers and
 * timers, so the store has no owner of its own. A region (`<Notifications>`) renders them; without one, nothing is
 * shown and a hidden notification is dropped at once.
 */
export function createNotificationStore(): NotificationStore {
  // The list itself, and the signal components read it through.
  let list: readonly Entry[] = [];
  const [entries, setEntries] = createSignal<readonly Entry[]>(list, { name: 'notifications.entries' });
  const commit = (next: readonly Entry[]) => {
    list = next;
    setEntries(next);
  };
  let regions = 0;

  const find = (id: string) => list.find((entry) => entry.id === id);

  const remove = (id: string) => {
    const entry = find(id);
    if (!entry) return;
    commit(list.filter((other) => other !== entry));
    entry.current.onClose?.(id);
  };

  const hide = (id: string) => {
    const entry = find(id);
    if (!entry || entry.isLeaving) return;
    if (regions === 0) return remove(id);
    entry.isLeaving = true;
    entry.setLeaving(true);
  };

  const update = (id: string, data: Partial<NotificationData>) => {
    const entry = find(id);
    if (!entry) return;
    entry.current = { ...entry.current, ...data, id };
    entry.setData(entry.current);
  };

  const show = (data: NotificationData) => {
    if (isServer) {
      warn('notifications are shown in the browser only; show() on the server does nothing.');
      return data.id ?? '';
    }
    if (regions === 0) warn('show() was called, but no <Notifications> is mounted to show it.');
    const id = data.id ?? `slp-notification-${++generated}`;
    const existing = find(id);
    if (existing && !existing.isLeaving) {
      update(id, data);
      return id;
    }
    if (existing) remove(id);
    const current = { ...data, id };
    const [read, setData] = createSignal<NotificationData>(current, { name: 'notification.data' });
    const [leaving, setLeaving] = createSignal(false, { name: 'notification.leaving' });
    commit([...list, { id, data: read, setData, leaving, setLeaving, current, isLeaving: false }]);
    return id;
  };

  const clean = () => {
    for (const entry of list) hide(entry.id);
  };

  return {
    show,
    update,
    hide,
    clean,
    remove,
    notifications: entries,
    attachRegion() {
      regions++;
      return () => {
        regions--;
      };
    },
  };
}

const registry = createFacadeRegistry<NotificationStore>('notifications');

/** Makes a root provider's store the one the `notifications` facade reaches, while the provider is mounted. */
export const registerNotificationStore = registry.register;
const target = registry.target;

/**
 * Shows notifications from anywhere, such as a fetch wrapper's error handler, through the most recently mounted
 * `<SlopkitUi>`. Inside components, prefer `useNotifications()`, which reaches the provider the component is in.
 * On the server it does nothing.
 */
export const notifications = {
  show: (data: NotificationData): string => target('show')?.show(data) ?? data.id ?? '',
  update: (id: string, data: Partial<NotificationData>): void => target('update')?.update(id, data),
  hide: (id: string): void => target('hide')?.hide(id),
  clean: (): void => target('clean')?.clean(),
};
