import { createEffect, createMemo, createSignal, For, omit, onCleanup, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './notifications.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { createPresence } from '../../primitives';
import { useSlopkitUi } from '../../provider/slopkit-ui';
import type { NotificationEntry, NotificationStore } from '../../provider/notifications';
import { Notification } from '../notification';

export type NotificationsPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface NotificationsOwnProps {
  /** Which corner or edge of the viewport they appear in. Defaults to `bottom-end`. */
  position?: NotificationsPosition;
  /** How many are shown at once; the rest wait their turn. Defaults to 5. */
  limit?: number;
  /** How long a notification stays, in milliseconds, unless it sets its own; `false` to stay until closed. Defaults to 4000. */
  autoClose?: number | false;
  /** The region's accessible name. Defaults to `'Notifications'`. */
  label?: string;
}

export type NotificationsProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, NotificationsOwnProps>;

function NotificationItem(props: {
  entry: NotificationEntry;
  store: NotificationStore;
  autoClose: () => number | false;
  paused: () => boolean;
}) {
  // Each row keeps its entry for life.
  const { id, data } = untrack(() => props.entry);
  let element: HTMLLIElement | undefined;

  // Mounted closed and opened a frame later, so it enters with a transition.
  const [entered, setEntered] = createSignal(false, { name: 'notification.entered' });
  onSettled(() => {
    setEntered(true);
  });
  const presence = createPresence({
    present: () => entered() && !props.entry.leaving(),
    element: () => element,
    onEntered: () => data().onOpen?.(id),
  });
  // Gone once it's left: after its exit animation, or at once when it's hidden before it has finished entering,
  // which never animates out.
  createEffect(
    () => (props.entry.leaving() ? presence.status() : 'staying'),
    (status) => {
      if (status === 'closed') props.store.remove(id);
    },
    { name: 'notification.gone' },
  );

  // Closes on its own after its duration, counted only while the region isn't paused. Loading, it waits.
  const duration = () => {
    const current = data();
    return current.loading ? false : (current.autoClose ?? props.autoClose());
  };
  let remaining = 0;
  let counted: number | false | undefined;
  createEffect(
    () => [duration(), props.paused() || props.entry.leaving()] as const,
    ([ms, stopped]) => {
      if (ms !== counted) {
        counted = ms;
        remaining = ms === false ? 0 : ms;
      }
      if (ms === false || stopped) return;
      const start = Date.now();
      const timer = setTimeout(() => props.store.hide(id), remaining);
      return () => {
        clearTimeout(timer);
        remaining = Math.max(0, remaining - (Date.now() - start));
      };
    },
    { name: 'notification.autoClose' },
  );

  // One close handler, passed while the close button is wanted, so a change to the data leaves the button alone.
  const close = () => props.store.hide(id);
  const closable = createMemo(() => data().withCloseButton !== false, { name: 'notification.closable' });

  // Notification picks the icon circle when the `icon` prop is passed at all, so it's passed only when given.
  const iconProps = untrack(() => 'icon' in data())
    ? {
        get icon() {
          return data().icon;
        },
      }
    : {};

  return (
    <li
      ref={(el: HTMLLIElement) => (element = el)}
      data-status={presence.status()}
      data-slot="notifications-item"
      class={style.item}
    >
      <div data-slot="notifications-item-body" class={style.body}>
        <Notification
          {...iconProps}
          title={data().title}
          color={data().color}
          loading={data().loading}
          // The list announces what's added, so a notification has no live role of its own unless it's an alert.
          role={data().role}
          onClose={closable() ? close : undefined}
          closeButtonLabel={data().closeButtonLabel}
          class={data().class}
        >
          {data().message}
        </Notification>
      </div>
    </li>
  );
}

/**
 * Where the notifications of `useNotifications()` and the `notifications` facade appear: a region fixed to a corner
 * or an edge of the viewport, in the top layer as a manual popover. Render it once, inside `<SlopkitUi>`. New
 * notifications are announced politely; each closes on its own after `autoClose`, which pauses while the pointer
 * or focus is in the region.
 */
export function Notifications(props: NotificationsProps) {
  const others = omit(
    props,
    'class',
    'position',
    'limit',
    'autoClose',
    'label',
    'onPointerEnter',
    'onPointerLeave',
    'onFocusIn',
    'onFocusOut',
  );
  const store = useSlopkitUi('Notifications').notifications;
  onCleanup(store.attachRegion());
  let element: HTMLElement | undefined;

  const shown = createMemo(() => store.notifications().slice(0, Math.max(1, props.limit ?? 5)), {
    name: 'Notifications.shown',
  });

  const [hovered, setHovered] = createSignal(false, { name: 'Notifications.hovered' });
  const [focused, setFocused] = createSignal(false, { name: 'Notifications.focused' });
  const paused = () => hovered() || focused();

  // Always open, so it's in the top layer and its live list is there before anything is added to it.
  onSettled(() => element?.showPopover());
  // Something opened later, such as a modal, sits above it in the top layer. Showing it again brings it back on
  // top when a notification arrives, unless focus is in it, which hiding would move.
  let count = 0;
  createEffect(
    () => shown().length,
    (next) => {
      const added = next > count;
      count = next;
      if (!added || !element?.matches(':popover-open') || element.contains(document.activeElement)) return;
      element.hidePopover();
      element.showPopover();
    },
    { name: 'Notifications.toFront' },
  );

  return (
    <section
      ref={(el: HTMLElement) => (element = el)}
      popover="manual"
      aria-label={props.label ?? 'Notifications'}
      data-position={props.position ?? 'bottom-end'}
      class={joinClass(['slp-notifications', style.notifications], props.class)}
      onPointerEnter={(event: PointerEvent) => {
        callHandler(props.onPointerEnter, event);
        setHovered(true);
      }}
      onPointerLeave={(event: PointerEvent) => {
        callHandler(props.onPointerLeave, event);
        setHovered(false);
      }}
      onFocusIn={(event: FocusEvent) => {
        callHandler(props.onFocusIn, event);
        setFocused(true);
      }}
      onFocusOut={(event: FocusEvent) => {
        callHandler(props.onFocusOut, event);
        if (!element?.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      {...others}
    >
      <ol data-slot="notifications-list" aria-live="polite" class={style.list}>
        <For each={shown()}>
          {(entry) => <NotificationItem entry={entry} store={store} autoClose={() => props.autoClose ?? 4000} paused={paused} />}
        </For>
      </ol>
    </section>
  );
}
