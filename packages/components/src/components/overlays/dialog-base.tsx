// What Modal and Drawer share: a modal `<dialog>` with a header and a body, its presence, dismissal, focus and scroll
// lock. Internal; each component brings its own styles, slots and layout attributes.
import { createUniqueId, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createDismissal, createFocusScope, createPresence, createScrollLock, getTabbables, type Presence } from '../primitives';
import { transitionAttributes, type TransitionName } from '../utilities/transition/transition-attributes';
import { CloseButton } from '../button/close-button';
import { callHandler, type ElementProps } from '../../utils';
import { joinClass } from '../../style-props';

export interface DialogBaseOwnProps {
  /** Whether it is open. */
  opened: boolean;
  /** Called when it asks to close: the close button, Escape, or a press on the backdrop. Set `opened` to `false`. */
  onClose: () => void;
  /** Called once it has closed and its exit animation has finished, e.g. to clear what it showed. */
  onExited?: () => void;
  /** The heading, which also names the dialog. Without one, name it with `aria-label`. */
  title?: JSX.Element;
  /** Shows a close button in the header. Defaults to `true`. */
  withCloseButton?: boolean;
  /** Accessible name of the close button. Defaults to `'Close'`. */
  closeButtonLabel?: string;
  /** Whether a press on the backdrop closes it. Defaults to `true`. */
  closeOnClickOutside?: boolean;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Moves focus back to where it was when it closes. Defaults to `true`. */
  returnFocus?: boolean;
  /** Stops the page from scrolling while it's open. Defaults to `true`. */
  lockScroll?: boolean;
  /** The content's enter and exit animation. The backdrop fades with it. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 200. */
  transitionDuration?: number;
}

export type DialogBaseProps = ElementProps<JSX.DialogHtmlAttributes<HTMLDialogElement>, DialogBaseOwnProps>;

/**
 * The class names of a component's parts, from its CSS module, which defines `dialog`, `content`, `header`, `title`,
 * `close` and `body`.
 */
export type DialogBaseClasses = Readonly<Record<string, string>>;

export interface DialogBaseConfig {
  /** The component, for the error when there's no provider. */
  component: string;
  /** Its name, in the root class (`slp-<name>`) and the slots (`<name>-content`, …). */
  name: string;
  classes: DialogBaseClasses;
  /** The animation when `transition` isn't set. */
  defaultTransition: () => TransitionName;
  /** Its layout as data attributes on the `<dialog>`, with getters so they follow the props. */
  attributes: Record<string, string | undefined>;
}

interface Parts {
  presence: Presence;
  setDialog: (element: HTMLDialogElement) => void;
  setContent: (element: HTMLDivElement) => void;
}

/**
 * A modal `<dialog>` in the top layer, rendered while open, which makes the rest of the page inert and keeps focus
 * inside. Opening focuses the element marked `data-autofocus`, else the first focusable one; closing moves focus back
 * once it has left. The close button, Escape and a press on the backdrop ask it to close through `onClose`.
 */
export function DialogBase(props: DialogBaseProps & { config: DialogBaseConfig }) {
  let dialog: HTMLDialogElement | undefined;
  let content: HTMLDivElement | undefined;
  const config = untrack(() => props.config);

  const presence = createPresence({
    present: () => props.opened,
    element: () => dialog,
    onExited: () => props.onExited?.(),
  });
  createDismissal(config.component, {
    open: () => props.opened,
    elements: () => [content],
    onDismiss: () => props.onClose(),
    closeOnEscape: () => props.closeOnEscape ?? true,
    closeOnClickOutside: () => props.closeOnClickOutside ?? true,
  });
  // The dialog focuses its first element itself when it opens. Focus goes back once it has left: until then, the page
  // under it is inert and can't take focus.
  createFocusScope({
    open: presence.mounted,
    element: () => dialog,
    autoFocus: () => false,
    restoreFocus: () => props.returnFocus ?? true,
  });
  createScrollLock({ locked: () => (props.lockScroll ?? true) && presence.mounted() });

  return (
    <Show when={presence.mounted()}>
      <DialogElement
        {...props}
        presence={presence}
        setDialog={(element) => (dialog = element)}
        setContent={(element) => (content = element)}
      />
    </Show>
  );
}

function DialogElement(props: DialogBaseProps & { config: DialogBaseConfig } & Parts) {
  const others = omit(
    props,
    'ref',
    'class',
    'style',
    'children',
    'opened',
    'onClose',
    'onExited',
    'title',
    'withCloseButton',
    'closeButtonLabel',
    'closeOnClickOutside',
    'closeOnEscape',
    'returnFocus',
    'lockScroll',
    'transition',
    'transitionDuration',
    'config',
    'presence',
    'setDialog',
    'setContent',
    'onCancel',
  );
  // Neither changes: they're the component's.
  const config = untrack(() => props.config);
  const presence = untrack(() => props.presence);
  const { name, classes } = config;
  const duration = () => props.transitionDuration ?? 200;
  const withCloseButton = () => props.withCloseButton ?? true;
  const animation = transitionAttributes(presence, {
    transition: () => props.transition ?? config.defaultTransition(),
    duration,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });
  const titleId = `slp-${name}-title-${createUniqueId()}`;
  // Whether there's a title, without reading it: a JSX prop is read only where it's rendered.
  const withTitle = untrack(() => 'title' in props);
  let dialog: HTMLDialogElement | undefined;

  // Modal once it's in the document, then focus on the element marked `data-autofocus`, else the first focusable one,
  // else the content.
  onSettled(() => {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    const marked = dialog.querySelector<HTMLElement>('[data-autofocus]');
    const first = getTabbables(dialog)[0];
    const target = marked ?? first ?? dialog.querySelector<HTMLElement>(`[data-slot="${name}-content"]`);
    target?.focus({ preventScroll: true });
  });

  return (
    <dialog
      ref={[
        (el: HTMLDialogElement) => {
          dialog = el;
          props.setDialog(el);
        },
        untrack(() => props.ref),
      ]}
      aria-labelledby={withTitle ? titleId : undefined}
      data-status={presence.status()}
      {...config.attributes}
      class={joinClass([`slp-${name}`, classes.dialog], props.class)}
      style={{ '--_dialog-duration': `${duration()}ms`, ...props.style }}
      // Escape goes through the provider's order of overlays; the browser can still cancel without a key.
      onCancel={(event: Event) => {
        callHandler(props.onCancel, event);
        event.preventDefault();
        if (props.closeOnEscape ?? true) props.onClose();
      }}
      {...others}
    >
      <div
        ref={(el: HTMLDivElement) => props.setContent(el)}
        tabindex={-1}
        data-slot={`${name}-content`}
        data-transition={animation['data-transition']}
        data-status={animation['data-status']}
        class={`${classes.content} ${animation.class}`}
        style={animation.style}
      >
        <Show when={withTitle || withCloseButton()}>
          <div data-slot={`${name}-header`} class={classes.header}>
            {withTitle && (
              <h2 id={titleId} data-slot={`${name}-title`} class={classes.title}>
                {props.title}
              </h2>
            )}
            <Show when={withCloseButton()}>
              <CloseButton
                label={props.closeButtonLabel ?? 'Close'}
                data-slot={`${name}-close`}
                class={classes.close}
                onClick={() => props.onClose()}
              />
            </Show>
          </div>
        </Show>
        <div data-slot={`${name}-body`} class={classes.body}>
          {props.children}
        </div>
      </div>
    </dialog>
  );
}
