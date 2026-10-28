import { createEffect, createSignal, createUniqueId, flush, omit, onCleanup, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './tooltip.module.css';
import { createDismissal, createFloating, createPresence, type FloatingPlacement } from '../../primitives';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { callHandler, mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

/** A side of the target, optionally followed by an alignment along it: `top`, `top-start`, `right-end`, …. */
export type TooltipPosition = FloatingPlacement;

/** What the target spreads on its element: `<Button {...target}>`. */
export interface TooltipTargetAttributes {
  ref: (element: HTMLElement) => void;
  onPointerEnter: (event: PointerEvent) => void;
  onPointerLeave: (event: PointerEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  'aria-describedby': string;
}

export interface TooltipOwnProps {
  /** The tooltip's content. It describes the target, through `aria-describedby`. */
  label: JSX.Element;
  /** Whether it is shown, for a controlled tooltip. */
  opened?: boolean;
  /** Called when it would show or hide itself: hover, keyboard focus, or Escape. */
  onChange?: (opened: boolean) => void;
  /** Never shows it. */
  disabled?: boolean;
  /** Where it goes against the target. Defaults to `top`. It flips when there's no room. */
  position?: TooltipPosition;
  /** Gap between the target and the tooltip, in px. Defaults to 6. */
  offset?: number;
  /** Shows an arrow pointing at the target. */
  withArrow?: boolean;
  /** Color role of its background. Defaults to `neutral`. */
  color?: SlopColor;
  /** Delay before showing it on hover, in milliseconds. Defaults to 0. */
  openDelay?: number;
  /** Delay before hiding it once the pointer has left, in milliseconds, so the pointer can move onto it. Defaults to 100. */
  closeDelay?: number;
  /** Its enter and exit animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 100. */
  transitionDuration?: number;
  /** Renders the target. Spread the attributes on its element; it must take a ref. */
  children: (target: TooltipTargetAttributes) => JSX.Element;
}

export type TooltipProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, TooltipOwnProps>;

/**
 * A short description of its target, shown in the top layer while the target is hovered or has keyboard focus. The
 * pointer can move onto it without hiding it, and Escape hides it. Its element is always rendered, hidden while it's
 * not shown, so the target's `aria-describedby` always points at it.
 */
export function Tooltip(props: TooltipProps) {
  const mergedProps = mergeDefaultProps(
    {
      position: 'top',
      offset: 6,
      color: 'neutral',
      openDelay: 0,
      closeDelay: 100,
      transition: 'fade',
      transitionDuration: 100,
    } as const,
    props,
  );
  const others = omit(
    mergedProps,
    'ref',
    'class',
    'style',
    'children',
    'label',
    'opened',
    'onChange',
    'disabled',
    'position',
    'offset',
    'withArrow',
    'color',
    'openDelay',
    'closeDelay',
    'transition',
    'transitionDuration',
    'onPointerEnter',
    'onPointerLeave',
  );

  const [own, setOwn] = createSignal(false, { name: 'Tooltip.opened' });
  const opened = () => !props.disabled && (props.opened ?? own());
  // Compared with the state under `disabled`, so hovering a disabled target leaves nothing to show once it's enabled.
  const setOpened = (next: boolean) => {
    if (next && props.disabled) return;
    if (next === (props.opened ?? own())) return;
    if (props.opened === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => clearTimeout(timer);
  const schedule = (next: boolean, delay: number) => {
    cancel();
    if (delay > 0) timer = setTimeout(() => setOpened(next), delay);
    else setOpened(next);
  };
  onCleanup(cancel);

  let target: HTMLElement | undefined;
  let tooltip: HTMLSpanElement | undefined;
  let arrow: HTMLSpanElement | undefined;
  const id = `slp-tooltip-${createUniqueId()}`;

  const presence = createPresence({ present: opened, element: () => tooltip });
  const floating = createFloating({
    reference: () => target,
    floating: () => tooltip,
    arrow: () => arrow,
    open: presence.mounted,
    placement: () => mergedProps.position,
    offset: () => mergedProps.offset,
    arrowPadding: () => 8,
  });
  createDismissal('Tooltip', {
    open: opened,
    elements: () => [target, tooltip],
    onDismiss: () => {
      cancel();
      setOpened(false);
    },
    closeOnClickOutside: () => false,
  });

  // In the top layer while it's shown, then positioned at once rather than when it first resizes.
  createEffect(presence.mounted, (mounted) => {
    if (!tooltip) return;
    if (mounted) {
      tooltip.showPopover();
      floating.update();
    } else if (tooltip.matches(':popover-open')) {
      tooltip.hidePopover();
    }
  });

  const animation = transitionAttributes(presence, {
    transition: () => mergedProps.transition,
    duration: () => mergedProps.transitionDuration,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });

  // The pointer leaving hides it, unless the target still has keyboard focus, which keeps it shown.
  const leave = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || target?.matches(':focus-visible')) return;
    schedule(false, mergedProps.closeDelay);
  };

  const targetAttributes: TooltipTargetAttributes = {
    ref: (element) => (target = element),
    // A touch has no hover to end it; a tap focuses the target, which isn't keyboard focus either.
    onPointerEnter: (event) => {
      if (event.pointerType !== 'touch') schedule(true, mergedProps.openDelay);
    },
    onPointerLeave: leave,
    onFocus: (event) => {
      if ((event.currentTarget as HTMLElement).matches(':focus-visible')) schedule(true, 0);
    },
    onBlur: () => schedule(false, 0),
    'aria-describedby': id,
  };

  return (
    <>
      {props.children(targetAttributes)}
      <span
        ref={[(el: HTMLSpanElement) => (tooltip = el), untrack(() => props.ref)]}
        id={id}
        popover="manual"
        role="tooltip"
        data-placement={floating.placement()}
        data-color={mergedProps.color}
        data-transition={animation['data-transition']}
        data-status={animation['data-status']}
        class={joinClass(['slp-tooltip', style.tooltip, animation.class], mergedProps.class)}
        style={{ ...animation.style, ...props.style }}
        // Hovering the tooltip keeps it shown, so its content can be read with a magnifier.
        onPointerEnter={(event: PointerEvent) => {
          callHandler(props.onPointerEnter, event);
          cancel();
        }}
        onPointerLeave={(event: PointerEvent) => {
          callHandler(props.onPointerLeave, event);
          leave(event);
        }}
        {...others}
      >
        {props.label}
        <Show when={mergedProps.withArrow}>
          <span data-slot="tooltip-arrow" class={style.arrow} ref={(el) => (arrow = el)} />
        </Show>
      </span>
    </>
  );
}
