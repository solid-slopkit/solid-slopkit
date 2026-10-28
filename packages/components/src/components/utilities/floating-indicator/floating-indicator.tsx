import { createEffect, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './floating-indicator.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface FloatingIndicatorOwnProps {
  /** The element it covers. Without one it's hidden. */
  target?: HTMLElement | null;
  /** The element it's positioned in: the target's container, with `position: relative`. */
  parent?: HTMLElement | null;
}

export type FloatingIndicatorProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, FloatingIndicatorOwnProps>;

/**
 * A box that covers one element of a group and glides to another when the target changes, such as the active tab or
 * the selected option. Render it inside `parent`, before the targets, and give the targets `position: relative` so
 * they paint over it. It's decoration: `aria-hidden`, and the pointer goes through it.
 */
export function FloatingIndicator(props: FloatingIndicatorProps) {
  const others = omit(props, 'ref', 'class', 'target', 'parent');
  let indicator: HTMLDivElement | undefined;

  // Covers the target, measured from the parent's padding box (where an absolutely positioned child's 0 is) and its
  // scroll. Written straight to the element: placing it runs no reactive code.
  const place = (target: HTMLElement, parent: HTMLElement) => {
    if (!indicator) return;
    const box = target.getBoundingClientRect();
    const frame = parent.getBoundingClientRect();
    const x = box.left - frame.left - parent.clientLeft + parent.scrollLeft;
    const y = box.top - frame.top - parent.clientTop + parent.scrollTop;
    indicator.style.width = `${box.width}px`;
    indicator.style.height = `${box.height}px`;
    indicator.style.transform = `translate(${x}px, ${y}px)`;
    // The first placement, and the first after being hidden, jumps there: transitions only apply once it's placed
    // and laid out.
    if (!indicator.hasAttribute('data-placed')) {
      indicator.removeAttribute('data-hidden');
      void indicator.offsetWidth;
      indicator.setAttribute('data-placed', '');
    }
  };

  createEffect(
    () => [props.target, props.parent] as const,
    ([target, parent]) => {
      if (!indicator) return;
      if (!target || !parent) {
        indicator.setAttribute('data-hidden', '');
        indicator.removeAttribute('data-placed');
        return;
      }
      place(target, parent);
      // The target moves or changes size without the props changing: fonts loading, a sibling growing, the parent
      // resizing or scrolling.
      const update = () => place(target, parent);
      const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
      observer?.observe(target);
      observer?.observe(parent);
      for (const child of parent.children) if (child !== indicator) observer?.observe(child);
      parent.addEventListener('scroll', update, { passive: true });
      return () => {
        observer?.disconnect();
        parent.removeEventListener('scroll', update);
      };
    },
    { name: 'FloatingIndicator.place' },
  );

  return (
    <div
      ref={[(el: HTMLDivElement) => (indicator = el), untrack(() => props.ref)]}
      aria-hidden="true"
      data-hidden=""
      class={joinClass(['slp-floating-indicator', style.indicator], props.class)}
      {...others}
    />
  );
}
