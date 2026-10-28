import { onCleanup } from 'solid-js';

export interface TypeaheadOptions {
  /** How many items there are. Read at each key press. */
  count: () => number;
  /** The index of the item the user is on, or -1 when there is none. Read at each key press. */
  current: () => number;
  /** The text an item is found by, usually its visible label. */
  getLabel: (index: number) => string;
  /** Items that are skipped. */
  isDisabled?: (index: number) => boolean;
  /** How long a pause, in milliseconds, starts a new search. Defaults to 500. */
  timeout?: () => number;
  /** Moves to the item that matched: focus it, or make it the active descendant. */
  onMatch: (index: number, event: KeyboardEvent) => void;
}

export interface Typeahead {
  /** Handles a key press. Put it on the list or on each item. Keys it handles are prevented. */
  onKeyDown: (event: KeyboardEvent) => void;
  /** Forgets what was typed, e.g. when the list closes. */
  reset: () => void;
}

/**
 * Jumping to an item by typing the start of its label, for menus and listboxes. Characters typed in quick succession
 * build one search ("new" goes past "Nebraska" to "New York"), and the current item stays matched while it still
 * fits. Typing the same character again cycles through the items starting with it. Space
 * counts only inside a search, so on its own it still activates the item. Matching ignores case and leading spaces.
 *
 * It keeps only what was typed, which a pause clears, and knows no elements: the caller says how many items there
 * are, which one is current, their labels, and what moving means.
 */
export function createTypeahead(options: TypeaheadOptions): Typeahead {
  let typed = '';
  let timer: ReturnType<typeof setTimeout> | undefined;

  const reset = () => {
    clearTimeout(timer);
    typed = '';
  };
  onCleanup(reset);

  const isDisabled = (index: number) => !!options.isDisabled?.(index);
  const normalize = (text: string) => text.trimStart().toLocaleLowerCase();

  /** The first enabled item from `start` on, wrapping around, whose label starts with `search`; -1 when none does. */
  const find = (search: string, start: number, count: number) => {
    for (let offset = 0; offset < count; offset++) {
      const index = (start + offset) % count;
      if (!isDisabled(index) && normalize(options.getLabel(index)).startsWith(search)) return index;
    }
    return -1;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    // One printable character; named keys (Enter, ArrowDown) are longer. Counted by code point for emoji.
    if ([...event.key].length !== 1) return;
    if (event.key === ' ' && typed === '') return;
    const count = options.count();
    if (count === 0) return;

    // A typeahead key never does anything else, such as a browser's find-as-you-type, even when nothing matches.
    event.preventDefault();
    clearTimeout(timer);
    typed += event.key.toLocaleLowerCase();
    timer = setTimeout(reset, options.timeout?.() ?? 500);

    const current = options.current();
    const [first, ...rest] = typed;
    // The same character again moves on to the next item starting with it; a longer search may stay on the current.
    const target = rest.every((character) => character === first)
      ? find(first, current + 1, count)
      : find(typed, Math.max(current, 0), count);
    if (target !== -1 && target !== current) options.onMatch(target, event);
  };

  return { onKeyDown, reset };
}
