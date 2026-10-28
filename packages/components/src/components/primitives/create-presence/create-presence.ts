import { createEffect, createMemo, createSignal, flush, untrack, type Accessor } from 'solid-js';

/**
 * Where an element is in its life:
 * - `closed`: not shown.
 * - `starting`: just shown, for one frame, so CSS transitions start from the styles it has here.
 * - `open`: shown. Enter transitions run toward these styles, and enter keyframe animations run here.
 * - `ending`: still shown while the exit transitions and animations run, then `closed`.
 */
export type PresenceStatus = 'closed' | 'starting' | 'open' | 'ending';

export interface PresenceOptions {
  /** Whether it should be shown. */
  present: () => boolean;
  /** The element that animates. Its own animations, and its pseudo-elements' (such as `::backdrop`), are waited for. */
  element: () => HTMLElement | undefined;
  /** Called when the enter animations have finished. */
  onEntered?: () => void;
  /** Called when the exit animations have finished and it's no longer shown. */
  onExited?: () => void;
}

export interface Presence {
  /**
   * Whether the element should be shown: from the moment `present` turns true until its exit animations have
   * finished. Render content, or keep a popover or `<dialog>` open in the top layer, while it's true.
   */
  mounted: Accessor<boolean>;
  /** Render it as `data-status` on the element, and write the transitions and animations against it. */
  status: Accessor<PresenceStatus>;
}

/** The element's own running animations and its pseudo-elements', leaving out those that never end. */
function finiteAnimations(element: HTMLElement): Animation[] {
  if (typeof element.getAnimations !== 'function') return [];
  return element.getAnimations({ subtree: true }).filter((animation) => {
    const effect = animation.effect;
    if (!(effect instanceof KeyframeEffect) || effect.target !== element) return false;
    return effect.getComputedTiming().endTime !== Infinity;
  });
}

/**
 * Enter and exit transitions for an element that's shown and hidden, including one in the top layer. Closing keeps
 * it shown (`mounted`) in the `ending` status until its animations finish, so a popover or `<dialog>` leaves the top
 * layer only afterwards; this works in every browser of the baseline, with or without `@starting-style` and
 * `overlay`. Opening shows it in the `starting` status for one frame, then `open`, so plain transitions run.
 *
 * CSS decides what moves: with no transitions or animations (or none under `prefers-reduced-motion`), it closes in a
 * microtask, before the next paint, and opens a frame later. It starts in `open` or `closed` without animating, which is also what the server renders.
 */
export function createPresence(options: PresenceOptions): Presence {
  // Where the animations have got to: `open` once entering is past its starting frame, `closed` once exiting has
  // finished. Only written later (a frame, the animations' end), never in response to `present` itself.
  const [settled, setSettled] = createSignal<'open' | 'closed'>(untrack(options.present) ? 'open' : 'closed', {
    name: 'presence.settled',
  });

  // Derived in the same update as `present`, so what reads both never sees them apart. Coming back while leaving
  // reverses from where it is, with no starting frame; leaving during the starting frame closes at once.
  const status = createMemo<PresenceStatus>(
    () => {
      const open = settled() === 'open';
      if (options.present()) return open ? 'open' : 'starting';
      return open ? 'ending' : 'closed';
    },
    { name: 'presence.status' },
  );
  // Recomputes on every status, but only changes on entering `starting` and `closed`.
  const mounted = createMemo(() => status() !== 'closed', { name: 'presence.mounted' });

  let previous = untrack(status);
  createEffect(
    () => status(),
    (next) => {
      const from = previous;
      previous = next;
      let cancelled = false;
      // The animations are collected a microtask later, so those started by any effect of this update count (a
      // component that sets a measured height). Settles after them, or at once when there are none: before the next
      // paint, but never as a write from this effect, which reads the status the write changes.
      const whenFinished = (done: () => void) => {
        void Promise.resolve()
          .then(() => {
            const element = options.element();
            const animations = !cancelled && element ? finiteAnimations(element) : [];
            return Promise.allSettled(animations.map((animation) => animation.finished));
          })
          .then(() => {
            if (cancelled) return;
            done();
            flush();
          });
      };

      if (next === 'starting') {
        // A frame later, every effect of this flush has run (a popover is in the top layer), so the starting styles
        // can be computed before switching away from them.
        const frame = requestAnimationFrame(() => {
          void options.element()?.offsetWidth;
          setSettled('open');
          flush();
        });
        return () => cancelAnimationFrame(frame);
      }
      if (next === 'open' && from === 'starting') {
        whenFinished(() => options.onEntered?.());
      } else if (next === 'ending') {
        whenFinished(() => {
          setSettled('closed');
          options.onExited?.();
        });
      }
      return () => {
        cancelled = true;
      };
    },
    { name: 'presence.animations', defer: true },
  );

  return { mounted, status };
}
