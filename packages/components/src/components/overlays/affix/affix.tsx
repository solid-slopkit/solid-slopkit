import { omit, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './affix.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

/** Where it's pinned in the viewport: a corner, or the middle of the top or bottom edge. */
export type AffixPosition = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface AffixOwnProps {
  /** Where it's pinned. Defaults to `bottom-right`. */
  position?: AffixPosition;
  /** Gap between it and the viewport's edges, in px. Defaults to 20. */
  offset?: number;
}

export type AffixProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AffixOwnProps>;

/**
 * Pins its content to a spot in the viewport, such as a button back to the top: a `div` in the top layer, so it
 * stays put whatever its parents' transforms or overflow, and sits above the page without a z-index. It's as big as
 * its content, and stays where it is in the document for Tab. Shown once hydrated.
 */
export function Affix(props: AffixProps) {
  const others = omit(props, 'ref', 'class', 'style', 'position', 'offset');
  let element: HTMLDivElement | undefined;

  // In the top layer once it's in the document; it stays there until it unmounts.
  onSettled(() => {
    if (element && !element.matches(':popover-open')) element.showPopover();
  });

  return (
    <div
      ref={[(el: HTMLDivElement) => (element = el), untrack(() => props.ref)]}
      popover="manual"
      data-position={props.position ?? 'bottom-right'}
      class={joinClass(['slp-affix', style.affix], props.class)}
      style={{ '--_affix-offset': `${props.offset ?? 20}px`, ...props.style }}
      {...others}
    />
  );
}
