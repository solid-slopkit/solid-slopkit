import { createSignal, createUniqueId, flush, untrack, type Accessor } from 'solid-js';
import { findEnabledIndex } from '../../primitives';

export interface ComboboxOptions {
  /** Whether the dropdown is open, for a controlled combobox. */
  opened?: () => boolean | undefined;
  /** Whether it starts open, for an uncontrolled one. Read once. */
  defaultOpened?: boolean;
  /** Called whenever it opens or closes: from the keyboard, a dismissal, a submitted option, or a store method. */
  onChange?: (opened: boolean) => void;
  /** Whether moving past the last option goes to the first, and back. Defaults to `true`. */
  loop?: () => boolean;
}

/**
 * The state of one Combobox, owned by the component that renders it: whether it's open, and which option is active
 * (highlighted, and announced through the target's `aria-activedescendant`). Focus stays on the target, so the
 * active option is not focused. Pass it to `<Combobox store={…}>`; one store drives one Combobox.
 */
export interface ComboboxStore {
  /** Whether the dropdown is open. */
  opened: Accessor<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** The active option's id, or `undefined`. */
  activeId: Accessor<string | undefined>;
  /** Makes the first enabled option active. Returns whether there was one. */
  activateFirst: () => boolean;
  /** Makes the last enabled option active. */
  activateLast: () => boolean;
  /** Makes the next enabled option active, or the first when none is. */
  activateNext: () => boolean;
  /** Makes the previous enabled option active, or the last when none is. */
  activatePrevious: () => boolean;
  /** Makes the first selected option (`aria-selected="true"`) active. */
  activateSelected: () => boolean;
  /** Makes the enabled option with this `value` active. Returns whether there was one. */
  activate: (value: string) => boolean;
  /** Makes no option active. */
  clearActive: () => void;
  /** Submits the active option, as if it were clicked. Returns whether there was one. */
  submitActive: () => boolean;
}

/** What Combobox and its parts need from the store, beyond its public methods. */
export interface ComboboxInternals {
  listboxId: string;
  listbox: () => HTMLElement | undefined;
  setListbox: (element: HTMLElement | undefined) => void;
  /** Makes an option active; `scroll` brings it into view in the listbox. */
  activate: (option: HTMLElement | undefined, scroll: boolean) => void;
  active: () => HTMLElement | undefined;
  /** An option leaving the DOM: if it was active, none is. Safe to call while it's being disposed. */
  forget: (option: HTMLElement) => void;
}

const internals = new WeakMap<ComboboxStore, ComboboxInternals>();

/** The store's internals, for Combobox and its parts. */
export function comboboxInternals(store: ComboboxStore): ComboboxInternals {
  const value = internals.get(store);
  if (!value) throw new Error('<Combobox> needs a store from createCombobox().');
  return value;
}

/** Creates the state of a Combobox: pass it to `<Combobox store={…}>`, and call its methods from your handlers. */
export function createCombobox(options: ComboboxOptions = {}): ComboboxStore {
  const [own, setOwn] = createSignal(
    untrack(() => !!options.defaultOpened),
    { name: 'Combobox.opened' },
  );
  const opened = () => options.opened?.() ?? own();
  const setOpened = (next: boolean) => {
    if (next === opened()) return;
    if (options.opened?.() === undefined) setOwn(next);
    options.onChange?.(next);
    // The dropdown and its options are rendered by this flush, so an activation right after opening finds them.
    flush();
  };

  const [activeId, setActiveId] = createSignal<string | undefined>(undefined, { name: 'Combobox.activeId' });
  let active: HTMLElement | undefined;
  let listbox: HTMLElement | undefined;

  const activate = (option: HTMLElement | undefined, scroll: boolean) => {
    if (option !== active) {
      active?.removeAttribute('data-active');
      active = option;
      active?.setAttribute('data-active', '');
      setActiveId(active?.id);
      flush();
    }
    if (option && scroll) option.scrollIntoView({ block: 'nearest' });
  };

  // The options are found in the DOM, in order, each time: the ones whose nearest listbox is this one.
  const optionsInList = () =>
    listbox
      ? [...listbox.querySelectorAll<HTMLElement>('[role="option"]')].filter(
          (option) => option.closest('[role="listbox"]') === listbox,
        )
      : [];
  const isDisabled = (option: HTMLElement) => option.getAttribute('aria-disabled') === 'true';

  const step = (from: 'first' | 'last' | 1 | -1) => {
    // A change made just before, such as a new query, renders its options first.
    flush();
    const list = optionsInList();
    const current = active?.isConnected ? list.indexOf(active) : -1;
    const loop = options.loop?.() ?? true;
    const disabled = (index: number) => isDisabled(list[index]);
    const index =
      from === 'first'
        ? findEnabledIndex(-1, 1, list.length, disabled, false)
        : from === 'last'
          ? findEnabledIndex(-1, -1, list.length, disabled, false)
          : findEnabledIndex(current, from, list.length, disabled, loop);
    if (index === -1) return false;
    activate(list[index], true);
    return true;
  };

  const store: ComboboxStore = {
    opened,
    open: () => setOpened(true),
    close: () => setOpened(false),
    toggle: () => setOpened(!opened()),
    activeId,
    activateFirst: () => step('first'),
    activateLast: () => step('last'),
    activateNext: () => step(1),
    activatePrevious: () => step(-1),
    activateSelected: () => {
      flush();
      const selected = optionsInList().find((option) => option.getAttribute('aria-selected') === 'true' && !isDisabled(option));
      if (selected) activate(selected, true);
      return !!selected;
    },
    activate: (value) => {
      flush();
      const option = optionsInList().find((candidate) => candidate.dataset.value === value && !isDisabled(candidate));
      if (option) activate(option, true);
      return !!option;
    },
    clearActive: () => activate(undefined, false),
    submitActive: () => {
      if (!active?.isConnected || isDisabled(active)) return false;
      active.click();
      return true;
    },
  };

  internals.set(store, {
    listboxId: `slp-combobox-${createUniqueId()}`,
    listbox: () => listbox,
    setListbox: (element) => (listbox = element),
    activate,
    active: () => active,
    forget: (option) => {
      if (option !== active) return;
      active = undefined;
      // Disposal can't write signals: the id is cleared just after, unless another option became active meanwhile.
      queueMicrotask(() => {
        if (active) return;
        setActiveId(undefined);
        flush();
      });
    },
  });
  return store;
}
