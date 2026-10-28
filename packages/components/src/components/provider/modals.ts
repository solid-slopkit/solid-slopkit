import { createSignal, type Accessor } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { ModalOwnProps } from '../overlays/modal';
import type { ButtonRootProps } from '../button/button';
import { createFacadeRegistry, warn } from './facade';

/** A modal to open: Modal's own props, its content, and an id. */
export interface ModalSettings extends Omit<ModalOwnProps, 'opened' | 'onClose' | 'onExited'> {
  /** Names it, for `update` and `close`. Generated when left out. */
  id?: string;
  /**
   * The content. A function is rendered inside the modal, under the provider, so components that need it (and
   * anything reactive) belong in one: `children: () => <ProfileForm />`. Plain text can be passed as is.
   */
  children?: JSX.Element | (() => JSX.Element);
  /** A class on the `<dialog>`. */
  class?: string;
  /** Called once it has closed and its exit animation has finished, however it was closed. */
  onClose?: () => void;
}

/** The buttons' text. Built-in strings with English defaults. */
export interface ConfirmLabels {
  /** Defaults to `'Confirm'`. */
  confirm?: string;
  /** Defaults to `'Cancel'`. */
  cancel?: string;
}

/** A modal that asks to confirm: the content, then a cancel and a confirm button. */
export interface ConfirmModalSettings extends ModalSettings {
  labels?: ConfirmLabels;
  /**
   * Props for the confirm Button, such as `color: 'error'` for a destructive action. Read when it opens, except
   * `loading` and `disabled`, which follow `update()`.
   */
  confirmProps?: ButtonRootProps;
  /** Props for the cancel Button, read like `confirmProps`. */
  cancelProps?: ButtonRootProps;
  /** Called when the confirm button is pressed. */
  onConfirm?: () => void;
  /** Called when it's closed any other way: the cancel button, the close button, Escape or the backdrop. */
  onCancel?: () => void;
  /** Whether confirming closes it. Defaults to `true`; with `false`, call `close(id)` when done, e.g. after a request. */
  closeOnConfirm?: boolean;
  /** Whether cancelling with the cancel button closes it. Defaults to `true`. */
  closeOnCancel?: boolean;
}

/** A modal in the store. */
export interface ModalEntry {
  id: string;
  kind: 'modal' | 'confirm';
  settings: Accessor<ConfirmModalSettings>;
  /** Whether it's open: false while it animates out, before it leaves the store. */
  opened: Accessor<boolean>;
}

export interface UseModals {
  /** Opens a modal and returns its id. */
  open: (settings: ModalSettings) => string;
  /** Opens a modal that asks to confirm, and returns its id. */
  openConfirm: (settings: ConfirmModalSettings) => string;
  /** Asks to confirm: resolves `true` when confirmed, `false` when closed any other way. */
  confirm: (settings: ConfirmModalSettings) => Promise<boolean>;
  /** Changes an open modal: the fields given replace its own. */
  update: (id: string, settings: Partial<ConfirmModalSettings>) => void;
  /** Closes a modal. An unanswered confirm modal counts as cancelled. */
  close: (id: string) => void;
  /** Closes every modal, the newest first. */
  closeAll: () => void;
  /** The open modals, oldest first, including those animating out. */
  modals: Accessor<readonly ModalEntry[]>;
}

export interface ModalStore extends UseModals {
  /** The confirm button was pressed. */
  confirmed: (id: string) => void;
  /** The cancel button was pressed. */
  cancelled: (id: string) => void;
  /** Takes a modal out once it has animated out. */
  remove: (id: string) => void;
  /** Called by a `<Modals>` host while it's mounted. Returns the function that unregisters it. */
  attachHost: () => () => void;
}

interface Entry extends ModalEntry {
  // Plain copies of the signals' values: a signal written outside a flush still reads its old value.
  current: ConfirmModalSettings;
  isOpened: boolean;
  /** A confirm modal that has been confirmed or cancelled, so closing it later calls neither again. */
  answered: boolean;
  setSettings: (settings: ConfirmModalSettings) => void;
  setOpened: (opened: boolean) => void;
}

let generated = 0;

/**
 * The modals of one provider tree, oldest first. Like the notifications, it's written from event handlers and has no
 * owner. A host (`<Modals>`) renders them; without one, opening does nothing but warn.
 */
export function createModalStore(): ModalStore {
  let list: readonly Entry[] = [];
  const [entries, setEntries] = createSignal<readonly Entry[]>(list, { name: 'modals.entries' });
  const commit = (next: readonly Entry[]) => {
    list = next;
    setEntries(next);
  };
  let hosts = 0;

  const find = (id: string) => list.find((entry) => entry.id === id);

  const remove = (id: string) => {
    const entry = find(id);
    if (!entry) return;
    commit(list.filter((other) => other !== entry));
    entry.current.onClose?.();
  };

  /** Closes it; one that animates out leaves the store once it has. */
  const shut = (entry: Entry) => {
    if (!entry.isOpened) return;
    entry.isOpened = false;
    entry.setOpened(false);
    if (hosts === 0) remove(entry.id);
  };

  const answer = (entry: Entry, confirmed: boolean) => {
    if (entry.kind !== 'confirm' || entry.answered) return;
    entry.answered = true;
    if (confirmed) entry.current.onConfirm?.();
    else entry.current.onCancel?.();
  };

  const add = (kind: ModalEntry['kind'], settings: ConfirmModalSettings) => {
    if (isServer) {
      warn('modals open in the browser only; opening one on the server does nothing.');
      return settings.id ?? '';
    }
    if (hosts === 0) warn('a modal was opened, but no <Modals> is mounted to show it.');
    const id = settings.id ?? `slp-modal-${++generated}`;
    const existing = find(id);
    if (existing) remove(id);
    const current = { ...settings, id };
    const [read, setSettings] = createSignal<ConfirmModalSettings>(current, { name: 'modal.settings' });
    const [opened, setOpened] = createSignal(true, { name: 'modal.opened' });
    const entry: Entry = { id, kind, settings: read, opened, current, isOpened: true, answered: false, setSettings, setOpened };
    commit([...list, entry]);
    // Nothing would show it: closed at once, which cancels a confirm.
    if (hosts === 0) {
      answer(entry, false);
      shut(entry);
    }
    return id;
  };

  const close = (id: string) => {
    const entry = find(id);
    if (!entry) return;
    answer(entry, false);
    shut(entry);
  };

  const store: ModalStore = {
    open: (settings) => add('modal', settings),
    openConfirm: (settings) => add('confirm', settings),
    confirm: (settings) =>
      new Promise<boolean>((resolve) => {
        store.openConfirm({
          ...settings,
          onConfirm: () => {
            settings.onConfirm?.();
            resolve(true);
          },
          onCancel: () => {
            settings.onCancel?.();
            resolve(false);
          },
        });
        // On the server nothing opens, so nothing will answer.
        if (isServer) resolve(false);
      }),
    update(id, settings) {
      const entry = find(id);
      if (!entry) return;
      entry.current = { ...entry.current, ...settings, id };
      entry.setSettings(entry.current);
    },
    close,
    closeAll() {
      for (const entry of [...list].reverse()) close(entry.id);
    },
    modals: entries,
    confirmed(id) {
      const entry = find(id);
      if (!entry) return;
      answer(entry, true);
      if (entry.current.closeOnConfirm ?? true) shut(entry);
    },
    cancelled(id) {
      const entry = find(id);
      if (!entry) return;
      answer(entry, false);
      if (entry.current.closeOnCancel ?? true) shut(entry);
    },
    remove,
    attachHost() {
      hosts++;
      return () => {
        hosts--;
      };
    },
  };
  return store;
}

const registry = createFacadeRegistry<ModalStore>('modals');

/** Makes a root provider's store the one the `modals` facade reaches, while the provider is mounted. */
export const registerModalStore = registry.register;

/**
 * Opens modals from anywhere, such as a route guard or a fetch wrapper, through the most recently mounted
 * `<SlopkitUi>`. Inside components, prefer `useModals()`, which reaches the provider the component is in. On the
 * server it does nothing, and `confirm` resolves `false`.
 */
export const modals = {
  open: (settings: ModalSettings): string => registry.target('open')?.open(settings) ?? settings.id ?? '',
  openConfirm: (settings: ConfirmModalSettings): string =>
    registry.target('openConfirm')?.openConfirm(settings) ?? settings.id ?? '',
  confirm: (settings: ConfirmModalSettings): Promise<boolean> =>
    registry.target('confirm')?.confirm(settings) ?? Promise.resolve(false),
  update: (id: string, settings: Partial<ConfirmModalSettings>): void => registry.target('update')?.update(id, settings),
  close: (id: string): void => registry.target('close')?.close(id),
  closeAll: (): void => registry.target('closeAll')?.closeAll(),
};
