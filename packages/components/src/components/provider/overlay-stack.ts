/** What dismissed an overlay. */
export type DismissReason = 'escape' | 'outside';

/** An open overlay, as the stack sees it. */
export interface OverlayLayer {
  /** Whether a press on this node is inside the overlay (its own elements, or its anchor). */
  contains: (node: Node) => boolean;
  /** Whether Escape closes it. Read at each key press. */
  closeOnEscape: () => boolean;
  /** Whether a press outside closes it. Read at each press. */
  closeOnClickOutside: () => boolean;
  dismiss: (reason: DismissReason, event: Event) => void;
}

export interface OverlayStack {
  /** Puts an overlay that just opened on top. Returns the function that takes it off again. */
  add: (layer: OverlayLayer) => () => void;
}

/**
 * The order of the open overlays of one provider tree, newest on top, which decides which one Escape or an outside
 * press closes. The browser's top layer owns stacking; this only owns dismissal. Its document listeners are attached
 * while at least one overlay is open.
 */
export function createOverlayStack(): OverlayStack {
  const layers: OverlayLayer[] = [];
  // A touch press may start a scroll, so a touch closes overlays on its click, not on its pointerdown.
  let touchPending = false;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
    const top = layers.at(-1);
    if (!top) return;
    // The topmost overlay owns Escape even when it stays open: nothing under it closes, and neither does a
    // `<dialog>` on its own.
    event.preventDefault();
    if (top.closeOnEscape()) top.dismiss('escape', event);
  };

  const pressOutside = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    // From the top down: every overlay the press is outside of closes, until one it's inside of, or one that stays
    // open (a modal without outside clicks), which shields those under it.
    for (const layer of [...layers].reverse()) {
      if (layer.contains(target) || !layer.closeOnClickOutside()) return;
      layer.dismiss('outside', event);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    touchPending = event.pointerType === 'touch';
    if (!touchPending) pressOutside(event);
  };

  const onClick = (event: MouseEvent) => {
    if (!touchPending) return;
    touchPending = false;
    pressOutside(event);
  };

  // Capturing presses: a press inside a component that stops propagation still counts as outside an overlay.
  const listen = () => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick, true);
  };
  const unlisten = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('click', onClick, true);
    touchPending = false;
  };

  return {
    add(layer) {
      if (layers.length === 0) listen();
      layers.push(layer);
      return () => {
        const index = layers.indexOf(layer);
        if (index === -1) return;
        layers.splice(index, 1);
        if (layers.length === 0) unlisten();
      };
    },
  };
}
