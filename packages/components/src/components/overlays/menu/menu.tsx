import {
  createContext,
  createSignal,
  createUniqueId,
  flush,
  omit,
  onCleanup,
  onSettled,
  Show,
  untrack,
  useContext,
  type Accessor,
} from 'solid-js';
import type { JSX, ValidComponent } from '@solidjs/web';
import style from './menu.module.css';
import {
  createDismissal,
  createFloating,
  createFocusScope,
  createListNavigation,
  createPresence,
  createTypeahead,
  type Floating,
  type FloatingPlacement,
  type Presence,
} from '../../primitives';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

/** A side of the target, optionally followed by an alignment along it: `bottom-start`, `right`, …. */
export type MenuPosition = FloatingPlacement;

export interface MenuProps {
  /** Whether the menu is open, for a controlled menu. */
  opened?: boolean;
  /** Whether it starts open, for an uncontrolled one. Read once. */
  defaultOpened?: boolean;
  /** Called when the menu opens or closes itself: the target, an item, Escape, Tab or a press outside. */
  onChange?: (opened: boolean) => void;
  /** Where the dropdown goes against the target. Defaults to `bottom-start`. It flips when there's no room. */
  position?: MenuPosition;
  /** Gap between the target and the dropdown, in px. Defaults to 4. */
  offset?: number;
  /** Shows an arrow pointing at the target. */
  withArrow?: boolean;
  /** Whether choosing an item closes the menu. Defaults to `true`; an item's `closeMenuOnClick` overrides it. */
  closeOnItemClick?: boolean;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether a press outside the target and the dropdown closes it. Defaults to `true`. */
  closeOnClickOutside?: boolean;
  /** Whether the arrow keys go from the last item to the first, and back. Defaults to `true`. */
  loop?: boolean;
  /** The dropdown's enter and exit animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 150. */
  transitionDuration?: number;
  /** Menu.Target and Menu.Dropdown. */
  children?: JSX.Element;
}

/**
 * Where focus goes when the menu opens: the first or last item, or the menu itself (for a pointer, or when it's opened
 * from outside). `none` leaves it, for a menu that starts open on page load.
 */
type InitialFocus = 'first' | 'last' | 'menu' | 'none';

interface MenuContextValue {
  opened: Accessor<boolean>;
  open: (focus: InitialFocus) => void;
  toggle: (focus: InitialFocus) => void;
  close: () => void;
  /** Where focus goes for this opening. The next opening that doesn't say focuses the menu. */
  takeInitialFocus: () => InitialFocus;
  presence: Presence;
  floating: Floating;
  targetId: string;
  dropdownId: string;
  withArrow: () => boolean;
  closeOnItemClick: () => boolean;
  loop: () => boolean;
  transition: () => TransitionName;
  transitionDuration: () => number;
  setTarget: (element: HTMLElement | undefined) => void;
  setDropdown: (element: HTMLElement | undefined) => void;
  setArrow: (element: HTMLElement | undefined) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(component: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Menu>.`);
  return context;
}

/** What the target spreads on its element: `<Button {...target}>`. */
export interface MenuTargetAttributes {
  ref: (element: HTMLElement) => void;
  id: string;
  onClick: (event: MouseEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  'aria-haspopup': 'menu';
  'aria-expanded': 'true' | 'false';
  'aria-controls': string | undefined;
}

export interface MenuTargetProps {
  /** Renders the button that opens the menu. Spread the attributes on it; it must take a ref. */
  children: (target: MenuTargetAttributes) => JSX.Element;
}

/** The button that opens the menu and that the dropdown is positioned against. */
export function MenuTarget(props: MenuTargetProps) {
  const context = useMenu('Menu.Target');
  const attributes: MenuTargetAttributes = {
    ref: (element) => context.setTarget(element),
    id: context.targetId,
    // A click from Enter or Space has no detail, and focuses the first item; a pointer's focuses the menu.
    onClick: (event) => context.toggle(event.detail === 0 ? 'first' : 'menu'),
    onKeyDown: (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      context.open(event.key === 'ArrowDown' ? 'first' : 'last');
    },
    'aria-haspopup': 'menu',
    get 'aria-expanded'() {
      return context.opened() ? 'true' : 'false';
    },
    // Only while the dropdown is in the DOM: a reference to a missing id is invalid.
    get 'aria-controls'() {
      return context.presence.mounted() ? context.dropdownId : undefined;
    },
  };
  // Called once, untracked: a signal the render function reads directly would otherwise rebuild the target, losing
  // focus. What changes goes in the attributes' getters and in the JSX's own expressions.
  return <>{untrack(() => props.children(attributes))}</>;
}

export type MenuDropdownProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** The menu: `role="menu"` in the top layer, labelled by the target, rendered while open. */
export function MenuDropdown(props: MenuDropdownProps) {
  const context = useMenu('Menu.Dropdown');
  return (
    <Show when={context.presence.mounted()}>
      <MenuDropdownElement {...props} />
    </Show>
  );
}

/** The items of `menu` itself, in order, leaving out those of a menu nested inside it. */
const itemsOf = (menu: HTMLElement | undefined): HTMLElement[] =>
  menu
    ? [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter((item) => item.closest('[role="menu"]') === menu)
    : [];

const isItemDisabled = (item: HTMLElement | undefined) => !!item?.matches(':disabled, [aria-disabled="true"]');

function MenuDropdownElement(props: MenuDropdownProps) {
  const context = useMenu('Menu.Dropdown');
  const others = omit(props, 'ref', 'class', 'style', 'children', 'onKeyDown');
  const animation = transitionAttributes(context.presence, {
    transition: context.transition,
    duration: context.transitionDuration,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });
  let element: HTMLDivElement | undefined;

  const items = () => itemsOf(element);
  const current = () => items().indexOf(document.activeElement as HTMLElement);
  const focusItem = (index: number) => items()[index]?.focus({ preventScroll: false });
  const navigation = createListNavigation({
    orientation: () => 'vertical',
    count: () => items().length,
    current,
    isDisabled: (index) => isItemDisabled(items()[index]),
    loop: context.loop,
    onMove: focusItem,
  });
  const typeahead = createTypeahead({
    count: () => items().length,
    current,
    // The label, without what the sections hold, such as a shortcut.
    getLabel: (index) => {
      const item = items()[index];
      return (item?.querySelector('[data-slot="menu-item-label"]') ?? item)?.textContent ?? '';
    },
    isDisabled: (index) => isItemDisabled(items()[index]),
    onMatch: focusItem,
  });

  // In the top layer once it's in the document, positioned at once, and the item the opening asked for focused.
  onSettled(() => {
    if (!element) return;
    element.showPopover();
    context.floating.update();
    const focus = context.takeInitialFocus();
    if (focus === 'none') return;
    const enabled = items().filter((item) => !isItemDisabled(item));
    const item = focus === 'first' ? enabled[0] : focus === 'last' ? enabled.at(-1) : undefined;
    (item ?? element).focus({ preventScroll: true });
  });
  onCleanup(() => {
    typeahead.reset();
    context.setDropdown(undefined);
    context.setArrow(undefined);
  });

  return (
    <div
      ref={[
        (el: HTMLDivElement) => {
          element = el;
          context.setDropdown(el);
        },
        untrack(() => props.ref),
      ]}
      id={context.dropdownId}
      popover="manual"
      role="menu"
      tabindex={-1}
      aria-labelledby={context.targetId}
      data-slot="menu-dropdown"
      data-placement={context.floating.placement()}
      data-transition={animation['data-transition']}
      data-status={animation['data-status']}
      class={joinClass(['slp-menu', style.dropdown, animation.class], props.class)}
      style={{ ...animation.style, ...props.style }}
      onKeyDown={(event: KeyboardEvent) => {
        callHandler(props.onKeyDown, event);
        // Tab leaves a menu: it closes, and focus moves on from the target.
        if (event.key === 'Tab') return context.close();
        navigation.onKeyDown(event);
        typeahead.onKeyDown(event);
      }}
      {...others}
    >
      {props.children}
      <Show when={context.withArrow()}>
        <div data-slot="menu-arrow" class={style.arrow} ref={(el) => context.setArrow(el)} />
      </Show>
    </div>
  );
}

export interface MenuItemOwnProps {
  /** Content before the label, such as an icon. */
  leftSection?: JSX.Element;
  /** Content after the label, such as a keyboard shortcut. */
  rightSection?: JSX.Element;
  /** Color role of its text, e.g. `error` for a destructive action. Without one it uses the base colors. */
  color?: SlopColor;
  /** Whether it can't be chosen. Arrow keys and typing skip it. */
  disabled?: boolean;
  /** Whether choosing it closes the menu. Defaults to the menu's `closeOnItemClick`. */
  closeMenuOnClick?: boolean;
}

export type MenuItemProps<T extends ValidComponent = 'button'> = PolymorphicProps<T, MenuItemOwnProps>;

/**
 * An item: a `button` with `role="menuitem"` by default, or a link with `as="a"`. Choosing it runs its `onClick`, then
 * closes the menu and moves focus back to the target, unless the handler prevents the event's default.
 */
export function MenuItem<T extends ValidComponent = 'button'>(props: MenuItemProps<T>) {
  const context = useMenu('Menu.Item');
  const own = props as MenuItemOwnProps & {
    as?: ValidComponent;
    class?: JSX.ClassValue;
    children?: JSX.Element;
    onClick?: unknown;
    onPointerMove?: unknown;
  };
  const others = omit(
    own,
    'as',
    'class',
    'children',
    'leftSection',
    'rightSection',
    'color',
    'disabled',
    'closeMenuOnClick',
    'onClick',
    'onPointerMove',
  );
  const as = untrack(() => own.as) ?? 'button';
  // Whether the sections are passed, without reading them: a JSX prop is read only where it's rendered.
  const withLeft = untrack(() => 'leftSection' in own);
  const withRight = untrack(() => 'rightSection' in own);

  return (
    <Polymorphic
      as={as}
      type={as === 'button' ? 'button' : undefined}
      role="menuitem"
      tabindex={-1}
      disabled={as === 'button' ? own.disabled : undefined}
      aria-disabled={own.disabled && as !== 'button' ? 'true' : undefined}
      data-disabled={own.disabled ? '' : undefined}
      data-color={own.color}
      class={joinClass(['slp-menu-item', style.item], own.class)}
      // The pointer moves focus along with it, so the keyboard picks up where the pointer is.
      onPointerMove={(event: PointerEvent) => {
        callHandler(own.onPointerMove, event);
        const item = event.currentTarget as HTMLElement;
        if (!own.disabled && document.activeElement !== item) item.focus({ preventScroll: true });
      }}
      onClick={(event: MouseEvent) => {
        if (own.disabled) {
          event.preventDefault();
          return;
        }
        callHandler(own.onClick, event);
        if (!event.defaultPrevented && (own.closeMenuOnClick ?? context.closeOnItemClick())) context.close();
      }}
      {...others}
    >
      {withLeft && (
        <span data-slot="menu-item-section" data-position="left" class={style.section}>
          {own.leftSection}
        </span>
      )}
      <span data-slot="menu-item-label" class={style.label}>
        {own.children}
      </span>
      {withRight && (
        <span data-slot="menu-item-section" data-position="right" class={style.section}>
          {own.rightSection}
        </span>
      )}
    </Polymorphic>
  );
}

export type MenuLabelProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** A heading over a group of items. It isn't an item: arrow keys skip it. */
export function MenuLabel(props: MenuLabelProps) {
  const others = omit(props, 'class');
  return <div role="presentation" class={joinClass(['slp-menu-label', style.menuLabel], props.class)} {...others} />;
}

export type MenuDividerProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** A line between groups of items. */
export function MenuDivider(props: MenuDividerProps) {
  const others = omit(props, 'class');
  return <div role="separator" class={joinClass(['slp-menu-divider', style.divider], props.class)} {...others} />;
}

/**
 * A list of actions behind a button, in the top layer. Build it from Menu.Target and Menu.Dropdown, with Menu.Item,
 * Menu.Label and Menu.Divider inside. The arrow keys, Home, End and typing move between items; choosing one, Escape,
 * Tab or a press outside closes it, and focus goes back to the target.
 */
export function Menu(props: MenuProps) {
  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultOpened),
    { name: 'Menu.opened' },
  );
  const opened = () => props.opened ?? own();
  const setOpened = (next: boolean) => {
    if (next === opened()) return;
    if (props.opened === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  let target: HTMLElement | undefined;
  let dropdown: HTMLElement | undefined;
  let arrow: HTMLElement | undefined;
  // A menu open on the first render leaves focus where the page has it.
  let initialFocus: InitialFocus = untrack(opened) ? 'none' : 'menu';

  const presence = createPresence({ present: opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => target,
    floating: () => dropdown,
    arrow: () => arrow,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom-start',
    offset: () => props.offset ?? 4,
    arrowPadding: () => 12,
  });
  createDismissal('Menu', {
    open: opened,
    elements: () => [target, dropdown],
    onDismiss: () => setOpened(false),
    closeOnEscape: () => props.closeOnEscape ?? true,
    closeOnClickOutside: () => props.closeOnClickOutside ?? true,
  });
  // The dropdown focuses its own item when it opens; closing moves focus back to the target.
  createFocusScope({
    open: () => opened() && presence.mounted(),
    element: () => dropdown,
    autoFocus: () => false,
    restoreTarget: () => target,
  });

  const open = (focus: InitialFocus) => {
    initialFocus = focus;
    setOpened(true);
  };

  const context: MenuContextValue = {
    opened,
    open,
    toggle: (focus) => (opened() ? setOpened(false) : open(focus)),
    close: () => setOpened(false),
    takeInitialFocus: () => {
      const focus = initialFocus;
      initialFocus = 'menu';
      return focus;
    },
    presence,
    floating,
    targetId: `slp-menu-target-${createUniqueId()}`,
    dropdownId: `slp-menu-${createUniqueId()}`,
    withArrow: () => !!props.withArrow,
    closeOnItemClick: () => props.closeOnItemClick ?? true,
    loop: () => props.loop ?? true,
    transition: () => props.transition ?? 'fade',
    transitionDuration: () => props.transitionDuration ?? 150,
    setTarget: (element) => (target = element),
    setDropdown: (element) => (dropdown = element),
    setArrow: (element) => (arrow = element),
  };

  return <MenuContext value={context}>{props.children}</MenuContext>;
}

Menu.Target = MenuTarget;
Menu.Dropdown = MenuDropdown;
Menu.Item = MenuItem;
Menu.Label = MenuLabel;
Menu.Divider = MenuDivider;
