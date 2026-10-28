import { createEffect } from 'solid-js';
import type { DismissReason } from '../../provider/overlay-stack';
import { useSlopkitUi } from '../../provider/slopkit-ui';

export type { DismissReason };

export interface DismissalOptions {
  /** Whether the overlay is open. It joins the provider's order of overlays when it opens, on top of those open. */
  open: () => boolean;
  /**
   * The elements a press doesn't close it from: the overlay and its anchor. Read at each press. Overlays opened from
   * inside it render inside it, so a press in them counts as inside too.
   */
  elements: () => readonly (Element | null | undefined)[];
  /** Closes it. Called with what dismissed it and the event. */
  onDismiss: (reason: DismissReason, event: Event) => void;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: () => boolean;
  /** Whether a press outside closes it. Defaults to `true`. */
  closeOnClickOutside?: () => boolean;
}

/**
 * Closing an overlay with Escape or a press outside it, in the right order when overlays are nested. While open, the
 * overlay is in the provider's order of overlays: Escape goes to the topmost one only, and a press closes, from the
 * top down, every overlay it's outside of until it reaches one it's inside of, or one that doesn't close on outside
 * presses. A touch closes on its click rather than its pointerdown, so scrolling the page doesn't.
 *
 * The topmost overlay prevents Escape's default even when it stays open, so a `<dialog>` doesn't close on its own;
 * a modal that ignores Escape should still prevent its `cancel` event, which the browser can send without a key.
 * Needs a `<SlopkitUi>` above it; `component` names the caller in the error when there's none.
 */
export function createDismissal(component: string, options: DismissalOptions): void {
  const { overlays } = useSlopkitUi(component);

  createEffect(
    () => options.open(),
    (open) => {
      if (!open) return;
      return overlays.add({
        contains: (node) => options.elements().some((element) => element?.contains(node)),
        closeOnEscape: () => options.closeOnEscape?.() ?? true,
        closeOnClickOutside: () => options.closeOnClickOutside?.() ?? true,
        dismiss: (reason, event) => options.onDismiss(reason, event),
      });
    },
    { name: 'dismissal.layer' },
  );
}
