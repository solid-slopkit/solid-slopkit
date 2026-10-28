import { createEffect } from 'solid-js';

export interface ScrollLockOptions {
  /** Whether the page should be kept from scrolling. */
  locked: () => boolean;
}

interface DocumentLock {
  /** How many locks are on. The page scrolls again when the last one comes off. */
  count: number;
  /** The root's inline styles before the first lock, put back after the last. */
  overflow: string;
  paddingRight: string;
}

// Per document rather than per provider: two roots in one page share its scrolling. Nothing runs on the server.
const locks = new WeakMap<Document, DocumentLock>();

function lock(document: Document): void {
  const current = locks.get(document);
  if (current) {
    current.count++;
    return;
  }
  const root = document.documentElement;
  const { style } = root;
  locks.set(document, {
    count: 1,
    overflow: style.overflow,
    paddingRight: style.paddingRight,
  });
  // A classic scrollbar takes room; hiding it would widen the page, and its content would shift. Its room is kept as
  // padding, not as a stable gutter: a gutter would also narrow the viewport that a modal `<dialog>` fills, leaving a
  // strip by the edge. Overlay scrollbars take none.
  const scrollbar = (document.defaultView?.innerWidth ?? 0) - root.clientWidth;
  if (scrollbar > 0) style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + scrollbar}px`;
  style.overflow = 'hidden';
}

function unlock(document: Document): void {
  const current = locks.get(document);
  if (!current) return;
  if (--current.count > 0) return;
  locks.delete(document);
  const { style } = document.documentElement;
  style.overflow = current.overflow;
  style.paddingRight = current.paddingRight;
}

/**
 * Keeps the page from scrolling while `locked` is true, as a modal does: the root gets `overflow: hidden`. With a
 * classic scrollbar, its room is kept, so the page doesn't shift sideways. Locks add up: the page scrolls again when
 * the last one comes off, and the root's own inline styles come back. Elements that scroll by themselves still do.
 */
export function createScrollLock(options: ScrollLockOptions): void {
  createEffect(
    () => options.locked(),
    (locked) => {
      if (!locked) return;
      lock(document);
      return () => unlock(document);
    },
    { name: 'scrollLock.locked' },
  );
}
