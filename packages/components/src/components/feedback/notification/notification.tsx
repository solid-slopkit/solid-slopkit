import { createMemo, Match, omit, Show, Switch, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './notification.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { Loader } from '../loader';
import type { SlopColor } from '../../../core';
import { CloseButton } from '../../button/close-button';

export interface NotificationOwnProps {
  /** A short heading, above the message. */
  title?: JSX.Element;
  /** An icon in a circle of the color. Without the prop, a bar of the color runs down the start edge. */
  icon?: JSX.Element;
  /** Color role of the icon circle or the bar. Defaults to `primary`. */
  color?: SlopColor;
  /** Shows a Loader in place of the icon, and marks the notification busy. */
  loading?: boolean;
  /** Called when the close button is pressed. Passing it shows the button; removing the notification is up to the app. */
  onClose?: () => void;
  /** Accessible name of the close button. Defaults to `'Close'`. */
  closeButtonLabel?: string;
}

export type NotificationProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, NotificationOwnProps>;

const hasContent = (value: JSX.Element) => value != null && value !== false;

/**
 * A short message about something that happened: a card with `role="status"`, a title, and an icon or a colored bar.
 * With `onClose`, a close button. The look only; showing, stacking and removing notifications is up to the app.
 */
export function Notification(props: NotificationProps) {
  const mergedProps = mergeDefaultProps({ color: 'primary' as SlopColor }, props);
  const others = omit(mergedProps, 'class', 'children', 'title', 'icon', 'color', 'loading', 'onClose', 'closeButtonLabel');

  // Read once: a JSX prop is a getter that creates its elements on every read.
  const title = createMemo(() => props.title, { name: 'Notification.title' });
  // Whether the prop is passed at all, which doesn't create the icon. The icon itself is only created where it's
  // shown: one created while loading would never reach the page, and hydration would look for it there.
  const withIcon = untrack(() => 'icon' in props);
  // Which mark goes on the start side. One value, so finishing loading swaps the Loader for the icon in one step.
  const mark = createMemo((): 'loader' | 'icon' | 'none' => (mergedProps.loading ? 'loader' : withIcon ? 'icon' : 'none'), {
    name: 'Notification.mark',
  });

  return (
    <div
      role="status"
      aria-busy={mergedProps.loading ? 'true' : undefined}
      data-color={mergedProps.color}
      data-loading={mergedProps.loading ? '' : undefined}
      class={joinClass(['slp-notification', style.notification], mergedProps.class)}
      {...others}
    >
      <Switch>
        <Match when={mark() === 'loader'}>
          <div data-slot="notification-icon" class={style.icon}>
            {/* The notification is marked busy, so the Loader isn't announced on its own. */}
            <Loader aria-hidden="true" />
          </div>
        </Match>
        <Match when={mark() === 'icon'}>
          <div data-slot="notification-icon" class={style.icon}>
            {props.icon}
          </div>
        </Match>
      </Switch>
      <div data-slot="notification-content" class={style.content}>
        <Show when={hasContent(title())}>
          <div data-slot="notification-title" class={style.title}>
            {title()}
          </div>
        </Show>
        <div data-slot="notification-message" class={style.message}>
          {mergedProps.children}
        </div>
      </div>
      <Show when={!!props.onClose}>
        <CloseButton
          data-slot="notification-close-button"
          size="sm"
          label={props.closeButtonLabel}
          class={style.closeButton}
          onClick={() => props.onClose?.()}
        />
      </Show>
    </div>
  );
}
