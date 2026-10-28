import { createSignal, omit, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './scroll-area.module.css';
import { mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';

/**
 * When the scrollbars show, if the content overflows: while the pointer is over it or it scrolls (`hover`), only while
 * it scrolls (`scroll`), all the time (`always`) or never (`never`, it still scrolls).
 */
export type ScrollAreaType = 'hover' | 'scroll' | 'always' | 'never';

/** The directions it scrolls in: across (`x`), down (`y`) or both. */
export type ScrollAreaScrollbars = 'x' | 'y' | 'xy';

export interface ScrollAreaPosition {
  x: number;
  y: number;
}

export interface ScrollAreaOwnProps {
  /** When the scrollbars show. Defaults to `hover`. */
  type?: ScrollAreaType;
  /** The directions it scrolls in. Defaults to `xy`. */
  scrollbars?: ScrollAreaScrollbars;
  /** Thickness of a scrollbar, in px. Defaults to 10. */
  scrollbarSize?: number;
  /** How long the scrollbars stay after the pointer leaves or scrolling stops, in ms. Defaults to 800. */
  scrollHideDelay?: number;
  /** Pads the content on the side of a shown scrollbar, so the scrollbar doesn't cover it. */
  offsetScrollbars?: boolean;
  /** The element that scrolls, for `scrollTo` and friends. */
  viewportRef?: Ref<HTMLDivElement>;
  /** Called as it scrolls, with the scroll offsets in px. */
  onScrollPositionChange?: (position: ScrollAreaPosition) => void;
}

export type ScrollAreaProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, ScrollAreaOwnProps>;

type Axis = 'x' | 'y';

// Scrolling counts as stopped this long after the last scroll event; the CSS then waits `scrollHideDelay`.
const SCROLL_END_MS = 100;
// A press on the track scrolls by this share of the visible length, keeping some of it in view.
const PAGE_SHARE = 0.875;

/**
 * A box that scrolls its content with thin scrollbars drawn over it, the same in every browser and color scheme. The
 * scrolling itself is the browser's (wheel, touch, keys, find in page); only the scrollbars are drawn. Give it a
 * `height` or `max-height` with `style` or `class`: with `max-height` it grows with its content up to that height.
 */
export function ScrollArea(props: ScrollAreaProps) {
  const others = omit(
    props,
    'ref',
    'class',
    'style',
    'children',
    'type',
    'scrollbars',
    'scrollbarSize',
    'scrollHideDelay',
    'offsetScrollbars',
    'viewportRef',
    'onScrollPositionChange',
  );
  let viewport: HTMLDivElement | undefined;
  let content: HTMLDivElement | undefined;
  const bars: Partial<Record<Axis, HTMLDivElement>> = {};

  const [overflowX, setOverflowX] = createSignal(false, { name: 'ScrollArea.overflowX' });
  const [overflowY, setOverflowY] = createSignal(false, { name: 'ScrollArea.overflowY' });
  const [scrolling, setScrolling] = createSignal(false, { name: 'ScrollArea.scrolling' });
  let scrollEnd: ReturnType<typeof setTimeout> | undefined;

  const scrolls = (axis: Axis) => (props.scrollbars ?? 'xy').includes(axis);

  // The thumbs' size and offset are written straight to each scrollbar as unitless fractions, and CSS turns them into
  // lengths: scrolling then changes two custom properties on two small elements, and runs no reactive code.
  const place = (axis: Axis) => {
    const bar = bars[axis];
    if (!viewport || !bar) return;
    const [offset, visible, total] =
      axis === 'y'
        ? [viewport.scrollTop, viewport.clientHeight, viewport.scrollHeight]
        : [viewport.scrollLeft, viewport.clientWidth, viewport.scrollWidth];
    const range = total - visible;
    bar.style.setProperty('--_scroll-area-ratio', String(total > 0 ? visible / total : 1));
    bar.style.setProperty('--_scroll-area-progress', String(range > 0 ? Math.min(1, Math.max(0, offset / range)) : 0));
  };

  const measure = () => {
    if (!viewport) return;
    // Rounding can leave a pixel between the two even when nothing overflows.
    setOverflowX(scrolls('x') && viewport.scrollWidth - viewport.clientWidth > 1);
    setOverflowY(scrolls('y') && viewport.scrollHeight - viewport.clientHeight > 1);
    place('x');
    place('y');
  };

  // The content and the box change size without any prop changing: images loading, a parent resizing.
  onSettled(() => {
    measure();
    if (!viewport || !content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(content);
    return () => {
      observer.disconnect();
      clearTimeout(scrollEnd);
    };
  });

  const onScroll = () => {
    place('x');
    place('y');
    setScrolling(true);
    clearTimeout(scrollEnd);
    scrollEnd = setTimeout(() => setScrolling(false), SCROLL_END_MS);
    if (viewport) props.onScrollPositionChange?.({ x: viewport.scrollLeft, y: viewport.scrollTop });
  };

  // Dragging a thumb moves the content by the same share of its range as the thumb moved along its track.
  let drag: { axis: Axis; start: number; scroll: number; perPixel: number } | undefined;

  const onPointerDown = (axis: Axis, event: PointerEvent) => {
    const bar = bars[axis];
    if (!viewport || !bar || event.button !== 0) return;
    event.preventDefault();
    const thumb = bar.firstElementChild as HTMLElement;
    const along = (rect: DOMRect) => (axis === 'y' ? [rect.top, rect.height] : [rect.left, rect.width]);
    const [, barLength] = along(bar.getBoundingClientRect());
    const [thumbStart, thumbLength] = along(thumb.getBoundingClientRect());
    const pointer = axis === 'y' ? event.clientY : event.clientX;
    const [scroll, visible, total] =
      axis === 'y'
        ? [viewport.scrollTop, viewport.clientHeight, viewport.scrollHeight]
        : [viewport.scrollLeft, viewport.clientWidth, viewport.scrollWidth];

    if (event.target !== thumb) {
      // A press on the track pages toward it, like the browser's own scrollbars.
      const step = visible * PAGE_SHARE * (pointer < thumbStart ? -1 : 1);
      viewport.scrollBy({ [axis === 'y' ? 'top' : 'left']: step, behavior: 'instant' });
      return;
    }
    // The thumb's box spans the track's whole thickness (its inset is a transparent border), so it travels the rest.
    const travel = barLength - thumbLength;
    drag = { axis, start: pointer, scroll, perPixel: travel > 0 ? (total - visible) / travel : 0 };
    bar.setPointerCapture?.(event.pointerId);
    bar.setAttribute('data-dragging', '');
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!viewport || !drag) return;
    const moved = (drag.axis === 'y' ? event.clientY : event.clientX) - drag.start;
    viewport[drag.axis === 'y' ? 'scrollTop' : 'scrollLeft'] = drag.scroll + moved * drag.perPixel;
  };

  const endDrag = () => {
    if (drag) bars[drag.axis]?.removeAttribute('data-dragging');
    drag = undefined;
  };

  // The scrollbars sit over the viewport, not in it, so a wheel over one would scroll the page: hand it to the
  // viewport, and let it through when the viewport is already at that end.
  const onWheel = (event: WheelEvent) => {
    if (!viewport) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    const [left, top] = [viewport.scrollLeft, viewport.scrollTop];
    viewport.scrollBy({ left: event.deltaX * unit, top: event.deltaY * unit, behavior: 'instant' });
    if (viewport.scrollLeft !== left || viewport.scrollTop !== top) event.preventDefault();
  };

  const scrollbar = (axis: Axis) => (
    <div
      ref={(el: HTMLDivElement) => (bars[axis] = el)}
      aria-hidden="true"
      data-slot="scroll-area-scrollbar"
      data-orientation={axis === 'y' ? 'vertical' : 'horizontal'}
      class={style.scrollbar}
      onPointerDown={(event: PointerEvent) => onPointerDown(axis, event)}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
    >
      <div data-slot="scroll-area-thumb" class={style.thumb} />
    </div>
  );

  return (
    <div
      ref={untrack(() => props.ref)}
      data-type={props.type ?? 'hover'}
      data-scrollbars={props.scrollbars ?? 'xy'}
      data-overflow-x={overflowX() ? '' : undefined}
      data-overflow-y={overflowY() ? '' : undefined}
      data-scrolling={scrolling() ? '' : undefined}
      data-offset-scrollbars={props.offsetScrollbars ? '' : undefined}
      class={joinClass(['slp-scroll-area', style.root], props.class)}
      style={{
        '--_scroll-area-size': `${props.scrollbarSize ?? 10}px`,
        '--_scroll-area-hide-delay': `${props.scrollHideDelay ?? 800}ms`,
        ...props.style,
      }}
      {...others}
    >
      <div
        ref={mergeRefs(
          (el: HTMLDivElement) => (viewport = el),
          untrack(() => props.viewportRef),
        )}
        // A tab stop only while there's something to scroll: not every browser in the baseline lets the keyboard
        // reach a scroller on its own.
        tabindex={overflowX() || overflowY() ? 0 : undefined}
        data-slot="scroll-area-viewport"
        class={style.viewport}
        onScroll={onScroll}
      >
        <div ref={(el: HTMLDivElement) => (content = el)} data-slot="scroll-area-content" class={style.content}>
          {props.children}
        </div>
      </div>
      {scrollbar('y')}
      {scrollbar('x')}
    </div>
  );
}
