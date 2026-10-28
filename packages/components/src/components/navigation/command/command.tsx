import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  flush,
  omit,
  onCleanup,
  onSettled,
  untrack,
  useContext,
  type Accessor,
} from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import style from './command.module.css';
import { Input, type InputProps } from '../../inputs/input';
import { findEnabledIndex } from '../../primitives';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

/** Whether an item is found for a search: its `value` and `keywords`, and the search text, which isn't empty. */
export type CommandFilter = (value: string, search: string, keywords: readonly string[]) => boolean;

/**
 * The default filter: an item is found when its value or keywords contain every word of the search, ignoring case.
 */
export const defaultCommandFilter: CommandFilter = (value, search, keywords) => {
  const words = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const text = [value, ...keywords].join(' ').toLocaleLowerCase();
  return words.every((word) => text.includes(word));
};

export interface CommandOwnProps {
  /** The search text, for a controlled one. */
  search?: string;
  /** Called with the search text as it's typed. */
  onSearchChange?: (search: string) => void;
  /** The active item's `value`, for a controlled one. */
  value?: string;
  /** Called with the active item's `value` as the keyboard or the pointer moves. */
  onValueChange?: (value: string | undefined) => void;
  /** Decides whether an item is found for the search. Defaults to every word in its value or keywords. */
  filter?: CommandFilter;
  /** Whether it hides the items the search doesn't find. `false` shows them all, for results filtered elsewhere. */
  shouldFilter?: boolean;
  /** Whether moving past the last item goes to the first, and back. Defaults to `true`. */
  loop?: boolean;
}

export type CommandProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CommandOwnProps>;

interface CommandContextValue {
  listId: string;
  search: Accessor<string>;
  setSearch: (search: string) => void;
  activeId: Accessor<string | undefined>;
  /** Whether any item is shown. Assumed until the items are known, once the Command is in the DOM. */
  anyShown: Accessor<boolean>;
  /** Whether an item is found for the search. */
  found: (item: ItemRecord) => boolean;
  /** Adds an item. Returns the function that removes it, safe to call while it's being disposed. */
  add: (item: ItemRecord) => () => void;
  /** Gives an item its element, once it's in the DOM. */
  attach: (item: ItemRecord, element: HTMLElement) => void;
  activate: (item: HTMLElement | undefined, scroll: boolean) => void;
  isActive: (item: HTMLElement) => boolean;
  /** Takes in a change of the items, just after: whether any is shown, and the active one, if it went. */
  refresh: () => void;
}

interface ItemRecord {
  /** Undefined while it's taken from the text of an item that isn't in the DOM yet. */
  value: () => string | undefined;
  keywords: () => readonly string[];
}

const CommandContext = createContext<CommandContextValue | null>(null);

/** Told when an item is selected, by a CommandDialog around the Command. */
export const CommandSelectContext = createContext<(() => void) | null>(null);

function useCommand(component: string): CommandContextValue {
  const context = useContext(CommandContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Command>.`);
  return context;
}

const isDisabled = (item: HTMLElement) => item.getAttribute('aria-disabled') === 'true';

/**
 * A search over a list of commands: Command.Input, then Command.List with Command.Item and Command.Group. Typing hides
 * the items it doesn't find; the arrows move the active item, Enter selects it. Focus stays in the input. Put one in a
 * CommandDialog for a palette opened with ⌘K.
 */
export function Command(props: CommandProps) {
  const listId = `slp-command-${createUniqueId()}`;
  let root: HTMLDivElement | undefined;

  const [ownSearch, setOwnSearch] = createSignal('', { name: 'Command.search' });
  const search = () => props.search ?? ownSearch();

  // The active item is marked on the element, so moving touches only the two items it leaves and reaches.
  const [activeId, setActiveId] = createSignal<string | undefined>(undefined, { name: 'Command.activeId' });
  let active: HTMLElement | undefined;
  const values = new WeakMap<HTMLElement, () => string | undefined>();

  const found = (item: ItemRecord) => {
    const text = search();
    const value = item.value();
    if (!(props.shouldFilter ?? true) || text.trim() === '' || value === undefined) return true;
    return (props.filter ?? defaultCommandFilter)(value, text, item.keywords());
  };

  // The items, kept to tell whether any is shown. A change is counted once it's in the DOM: the server, and the first
  // render on the client, assume one is.
  const items = new Set<ItemRecord>();
  const [itemsVersion, setItemsVersion] = createSignal(0, { name: 'Command.itemsVersion' });
  const anyShown = createMemo(
    () => {
      if (itemsVersion() === 0) return true;
      for (const item of items) if (found(item)) return true;
      return false;
    },
    { name: 'Command.anyShown' },
  );

  const activate = (item: HTMLElement | undefined, scroll: boolean) => {
    if (item !== active) {
      if (active) {
        active.removeAttribute('data-active');
        active.setAttribute('aria-selected', 'false');
      }
      active = item;
      if (item) {
        item.setAttribute('data-active', '');
        item.setAttribute('aria-selected', 'true');
      }
      setActiveId(item?.id);
      props.onValueChange?.(item ? values.get(item)?.() : undefined);
    }
    if (item && scroll) item.scrollIntoView({ block: 'nearest' });
  };

  // The items shown, in order, found in the DOM each time: the ones of this Command, not of one nested in it.
  const shownItems = () =>
    root
      ? [...root.querySelectorAll<HTMLElement>('[data-slot="command-item"]')].filter(
          (item) => !item.hidden && item.closest('[data-slot="command"]') === root,
        )
      : [];

  const activateFirst = () => {
    const items = shownItems();
    const wanted = untrack(() => props.value);
    const match = wanted === undefined ? undefined : items.find((item) => values.get(item)?.() === wanted);
    activate(match && !isDisabled(match) ? match : items.find((item) => !isDisabled(item)), false);
    const list = root?.querySelector('[data-slot="command-list"]');
    if (list) list.scrollTop = 0;
  };

  const step = (direction: 1 | -1) => {
    const items = shownItems();
    const current = active ? items.indexOf(active) : -1;
    const index = findEnabledIndex(current, direction, items.length, (at) => isDisabled(items[at]), props.loop ?? true);
    if (index !== -1) activate(items[index], true);
  };

  // Items come and go during a render or a disposal, which can't write signals: the change is taken in just after.
  let refreshing = false;
  const takeInChanges = () => {
    refreshing = false;
    setItemsVersion((version) => version + 1);
    if (!active?.isConnected || active.hidden) activateFirst();
  };
  const refresh = () => {
    // The server's render is disposed of without a change to take in.
    if (refreshing || isServer) return;
    refreshing = true;
    queueMicrotask(takeInChanges);
  };
  onSettled(refresh);

  // A new search starts from the first item found, once the items have been shown or hidden for it. Typed, that's
  // right away; set from outside, it's once the effect sees it.
  let typed: string | undefined;
  const setSearch = (next: string) => {
    typed = next;
    if (props.search === undefined) setOwnSearch(next);
    props.onSearchChange?.(next);
    flush();
    activateFirst();
  };
  createEffect(search, (value, previous) => {
    if (previous !== undefined && value !== typed) activateFirst();
  });

  // A controlled value moves the active item.
  createEffect(
    () => props.value,
    (value) => {
      if (value === undefined || (active && values.get(active)?.() === value)) return;
      const item = shownItems().find((candidate) => values.get(candidate)?.() === value);
      if (item && !isDisabled(item)) activate(item, true);
    },
  );

  const context: CommandContextValue = {
    listId,
    search,
    setSearch,
    activeId,
    anyShown,
    found,
    add: (item) => {
      items.add(item);
      return () => {
        items.delete(item);
        refresh();
      };
    },
    attach: (item, element) => values.set(element, item.value),
    activate,
    isActive: (element) => element === active,
    refresh,
  };

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      step(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      if (!active?.isConnected || active.hidden || isDisabled(active)) return;
      event.preventDefault();
      active.click();
    }
  };

  const others = omit(
    props,
    'ref',
    'class',
    'children',
    'search',
    'onSearchChange',
    'value',
    'onValueChange',
    'filter',
    'shouldFilter',
    'loop',
    'onKeyDown',
  );

  return (
    <div
      ref={[(el: HTMLDivElement) => (root = el), untrack(() => props.ref)]}
      data-slot="command"
      class={joinClass(['slp-command', style.root], props.class)}
      onKeyDown={onKeyDown}
      {...others}
    >
      <CommandContext value={context}>{props.children}</CommandContext>
    </div>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export type CommandInputProps = Omit<InputProps<'input'>, 'value' | 'role' | 'type'>;

/**
 * The search field: a `combobox` that controls the list and points at its active item. Focus stays here while the
 * keyboard moves through the items. Other props go to the Input; name it with `aria-label` (default `'Search'`).
 */
export function CommandInput(props: CommandInputProps) {
  const context = useCommand('Command.Input');
  const others = omit(props, 'onInput', 'leftSection');

  return (
    <div data-slot="command-input" class={style.input}>
      <Input
        variant="ghost"
        size="lg"
        leftSection={props.leftSection === undefined ? <SearchIcon /> : props.leftSection}
        aria-label={props['aria-labelledby'] ? undefined : 'Search'}
        data-autofocus
        autocomplete="off"
        spellcheck={false}
        {...others}
        type="text"
        role="combobox"
        aria-expanded={context.anyShown() ? 'true' : 'false'}
        aria-controls={context.anyShown() ? context.listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={context.activeId()}
        value={context.search()}
        onInput={(event: InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => {
          callHandler(props.onInput, event);
          context.setSearch(event.currentTarget.value);
        }}
      />
    </div>
  );
}

export type CommandListProps = Omit<ElementProps<JSX.HTMLAttributes<HTMLDivElement>>, 'id'>;

/** The `listbox` that holds the items and groups, and scrolls. Name it with `aria-label` (default `'Suggestions'`). */
export function CommandList(props: CommandListProps) {
  const context = useCommand('Command.List');
  const others = omit(props, 'class', 'onMouseDown', 'aria-label', 'aria-labelledby');

  return (
    <div
      {...others}
      // Without an item shown, it's a plain box for the empty message.
      aria-label={context.anyShown() && !props['aria-labelledby'] ? (props['aria-label'] ?? 'Suggestions') : undefined}
      aria-labelledby={context.anyShown() ? props['aria-labelledby'] : undefined}
      id={context.listId}
      role={context.anyShown() ? 'listbox' : undefined}
      // Focus stays in the input: a scrolling listbox would otherwise be a tab stop of its own.
      tabindex={-1}
      data-slot="command-list"
      class={joinClass(['slp-command-list', style.list], props.class)}
      onMouseDown={(event: MouseEvent) => {
        callHandler(props.onMouseDown, event);
        // Pressing an item keeps focus in the input.
        event.preventDefault();
      }}
    />
  );
}

export interface CommandItemOwnProps {
  /** What it's searched by and what `onSelect` gets. Defaults to its text. */
  value?: string;
  /** More words it's found by, not shown, such as synonyms. */
  keywords?: readonly string[];
  /** Shown, but can't be selected, and skipped by the keyboard. */
  disabled?: boolean;
  /** Called with its value when it's selected: a click, or Enter while it's active. */
  onSelect?: (value: string) => void;
}

export type CommandItemProps = Omit<ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CommandItemOwnProps>, 'id'>;

/** One command: an `option`, hidden while the search doesn't find it. The pointer over it makes it active. */
export function CommandItem(props: CommandItemProps) {
  const context = useCommand('Command.Item');
  const selected = useContext(CommandSelectContext);
  const id = `slp-command-item-${createUniqueId()}`;
  const others = omit(props, 'ref', 'class', 'value', 'keywords', 'disabled', 'onSelect', 'onClick', 'onPointerMove');
  let element: HTMLDivElement | undefined;

  // Its text is read when it's searched, which is after it's in the DOM.
  // Without a value, its text is the value, read once it's in the DOM: until then, the search finds it.
  const [text, setText] = createSignal<string | undefined>(undefined, { name: 'Command.Item.text' });
  const record: ItemRecord = {
    value: () => props.value ?? text(),
    keywords: () => props.keywords ?? [],
  };
  const value = () => record.value() ?? '';
  const hidden = createMemo(() => !context.found(record), { name: 'Command.Item.hidden' });

  onCleanup(context.add(record));
  onSettled(() => {
    setText(element?.textContent?.trim() ?? '');
    context.refresh();
  });

  return (
    <div
      ref={[
        (el: HTMLDivElement) => {
          element = el;
          context.attach(record, el);
        },
        untrack(() => props.ref),
      ]}
      id={id}
      role="option"
      // Set by the Command as the active item moves.
      aria-selected="false"
      aria-disabled={props.disabled ? 'true' : undefined}
      data-value={props.value}
      data-disabled={props.disabled ? '' : undefined}
      data-slot="command-item"
      class={joinClass(['slp-command-item', style.item], props.class)}
      hidden={hidden()}
      onPointerMove={(event: PointerEvent) => {
        callHandler(props.onPointerMove, event);
        if (element && !props.disabled && !context.isActive(element)) context.activate(element, false);
      }}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (event.defaultPrevented || props.disabled) return;
        props.onSelect?.(value());
        selected?.();
      }}
      {...others}
    />
  );
}

export interface CommandGroupOwnProps {
  /** The group's heading, which names it. */
  heading?: JSX.Element;
}

export type CommandGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CommandGroupOwnProps>;

/** Items under a heading: a `group`, hidden while the search finds none of its items. */
export function CommandGroup(props: CommandGroupProps) {
  useCommand('Command.Group');
  const headingId = `slp-command-group-${createUniqueId()}`;
  const others = omit(props, 'class', 'heading', 'children');
  const withHeading = () => props.heading != null && props.heading !== false;

  return (
    <div
      role="group"
      aria-labelledby={withHeading() ? headingId : undefined}
      data-slot="command-group"
      class={joinClass(['slp-command-group', style.group], props.class)}
      {...others}
    >
      {withHeading() && (
        <div id={headingId} data-slot="command-group-heading" class={style.groupHeading}>
          {props.heading}
        </div>
      )}
      {props.children}
    </div>
  );
}

export interface CommandSeparatorOwnProps {
  /** Shows it during a search too. */
  alwaysRender?: boolean;
}

export type CommandSeparatorProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CommandSeparatorOwnProps>;

/** A line between items or groups, hidden during a search. */
export function CommandSeparator(props: CommandSeparatorProps) {
  const context = useCommand('Command.Separator');
  const others = omit(props, 'class', 'alwaysRender');
  return (
    <div
      aria-hidden="true"
      data-slot="command-separator"
      class={joinClass(['slp-command-separator', style.separator], props.class)}
      hidden={!props.alwaysRender && context.search().trim() !== ''}
      {...others}
    />
  );
}

export type CommandEmptyProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** Shown while no item is: what the list says when the search finds nothing. */
export function CommandEmpty(props: CommandEmptyProps) {
  const context = useCommand('Command.Empty');
  const others = omit(props, 'class');
  return (
    <div
      data-slot="command-empty"
      class={joinClass(['slp-command-empty', style.empty], props.class)}
      hidden={context.anyShown()}
      {...others}
    />
  );
}

export type CommandShortcutProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>>;

/** The key press for an item, at its end. */
export function CommandShortcut(props: CommandShortcutProps) {
  const others = omit(props, 'class');
  return (
    <span data-slot="command-shortcut" class={joinClass(['slp-command-shortcut', style.shortcut], props.class)} {...others} />
  );
}

Command.Input = CommandInput;
Command.List = CommandList;
Command.Item = CommandItem;
Command.Group = CommandGroup;
Command.Separator = CommandSeparator;
Command.Empty = CommandEmpty;
Command.Shortcut = CommandShortcut;
