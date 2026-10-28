import { Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createPresence } from '../../primitives';
import { transitionAttributes, type TransitionName, type TransitionStyleAttributes } from './transition-attributes';

export type { TransitionName };

/** What the child spreads on its root element: `<div {...transition}>`. */
export interface TransitionAttributes extends TransitionStyleAttributes {
  ref: (element: HTMLElement) => void;
}

export interface TransitionProps {
  /** Whether the content is shown. Changing it plays the enter or exit animation. */
  mounted: boolean;
  /** The animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Enter duration, in milliseconds. Defaults to 200. */
  duration?: number;
  /** Exit duration, in milliseconds. Defaults to `duration`. */
  exitDuration?: number;
  /** CSS timing function of both. Defaults to `ease`. */
  timingFunction?: string;
  /** Keep the content in the DOM, with `display: none`, while it's hidden. Read once. */
  keepMounted?: boolean;
  /** Called when the enter animation has finished. */
  onEntered?: () => void;
  /** Called when the exit animation has finished and the content is gone. */
  onExited?: () => void;
  /** Renders the content. Spread the attributes on its root element; it must take a ref. */
  children: (transition: TransitionAttributes) => JSX.Element;
}

/**
 * Animates content in and out as `mounted` changes. The content stays rendered until its exit animation finishes,
 * then unmounts (or hides, with `keepMounted`). Under `prefers-reduced-motion`, it shows and hides at once.
 */
export function Transition(props: TransitionProps) {
  const keepMounted = untrack(() => !!props.keepMounted);
  let element: HTMLElement | undefined;

  const presence = createPresence({
    present: () => props.mounted,
    element: () => element,
    onEntered: () => props.onEntered?.(),
    onExited: () => props.onExited?.(),
  });

  const animation = transitionAttributes(presence, {
    transition: () => props.transition ?? 'fade',
    duration: () => props.duration ?? 200,
    exitDuration: () => props.exitDuration,
    timingFunction: () => props.timingFunction ?? 'ease',
  });
  const attributes: TransitionAttributes = {
    ref: (el) => (element = el),
    class: animation.class,
    get style() {
      return animation.style;
    },
    get 'data-transition'() {
      return animation['data-transition'];
    },
    get 'data-status'() {
      return animation['data-status'];
    },
  };

  return <Show when={keepMounted || presence.mounted()}>{props.children(attributes)}</Show>;
}
