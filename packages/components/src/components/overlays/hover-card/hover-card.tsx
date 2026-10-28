import { createContext, createSignal, flush, omit, onCleanup, onSettled, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './hover-card.module.css';
import {
  createDismissal,
  createFloating,
  createPresence,
  type Floating,
  type FloatingPlacement,
  type Presence,
} from '../../primitives';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

/** A side of the target, optionally followed by an alignment along it: `bottom`, `bottom-start`, `right-end`, …. */
export type HoverCardPosition = FloatingPlacement;

export interface HoverCardProps {
  /** Whether the dropdown is shown, for a controlled hover card. */
  opened?: boolean;
  /** Called when it would show or hide itself: hover, keyboard focus, Escape or a press outside. */
  onChange?: (opened: boolean) => void;
  /** Where the dropdown goes against the target. Defaults to `bottom`. It flips when there's no room. */
  position?: HoverCardPosition;
  /** Gap between the target and the dropdown, in px. Defaults to 8. */
  offset?: number;
  /** Shows an arrow pointing at the target. */
  withArrow?: boolean;
  /** Delay before showing it on hover, in milliseconds. Defaults to 0. */
  openDelay?: number;
  /** Delay before hiding it once the pointer has left, in milliseconds, so the pointer can move onto it. Defaults to 150. */
  closeDelay?: number;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** The dropdown's enter and exit animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 150. */
  transitionDuration?: number;
  /** HoverCard.Target and HoverCard.Dropdown. */
  children?: JSX.Element;
}

interface HoverCardContextValue {
  presence: Presence;
  floating: Floating;
  withArrow: () => boolean;
  transition: () => TransitionName;
  transitionDuration: () => number;
  /** Shows it after `openDelay`, or hides it after `closeDelay`, unless focus is inside it. */
  hover: (next: boolean) => void;
  /** Keeps it as it is: the pointer is back over it. */
  cancel: () => void;
  /** Shows it at once, for keyboard focus on the target. */
  focus: () => void;
  /** Focus has left for `next`: hides it unless that's still inside the target or the dropdown. */
  blur: (next: EventTarget | null) => void;
  setTarget: (element: HTMLElement | undefined) => void;
  setDropdown: (element: HTMLElement | undefined) => void;
  setArrow: (element: HTMLElement | undefined) => void;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

function useHoverCard(component: string): HoverCardContextValue {
  const context = useContext(HoverCardContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <HoverCard>.`);
  return context;
}

/** What the target spreads on its element: `<Anchor {...target}>`. */
export interface HoverCardTargetAttributes {
  ref: (element: HTMLElement) => void;
  onPointerEnter: (event: PointerEvent) => void;
  onPointerLeave: (event: PointerEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
}

export interface HoverCardTargetProps {
  /** Renders the element the card shows for, usually a link. Spread the attributes on it; it must take a ref. */
  children: (target: HoverCardTargetAttributes) => JSX.Element;
}

/** The element that shows the card while it's hovered or has keyboard focus, and that the dropdown is positioned against. */
export function HoverCardTarget(props: HoverCardTargetProps) {
  const context = useHoverCard('HoverCard.Target');
  const attributes: HoverCardTargetAttributes = {
    ref: (element) => context.setTarget(element),
    // A touch has no hover to end it: a tap follows the link instead.
    onPointerEnter: (event) => {
      if (event.pointerType !== 'touch') context.hover(true);
    },
    onPointerLeave: (event) => {
      if (event.pointerType !== 'touch') context.hover(false);
    },
    onFocus: (event) => {
      if ((event.currentTarget as HTMLElement).matches(':focus-visible')) context.focus();
    },
    onBlur: (event) => context.blur(event.relatedTarget),
  };
  // Called once, untracked: a signal the render function reads directly would otherwise rebuild the target, losing
  // focus. What changes goes in the attributes' getters and in the JSX's own expressions.
  return <>{untrack(() => props.children(attributes))}</>;
}

export type HoverCardDropdownProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/**
 * The floating content, in the top layer, rendered while shown. Put it right after the target, so Tab moves from the
 * target into it.
 */
export function HoverCardDropdown(props: HoverCardDropdownProps) {
  const context = useHoverCard('HoverCard.Dropdown');
  return (
    <Show when={context.presence.mounted()}>
      <HoverCardDropdownElement {...props} />
    </Show>
  );
}

function HoverCardDropdownElement(props: HoverCardDropdownProps) {
  const context = useHoverCard('HoverCard.Dropdown');
  const others = omit(props, 'ref', 'class', 'style', 'children', 'onPointerEnter', 'onPointerLeave', 'onFocusOut');
  const animation = transitionAttributes(context.presence, {
    transition: context.transition,
    duration: context.transitionDuration,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });
  let element: HTMLDivElement | undefined;

  // In the top layer once it's in the document, then positioned at once rather than when it first resizes.
  onSettled(() => {
    element?.showPopover();
    context.floating.update();
  });
  onCleanup(() => {
    context.setDropdown(undefined);
    context.setArrow(undefined);
  });

  return (
    <div
      ref={[
        (el: HTMLDivElement) => {
          element = el;
          context.setDropdown(el);
        },
        untrack(() => props.ref),
      ]}
      popover="manual"
      data-slot="hover-card-dropdown"
      data-placement={context.floating.placement()}
      data-transition={animation['data-transition']}
      data-status={animation['data-status']}
      class={joinClass(['slp-hover-card', style.dropdown, animation.class], props.class)}
      style={{ ...animation.style, ...props.style }}
      onPointerEnter={(event: PointerEvent) => {
        callHandler(props.onPointerEnter, event);
        context.cancel();
      }}
      onPointerLeave={(event: PointerEvent) => {
        callHandler(props.onPointerLeave, event);
        if (event.pointerType !== 'touch') context.hover(false);
      }}
      onFocusOut={(event: FocusEvent) => {
        callHandler(props.onFocusOut, event);
        context.blur(event.relatedTarget);
      }}
      {...others}
    >
      {props.children}
      <Show when={context.withArrow()}>
        <div data-slot="hover-card-arrow" class={style.arrow} ref={(el) => context.setArrow(el)} />
      </Show>
    </div>
  );
}

/**
 * Rich content about a target, such as a profile behind a username, shown in the top layer while the target is
 * hovered or has keyboard focus. Build it from HoverCard.Target and HoverCard.Dropdown. The pointer can move onto the
 * dropdown, and Tab from the target moves into it; it stays shown while focus is inside either. Escape and a press
 * outside close it.
 */
export function HoverCard(props: HoverCardProps) {
  const [own, setOwn] = createSignal(false, { name: 'HoverCard.opened' });
  const opened = () => props.opened ?? own();
  const setOpened = (next: boolean) => {
    if (next === opened()) return;
    if (props.opened === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  let target: HTMLElement | undefined;
  let dropdown: HTMLElement | undefined;
  let arrow: HTMLElement | undefined;
  const inside = (node: EventTarget | null) => node instanceof Node && (!!target?.contains(node) || !!dropdown?.contains(node));
  // Focus on the target from the keyboard, or anywhere in the dropdown, keeps it shown.
  const hasFocus = () => !!target?.matches(':focus-visible') || !!dropdown?.contains(document.activeElement);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => clearTimeout(timer);
  const schedule = (next: boolean, delay: number) => {
    cancel();
    if (delay > 0) timer = setTimeout(() => setOpened(next), delay);
    else setOpened(next);
  };
  onCleanup(cancel);

  // Closing while focus is in the dropdown would lose it as the dropdown unmounts: it goes back to the target,
  // without that focus showing it again.
  let restoring = false;
  const close = () => {
    cancel();
    if (dropdown?.contains(document.activeElement)) {
      restoring = true;
      target?.focus();
      restoring = false;
    }
    setOpened(false);
  };

  const presence = createPresence({ present: opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => target,
    floating: () => dropdown,
    arrow: () => arrow,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom',
    offset: () => props.offset ?? 8,
    arrowPadding: () => 12,
  });
  createDismissal('HoverCard', {
    open: opened,
    elements: () => [target, dropdown],
    onDismiss: close,
    closeOnEscape: () => props.closeOnEscape ?? true,
  });

  const context: HoverCardContextValue = {
    presence,
    floating,
    withArrow: () => !!props.withArrow,
    transition: () => props.transition ?? 'fade',
    transitionDuration: () => props.transitionDuration ?? 150,
    hover: (next) => {
      if (next) schedule(true, props.openDelay ?? 0);
      else if (!hasFocus()) schedule(false, props.closeDelay ?? 150);
    },
    cancel,
    focus: () => {
      if (!restoring) schedule(true, 0);
    },
    blur: (next) => {
      if (!inside(next)) schedule(false, 0);
    },
    setTarget: (element) => (target = element),
    setDropdown: (element) => (dropdown = element),
    setArrow: (element) => (arrow = element),
  };

  return <HoverCardContext value={context}>{props.children}</HoverCardContext>;
}

HoverCard.Target = HoverCardTarget;
HoverCard.Dropdown = HoverCardDropdown;
