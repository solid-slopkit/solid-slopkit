import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  hide,
  offset,
  shift,
  size,
  type Middleware,
  type ReferenceElement,
  type Strategy,
} from '@floating-ui/dom';
import { createEffect, createSignal, type Accessor } from 'solid-js';

/** The side of the anchor the floating element goes on. */
export type FloatingSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * A side, optionally followed by an alignment along it: `start` lines up the starting edges (left or top), `end` the
 * ending ones (right or bottom), and none centers it.
 */
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${'start' | 'end'}`;

export interface FloatingOptions {
  /** The anchor. An element, or anything with a `getBoundingClientRect`, such as a point under the cursor. */
  reference: () => ReferenceElement | undefined;
  /** The element to position. It's expected to be in the top layer: a shown popover or `<dialog>`. */
  floating: () => HTMLElement | undefined;
  /** Whether it's shown. Positioning, and following the anchor, run only while it's true. */
  open: () => boolean;
  /** Where it goes. Defaults to `bottom`. */
  placement?: () => FloatingPlacement;
  /** The gap between the anchor and the floating element, in px. Defaults to 0. */
  offset?: () => number;
  /** Whether it moves to the opposite side when there's no room on its own. Defaults to `true`. */
  flip?: () => boolean;
  /** Whether it slides along its side to stay in the viewport. Defaults to `true`. */
  shift?: () => boolean;
  /** How close to the viewport's edges flipping and shifting let it come, in px. Defaults to 8. */
  padding?: () => number;
  /** Whether its width is set to the anchor's. Defaults to `false`. */
  sameWidth?: () => boolean;
  /** An arrow inside the floating element, kept pointing at the anchor's center. */
  arrow?: () => HTMLElement | undefined;
  /** How close the arrow may come to the floating element's corners, in px. Defaults to 0. */
  arrowPadding?: () => number;
}

export interface Floating {
  /**
   * Where it actually went, after flipping, or the requested placement until it has been positioned. Render it as
   * `data-placement` so CSS can put the arrow on the right edge and animate from the anchor's side.
   */
  placement: Accessor<FloatingPlacement>;
  /** Positions it again now. Not needed for scrolling, resizing or the anchor moving: those are followed. */
  update: () => void;
}

/**
 * Positions a floating element against an anchor with `@floating-ui/dom`, and keeps it there while it's open:
 * through scrolling, resizing, and either element changing size. It writes `position`, `top`, `left` and `margin` on
 * the floating element (overriding a popover's centering), `left` or `top` on the arrow, and hides the floating element
 * with `visibility` while the anchor is scrolled out of view.
 *
 * The position is `absolute`, which in the top layer is placed against the document, so the browser moves it with the
 * page as the window scrolls, in the same frame as the anchor. Only an anchor pinned to the viewport gets `fixed`
 * instead (see `strategyFor`). Either way the anchor and the floating element scroll together without waiting for the
 * scroll event: the browser scrolls off the main thread and paints the scrolled page before the event reaches it, so a
 * position written from the event trails the anchor by a frame. A scroll container inside the page still moves the
 * anchor alone, and the floating element follows it on the scroll event.
 *
 * The elements are read whenever `open` or an option changes, so a component can pass plain refs. Nothing runs on the
 * server: the floating element has no position until it opens.
 */
export function createFloating(options: FloatingOptions): Floating {
  const requested = () => options.placement?.() ?? 'bottom';
  const [resolved, setResolved] = createSignal<FloatingPlacement | undefined>(undefined, {
    name: 'floating.placement',
  });
  let update = () => {};

  createEffect(
    () => {
      if (!options.open()) return undefined;
      return {
        placement: requested(),
        offset: options.offset?.() ?? 0,
        flip: options.flip?.() ?? true,
        shift: options.shift?.() ?? true,
        padding: options.padding?.() ?? 8,
        sameWidth: options.sameWidth?.() ?? false,
        arrowPadding: options.arrowPadding?.() ?? 0,
      };
    },
    (settings) => {
      const reference = options.reference();
      const floating = options.floating();
      if (!settings || !reference || !floating) return;
      const arrowElement = options.arrow?.();

      const middleware: Middleware[] = [offset(settings.offset)];
      if (settings.flip) middleware.push(flip({ padding: settings.padding }));
      if (settings.shift) middleware.push(shift({ padding: settings.padding }));
      if (settings.sameWidth) {
        middleware.push(
          size({
            apply: ({ rects, elements }) => {
              elements.floating.style.width = `${rects.reference.width}px`;
            },
          }),
        );
      }
      if (arrowElement) middleware.push(arrow({ element: arrowElement, padding: settings.arrowPadding }));
      middleware.push(hide());

      const strategy = strategyFor(reference);
      let current = 0;
      let active = true;
      update = () => {
        const run = ++current;
        void computePosition(reference, floating, {
          placement: settings.placement,
          strategy,
          middleware,
        }).then(({ x, y, placement, middlewareData }) => {
          // A newer run, or closing, makes this one stale.
          if (!active || run !== current) return;
          Object.assign(floating.style, {
            position: strategy,
            top: `${y}px`,
            left: `${x}px`,
            right: 'auto',
            bottom: 'auto',
            margin: '0',
            visibility: middlewareData.hide?.referenceHidden ? 'hidden' : '',
          });
          if (arrowElement) {
            const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
            arrowElement.style.left = arrowX == null ? '' : `${arrowX}px`;
            arrowElement.style.top = arrowY == null ? '' : `${arrowY}px`;
          }
          setResolved(placement);
        });
      };

      const stop = autoUpdate(reference, floating, update);
      return () => {
        active = false;
        stop();
        update = () => {};
      };
    },
    { name: 'floating.position' },
  );

  return {
    placement: () => resolved() ?? requested(),
    update: () => update(),
  };
}

/**
 * `fixed` when the anchor stays put in the viewport as the window scrolls: it's inside a `position: fixed` element, or
 * a sticky one that sticks to the window rather than to a scroll container inside the page. `absolute` otherwise, so
 * that the floating element moves with the page, the way the anchor does. A virtual anchor without a `contextElement`
 * reports viewport coordinates, so it's `fixed` too.
 */
function strategyFor(reference: ReferenceElement): Strategy {
  let element: Element | null | undefined = reference instanceof Element ? reference : reference.contextElement;
  if (!element) return 'fixed';
  const root = element.ownerDocument.documentElement;
  let sticky = false;
  for (; element && element !== root && element !== element.ownerDocument.body; element = element.parentElement) {
    const style = getComputedStyle(element);
    if (style.position === 'fixed') return 'fixed';
    if (style.position === 'sticky') sticky = true;
    // A sticky element below a scroll container sticks to that container, which scrolls with the page.
    else if (sticky && /auto|scroll|hidden/.test(style.overflowX + style.overflowY)) sticky = false;
  }
  return sticky ? 'fixed' : 'absolute';
}
