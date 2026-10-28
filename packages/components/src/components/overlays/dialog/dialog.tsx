import { omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './dialog.module.css';
import { createPresence, type Presence } from '../../primitives';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { CloseButton } from '../../button/close-button';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

/** Where it sits in the viewport: a corner, or the middle of the top or bottom edge. */
export type DialogPosition = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface DialogOwnProps {
  /** Whether it is shown. */
  opened: boolean;
  /** Called when it asks to close: the close button, or Escape while focus is inside. Set `opened` to `false`. */
  onClose?: () => void;
  /** Where it sits. Defaults to `bottom-right`. */
  position?: DialogPosition;
  /** Gap between it and the viewport's edges, in px. Defaults to 16. */
  offset?: number;
  /** Width: `xs` to `xl` (16 to 32rem). Defaults to `md` (20rem). It never grows past the viewport. */
  size?: SlopSize;
  /** Shows a close button in its corner. Defaults to `true`. */
  withCloseButton?: boolean;
  /** Accessible name of the close button. Defaults to `'Close'`. */
  closeButtonLabel?: string;
  /** Whether Escape closes it while focus is inside. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Its enter and exit animation. Defaults to `fade-up` at the bottom, `fade-down` at the top. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 200. */
  transitionDuration?: number;
}

export type DialogProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, DialogOwnProps>;

/**
 * A small window in a corner of the viewport that leaves the page usable, such as a feedback prompt or a chat: a
 * non-modal `role="dialog"` in the top layer, rendered while open. It doesn't move focus or keep it inside; Tab
 * reaches it where it is in the document. Name it with `aria-label` or `aria-labelledby`.
 */
export function Dialog(props: DialogProps) {
  let element: HTMLDivElement | undefined;
  const presence = createPresence({ present: () => props.opened, element: () => element });

  return (
    <Show when={presence.mounted()}>
      <DialogElement {...props} presence={presence} setElement={(el) => (element = el)} />
    </Show>
  );
}

function DialogElement(props: DialogProps & { presence: Presence; setElement: (element: HTMLDivElement) => void }) {
  const others = omit(
    props,
    'ref',
    'class',
    'style',
    'children',
    'opened',
    'onClose',
    'position',
    'offset',
    'size',
    'withCloseButton',
    'closeButtonLabel',
    'closeOnEscape',
    'transition',
    'transitionDuration',
    'presence',
    'setElement',
    'onKeyDown',
  );
  // The presence never changes: it's the parent's.
  const presence = untrack(() => props.presence);
  const position = () => props.position ?? 'bottom-right';
  const animation = transitionAttributes(presence, {
    transition: () => props.transition ?? (position().startsWith('top') ? 'fade-down' : 'fade-up'),
    duration: () => props.transitionDuration ?? 200,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });
  let element: HTMLDivElement | undefined;

  // In the top layer once it's in the document.
  onSettled(() => element?.showPopover());

  return (
    <div
      ref={[
        (el: HTMLDivElement) => {
          element = el;
          props.setElement(el);
        },
        untrack(() => props.ref),
      ]}
      popover="manual"
      role="dialog"
      data-position={position()}
      data-size={props.size ?? 'md'}
      data-with-close-button={(props.withCloseButton ?? true) ? '' : undefined}
      data-transition={animation['data-transition']}
      data-status={animation['data-status']}
      class={joinClass(['slp-dialog', style.dialog, animation.class], props.class)}
      style={{ ...animation.style, '--_dialog-offset': `${props.offset ?? 16}px`, ...props.style }}
      // Escape closes it only from inside: it isn't modal, so a key pressed elsewhere on the page isn't meant for it.
      // It's not in the provider's order of overlays, where it would own Escape for the whole page; from inside an
      // overlay open in it, such as a menu, the key is that overlay's, which the provider closes.
      onKeyDown={(event: KeyboardEvent) => {
        callHandler(props.onKeyDown, event);
        if (event.key !== 'Escape' || event.defaultPrevented || !(props.closeOnEscape ?? true)) return;
        if ((event.target as Element).closest('[popover], dialog') !== element) return;
        event.preventDefault();
        props.onClose?.();
      }}
      {...others}
    >
      {props.children}
      <Show when={props.withCloseButton ?? true}>
        <CloseButton
          size="sm"
          label={props.closeButtonLabel ?? 'Close'}
          data-slot="dialog-close"
          class={style.close}
          onClick={() => props.onClose?.()}
        />
      </Show>
    </div>
  );
}
