import { createContext, createUniqueId, omit, onCleanup, onSettled, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './combobox.module.css';
import { comboboxInternals, type ComboboxInternals, type ComboboxStore } from './create-combobox';
import { Input, type InputProps } from '../input';
import {
  createDismissal,
  createFloating,
  createFocusScope,
  createPresence,
  type Floating,
  type FloatingPlacement,
  type Presence,
} from '../../primitives';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

/** A side of the target, optionally followed by an alignment along it: `bottom`, `bottom-start`, `top-end`, …. */
export type ComboboxPosition = FloatingPlacement;

export interface ComboboxProps {
  /** The state, from `createCombobox()`. */
  store: ComboboxStore;
  /** Called with an option's `value` when it's chosen: clicked, or Enter on the active option. */
  onOptionSubmit?: (value: string) => void;
  /** Whether choosing an option closes the dropdown. Defaults to `true`. */
  closeOnOptionSubmit?: boolean;
  /** Where the dropdown goes against the target. Defaults to `bottom`. It flips when there's no room. */
  position?: ComboboxPosition;
  /** Gap between the target and the dropdown, in px. Defaults to 4. */
  offset?: number;
  /** Makes the dropdown as wide as the target. Defaults to `true`. */
  matchTargetWidth?: boolean;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether a press outside the target and the dropdown closes it. Defaults to `true`. */
  closeOnClickOutside?: boolean;
  /** The dropdown's enter and exit animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 150. */
  transitionDuration?: number;
  /** Combobox.Target and Combobox.Dropdown. */
  children?: JSX.Element;
}

interface ComboboxContextValue {
  store: ComboboxStore;
  internals: ComboboxInternals;
  presence: Presence;
  floating: Floating;
  submit: (value: string) => void;
  transition: () => TransitionName;
  transitionDuration: () => number;
  target: () => HTMLElement | undefined;
  setTarget: (element: HTMLElement | undefined) => void;
  setDropdown: (element: HTMLElement | undefined) => void;
  /** A Combobox.Search is rendered: focus moves into the dropdown while it's open, and back when it closes. */
  registerSearch: () => void;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useCombobox(component: string): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Combobox>.`);
  return context;
}

/** What the target spreads on its element: `<input {...target} />`. */
export interface ComboboxTargetAttributes {
  ref: (element: HTMLElement) => void;
  role: 'combobox';
  'aria-haspopup': 'listbox';
  'aria-expanded': 'true' | 'false';
  'aria-controls': string | undefined;
  'aria-activedescendant': string | undefined;
  onKeyDown: (event: KeyboardEvent) => void;
}

export interface ComboboxTargetProps {
  /** Renders the element that has focus while the combobox is used: an input or a button. It must take a ref. */
  children: (target: ComboboxTargetAttributes) => JSX.Element;
}

const isTextField = (element: EventTarget | null) =>
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'submit', 'reset'].includes(element.type));

/**
 * The keys of the element that has focus while the combobox is used: the target, or Combobox.Search. Tab closes it
 * from the target; from the search field, focus leaving the dropdown does.
 */
function createKeyHandler(store: ComboboxStore, closeOnTab: boolean) {
  return (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey) return;
    const opened = store.opened();
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const down = event.key === 'ArrowDown';
        if (event.altKey) {
          // Alt+Down opens without moving; Alt+Up closes, keeping the active option's choice to the caller.
          if (down) store.open();
          else store.close();
        } else if (!opened) {
          store.open();
          if (!store.activateSelected()) {
            if (down) store.activateFirst();
            else store.activateLast();
          }
        } else if (down) store.activateNext();
        else store.activatePrevious();
        return;
      }
      case 'Home':
      case 'End':
        // In a text field they move the caret.
        if (!opened || event.altKey || isTextField(event.currentTarget)) return;
        event.preventDefault();
        if (event.key === 'Home') store.activateFirst();
        else store.activateLast();
        return;
      case 'Enter':
        if (opened && store.activeId() !== undefined && !event.altKey) {
          event.preventDefault();
          store.submitActive();
        }
        return;
      case 'Tab':
        if (opened && closeOnTab) store.close();
        return;
    }
  };
}

/**
 * The element that has focus while the combobox is used, unless a Combobox.Search takes it, and that the dropdown is
 * positioned against. It handles the keys; opening it on a click or on input is up to you, through the store.
 */
export function ComboboxTarget(props: ComboboxTargetProps) {
  const context = useCombobox('Combobox.Target');
  const { store } = context;
  const onKeyDown = createKeyHandler(store, true);

  const attributes: ComboboxTargetAttributes = {
    ref: (element) => context.setTarget(element),
    role: 'combobox',
    'aria-haspopup': 'listbox',
    get 'aria-expanded'() {
      return store.opened() ? 'true' : 'false';
    },
    // Only while the listbox is in the DOM: a reference to a missing id is invalid.
    get 'aria-controls'() {
      return context.presence.mounted() ? context.internals.listboxId : undefined;
    },
    get 'aria-activedescendant'() {
      return store.opened() ? store.activeId() : undefined;
    },
    onKeyDown,
  };
  // Called once, untracked: a signal the render function reads directly would otherwise rebuild the target, losing
  // focus. What changes goes in the attributes' getters and in the JSX's own expressions.
  return <>{untrack(() => props.children(attributes))}</>;
}

export type ComboboxDropdownProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/**
 * The floating surface, in the top layer, rendered while open. Put Combobox.Options in it, and anything else the
 * dropdown needs, such as Combobox.Empty or a footer.
 */
export function ComboboxDropdown(props: ComboboxDropdownProps) {
  const context = useCombobox('Combobox.Dropdown');
  return (
    <Show when={context.presence.mounted()}>
      <ComboboxDropdownElement {...props} />
    </Show>
  );
}

function ComboboxDropdownElement(props: ComboboxDropdownProps) {
  const context = useCombobox('Combobox.Dropdown');
  const others = omit(props, 'ref', 'class', 'style', 'children', 'onMouseDown', 'onFocusOut');
  const animation = transitionAttributes(context.presence, {
    transition: context.transition,
    duration: context.transitionDuration,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });
  let element: HTMLDivElement | undefined;

  onSettled(() => {
    element?.showPopover();
    context.floating.update();
  });
  onCleanup(() => context.setDropdown(undefined));

  return (
    <div
      ref={[
        (el: HTMLDivElement) => {
          element = el;
          context.setDropdown(el);
        },
        untrack(() => props.ref),
      ]}
      popover="manual"
      data-slot="combobox-dropdown"
      data-placement={context.floating.placement()}
      data-transition={animation['data-transition']}
      data-status={animation['data-status']}
      class={joinClass(['slp-combobox', style.dropdown, animation.class], props.class)}
      style={{ ...animation.style, ...props.style }}
      // Pressing an option, a group label or the dropdown's padding keeps focus on the target. Fields inside the
      // dropdown still take focus.
      onMouseDown={(event: MouseEvent) => {
        callHandler(props.onMouseDown, event);
        const target = event.target as Element;
        if (!target.closest('input, textarea, select, button, a[href], [contenteditable], [tabindex]:not([role="listbox"])')) {
          event.preventDefault();
        }
      }}
      // Focus moving on from a field inside, such as Combobox.Search, to somewhere else on the page closes it. Back to
      // the target, or to nowhere (a press outside, which the dismissal handles), it stays. Closed once focus has
      // landed there: closing before would find it nowhere and bring it back to the target.
      onFocusOut={(event: FocusEvent) => {
        callHandler(props.onFocusOut, event);
        const next = event.relatedTarget;
        if (next instanceof HTMLElement && !element?.contains(next) && next !== context.target()) {
          next.addEventListener('focusin', () => context.store.close(), { once: true });
        }
      }}
      {...others}
    >
      {props.children}
    </div>
  );
}

export type ComboboxSearchProps = Omit<InputProps<'input'>, 'role' | 'type'>;

/**
 * A search field inside the dropdown, for a target that can't take text, such as a button. It takes focus when the
 * dropdown opens, makes the selected option active (else the first), and handles the keys as the target does; focus
 * goes back to the target when it closes. Typing makes the first option active, after your `onInput` filtered them.
 * Other props go to the Input; name it with `aria-label` (default `'Search'`).
 */
export function ComboboxSearch(props: ComboboxSearchProps) {
  const context = useCombobox('Combobox.Search');
  const { store } = context;
  const others = omit(props, 'onInput', 'onKeyDown', 'leftSection');
  const onKeyDown = createKeyHandler(store, false);

  context.registerSearch();
  // After the options are rendered. Opening from the target's keys has made one active already, which stays.
  onSettled(() => {
    queueMicrotask(() => {
      if (store.opened() && store.activeId() === undefined && !store.activateSelected()) store.activateFirst();
    });
  });

  return (
    <div data-slot="combobox-search" class={`slp-combobox-search ${style.search}`}>
      <Input
        variant="ghost"
        size="sm"
        leftSection={props.leftSection === undefined ? <SearchIcon /> : props.leftSection}
        aria-label={props['aria-labelledby'] ? undefined : 'Search'}
        data-autofocus
        autocomplete="off"
        spellcheck={false}
        {...others}
        type="text"
        role="combobox"
        aria-expanded={store.opened() ? 'true' : 'false'}
        aria-controls={context.internals.listboxId}
        aria-autocomplete="list"
        aria-activedescendant={store.activeId()}
        onInput={(event: InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => {
          callHandler(props.onInput, event);
          store.activateFirst();
        }}
        onKeyDown={(event: KeyboardEvent & { currentTarget: HTMLInputElement; target: Element }) => {
          callHandler(props.onKeyDown, event);
          onKeyDown(event);
        }}
      />
    </div>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export type ComboboxOptionsProps = Omit<ElementProps<JSX.HTMLAttributes<HTMLDivElement>>, 'id'>;

/** The `listbox` that holds the options. Name it with `aria-label` or `aria-labelledby`. */
export function ComboboxOptions(props: ComboboxOptionsProps) {
  const context = useCombobox('Combobox.Options');
  const others = omit(props, 'ref', 'class');
  onCleanup(() => context.internals.setListbox(undefined));

  return (
    <div
      ref={[(el: HTMLDivElement) => context.internals.setListbox(el), untrack(() => props.ref)]}
      id={context.internals.listboxId}
      role="listbox"
      // Focus stays on the target: a scrolling listbox would otherwise be a tab stop of its own.
      tabindex={-1}
      data-slot="combobox-options"
      class={joinClass(['slp-combobox-options', style.options], props.class)}
      {...others}
    />
  );
}

export interface ComboboxOptionOwnProps {
  /** What `onOptionSubmit` is called with. */
  value: string;
  /** Whether it's the current value: `aria-selected="true"`, and where the keyboard starts when the dropdown opens. */
  selected?: boolean;
  /** Can't be chosen or made active. */
  disabled?: boolean;
}

export type ComboboxOptionProps = Omit<ElementProps<JSX.HTMLAttributes<HTMLDivElement>, ComboboxOptionOwnProps>, 'id'>;

/** One choice: an `option`. The pointer over it makes it active; a click chooses it. */
export function ComboboxOption(props: ComboboxOptionProps) {
  const context = useCombobox('Combobox.Option');
  const others = omit(props, 'class', 'value', 'selected', 'disabled', 'onClick', 'onPointerMove');
  const id = `slp-combobox-option-${createUniqueId()}`;
  let element: HTMLDivElement | undefined;

  // A filtered-out option takes the active state with it.
  onCleanup(() => {
    if (element) context.internals.forget(element);
  });

  return (
    <div
      ref={(el: HTMLDivElement) => (element = el)}
      id={id}
      role="option"
      data-value={props.value}
      aria-selected={props.selected ? 'true' : 'false'}
      aria-disabled={props.disabled ? 'true' : undefined}
      data-selected={props.selected ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined}
      class={joinClass(['slp-combobox-option', style.option], props.class)}
      onPointerMove={(event: PointerEvent) => {
        callHandler(props.onPointerMove, event);
        if (!props.disabled && context.internals.active() !== element) context.internals.activate(element, false);
      }}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (!event.defaultPrevented && !props.disabled) context.submit(props.value);
      }}
      {...others}
    />
  );
}

export interface ComboboxGroupOwnProps {
  /** The group's heading, which names it. */
  label: string;
}

export type ComboboxGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, ComboboxGroupOwnProps>;

/** Options under a heading: a `group` named by its label. */
export function ComboboxGroup(props: ComboboxGroupProps) {
  const others = omit(props, 'class', 'label', 'children');
  const labelId = `slp-combobox-group-${createUniqueId()}`;
  return (
    <div role="group" aria-labelledby={labelId} class={joinClass(['slp-combobox-group', style.group], props.class)} {...others}>
      <div id={labelId} data-slot="combobox-group-label" class={style.groupLabel}>
        {props.label}
      </div>
      {props.children}
    </div>
  );
}

export type ComboboxEmptyProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** What the dropdown says when there's nothing to choose. Render it next to Combobox.Options, not inside it. */
export function ComboboxEmpty(props: ComboboxEmptyProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-combobox-empty', style.empty], props.class)} {...others} />;
}

/**
 * The building block for picking from a list of options while focus stays on a field or a button: a target with
 * `role="combobox"`, and a dropdown with a `listbox` in the top layer. The arrow keys open it and move the active
 * option, Enter chooses it, Escape, Tab and a press outside close it. Its state is a store from `createCombobox()`,
 * which you open, close and move from your own handlers.
 */
export function Combobox(props: ComboboxProps) {
  const store = untrack(() => props.store);
  const internals = comboboxInternals(store);
  let target: HTMLElement | undefined;
  let dropdown: HTMLElement | undefined;

  const presence = createPresence({ present: store.opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => target,
    floating: () => dropdown,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom',
    offset: () => props.offset ?? 4,
    sameWidth: () => props.matchTargetWidth ?? true,
  });
  // Whether the dropdown has a Combobox.Search, read as it opens and closes: with one, focus moves into the dropdown
  // while it's open, and back to the target once it closes. Without one, focus is left alone. It stays set once the
  // search has been rendered: without an exit animation, the search is gone by the time the dropdown has closed.
  let hasSearch = false;
  createFocusScope({
    open: () => store.opened() && presence.mounted(),
    element: () => dropdown,
    autoFocus: () => hasSearch,
    restoreFocus: () => hasSearch,
    restoreTarget: () => target,
  });
  createDismissal('Combobox', {
    open: store.opened,
    elements: () => [target, dropdown],
    onDismiss: () => store.close(),
    closeOnEscape: () => props.closeOnEscape ?? true,
    closeOnClickOutside: () => props.closeOnClickOutside ?? true,
  });

  const context: ComboboxContextValue = {
    store,
    internals,
    presence,
    floating,
    submit: (value) => {
      props.onOptionSubmit?.(value);
      if (props.closeOnOptionSubmit ?? true) store.close();
    },
    transition: () => props.transition ?? 'fade',
    transitionDuration: () => props.transitionDuration ?? 150,
    target: () => target,
    setTarget: (element) => (target = element),
    setDropdown: (element) => (dropdown = element),
    registerSearch: () => (hasSearch = true),
  };

  return <ComboboxContext value={context}>{props.children}</ComboboxContext>;
}

Combobox.Target = ComboboxTarget;
Combobox.Dropdown = ComboboxDropdown;
Combobox.Search = ComboboxSearch;
Combobox.Options = ComboboxOptions;
Combobox.Option = ComboboxOption;
Combobox.Group = ComboboxGroup;
Combobox.Empty = ComboboxEmpty;
