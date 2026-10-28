/** Which arrow keys move: Left/Right, Up/Down, or all four. */
export type ListNavigationOrientation = 'horizontal' | 'vertical' | 'both';

export interface ListNavigationOptions {
  /** Which arrow keys move. */
  orientation: () => ListNavigationOrientation;
  /** How many items there are. Read at each key press. */
  count: () => number;
  /** The index of the item the user is on, or -1 when there is none. Read at each key press. */
  current: () => number;
  /** Items that are skipped. */
  isDisabled?: (index: number) => boolean;
  /** Whether moving past the last item goes to the first, and back. Defaults to `true`. */
  loop?: () => boolean;
  /** Moves to the item: focus it, select it, or make it the active descendant. */
  onMove: (index: number, event: KeyboardEvent) => void;
}

export interface ListNavigation {
  /** Handles a key press. Put it on the list or on each item. Handled keys are prevented. */
  onKeyDown: (event: KeyboardEvent) => void;
}

/**
 * The index of the next enabled item after `from`, going `step` (1 or -1) at a time, or -1 when there is none.
 * With `loop`, it wraps around the ends. From -1 (no current item), it starts at the first item going forward and
 * at the last going back.
 */
export function findEnabledIndex(
  from: number,
  step: 1 | -1,
  count: number,
  isDisabled: (index: number) => boolean,
  loop: boolean,
): number {
  const start = from === -1 && step === -1 ? count : from;
  let index = start;
  for (let tried = 0; tried < count; tried++) {
    index += step;
    if (index < 0 || index >= count) {
      if (!loop) return -1;
      index = (index + count) % count;
    }
    if (index === start) return -1;
    if (!isDisabled(index)) return index;
  }
  return -1;
}

const PREVIOUS: Record<ListNavigationOrientation, string[]> = {
  horizontal: ['ArrowLeft'],
  vertical: ['ArrowUp'],
  both: ['ArrowLeft', 'ArrowUp'],
};

const NEXT: Record<ListNavigationOrientation, string[]> = {
  horizontal: ['ArrowRight'],
  vertical: ['ArrowDown'],
  both: ['ArrowRight', 'ArrowDown'],
};

/**
 * Arrow-key movement through a list of items, for one-tab-stop widgets: arrows move to the previous or next
 * enabled item (left to right; there is no right-to-left support), Home and End to the first and last. It keeps
 * no state and knows no elements: the caller says how many items there are, which one is current, and what moving
 * means.
 */
export function createListNavigation(options: ListNavigationOptions): ListNavigation {
  const isDisabled = (index: number) => !!options.isDisabled?.(index);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const count = options.count();
    if (count === 0) return;
    const orientation = options.orientation();
    const loop = options.loop?.() ?? true;
    const current = options.current();

    let target: number;
    if (PREVIOUS[orientation].includes(event.key)) target = findEnabledIndex(current, -1, count, isDisabled, loop);
    else if (NEXT[orientation].includes(event.key)) target = findEnabledIndex(current, 1, count, isDisabled, loop);
    else if (event.key === 'Home') target = findEnabledIndex(-1, 1, count, isDisabled, false);
    else if (event.key === 'End') target = findEnabledIndex(-1, -1, count, isDisabled, false);
    else return;

    // A handled key never scrolls the page or moves a native control, even when there is nowhere to go.
    event.preventDefault();
    if (target !== -1 && target !== current) options.onMove(target, event);
  };

  return { onKeyDown };
}
