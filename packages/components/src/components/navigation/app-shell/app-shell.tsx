import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  flush,
  omit,
  onSettled,
  untrack,
  useContext,
  type Accessor,
} from 'solid-js';
import { type JSX, type ValidComponent } from '@solidjs/web';
import style from './app-shell.module.css';
import { createDismissal, createFocusScope, createPresence, createScrollLock } from '../../primitives';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import { ActionIcon, type ActionIconVariant } from '../../button/action-icon';
import { Tooltip, type TooltipTargetAttributes } from '../../overlays/tooltip';
import { callHandler, matchesShortcut, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

/** Below this width the sidebar leaves the layout and opens as a drawer over the page. */
const MOBILE_QUERY = '(width < 48em)';

/** The edge of the shell the sidebar sits against. */
export type AppShellSidebarPosition = 'left' | 'right';

/**
 * How the sidebar looks: a full-height panel with a border (`sidebar`), a card that floats with a gap around it
 * (`floating`), or part of the background, with the main area as a raised card next to it (`inset`).
 */
export type AppShellSidebarVariant = 'sidebar' | 'floating' | 'inset';

/**
 * What collapsing does on a wide screen: slide the sidebar out of the layout (`offcanvas`), shrink it to its icons
 * (`icon`), or nothing (`none`).
 */
export type AppShellSidebarCollapsible = 'offcanvas' | 'icon' | 'none';

/** The height of a menu row: `sm` (1.75rem), `md` (2rem) or `lg` (3rem, for a row with two lines or an avatar). */
export type AppShellMenuButtonSize = 'sm' | 'md' | 'lg';

/** The state of the shell, from `useAppShell()`. */
export interface UseAppShell {
  /** Whether the sidebar is expanded on a wide screen. */
  opened: Accessor<boolean>;
  /** Expands or collapses it on a wide screen. */
  setOpened: (opened: boolean) => void;
  /** Whether the screen is narrow, so the sidebar is a drawer. `false` on the server and until hydrated. */
  mobile: Accessor<boolean>;
  /** Whether the drawer is open on a narrow screen. */
  mobileOpened: Accessor<boolean>;
  /** Opens or closes the drawer on a narrow screen. */
  setMobileOpened: (opened: boolean) => void;
  /** Toggles what the screen shows: the drawer on a narrow screen, the sidebar on a wide one. */
  toggle: () => void;
}

interface AppShellContextValue extends UseAppShell {
  sidebarId: string;
}

interface SidebarContextValue {
  /** Whether the sidebar shows only its icons: collapsed to `icon` on a wide screen. */
  iconOnly: Accessor<boolean>;
  position: Accessor<AppShellSidebarPosition>;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);
const SidebarContext = createContext<SidebarContextValue | null>(null);

function useShell(component: string): AppShellContextValue {
  const context = useContext(AppShellContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <AppShell>.`);
  return context;
}

/** The state of the nearest `<AppShell>`: whether its sidebar is expanded, and its drawer on a narrow screen. */
export function useAppShell(): UseAppShell {
  const { opened, setOpened, mobile, mobileOpened, setMobileOpened, toggle } = useShell('useAppShell()');
  return { opened, setOpened, mobile, mobileOpened, setMobileOpened, toggle };
}

// --- AppShell ---------------------------------------------------------------------------------------------------

export interface AppShellOwnProps {
  /** Whether the sidebar is expanded on a wide screen, for a controlled shell. */
  opened?: boolean;
  /** Whether it starts expanded, for an uncontrolled one. Read once. Defaults to `true`. */
  defaultOpened?: boolean;
  /** Called when the sidebar asks to expand or collapse on a wide screen: the trigger, the rail or the shortcut. */
  onChange?: (opened: boolean) => void;
  /**
   * The key or keys that toggle the sidebar from anywhere on the page, such as `'mod+B'` (⌘B on Apple devices, Ctrl+B
   * elsewhere); `null` turns it off. Defaults to `'mod+B'`.
   */
  shortcut?: string | readonly string[] | null;
}

export type AppShellProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AppShellOwnProps>;

/**
 * The frame of an app: a sidebar of navigation next to the main area, built from AppShell.Sidebar and AppShell.Main.
 * On a wide screen the sidebar collapses and expands; on a narrow one (below 48em) it opens as a drawer over the page.
 * It holds the state, which `useAppShell()` reads and changes from anywhere inside.
 */
export function AppShell(props: AppShellProps) {
  const others = omit(props, 'class', 'opened', 'defaultOpened', 'onChange', 'shortcut');
  const [ownOpened, setOwnOpened] = createSignal(
    untrack(() => props.defaultOpened ?? true),
    { name: 'AppShell.opened' },
  );
  const opened = () => props.opened ?? ownOpened();
  const setOpened = (next: boolean) => {
    if (props.opened === undefined) setOwnOpened(next);
    props.onChange?.(next);
    flush();
  };

  const [mobile, setMobile] = createSignal(false, { name: 'AppShell.mobile' });
  const [mobileOpened, setOwnMobileOpened] = createSignal(false, { name: 'AppShell.mobileOpened' });
  const setMobileOpened = (next: boolean) => {
    setOwnMobileOpened(next);
    flush();
  };
  const toggle = () => (mobile() ? setMobileOpened(!mobileOpened()) : setOpened(!opened()));

  onSettled(() => {
    // Every browser has matchMedia; jsdom doesn't.
    const media = typeof matchMedia === 'function' ? matchMedia(MOBILE_QUERY) : undefined;
    const onMediaChange = () => {
      const next = media?.matches ?? false;
      setMobile(next);
      // The drawer doesn't stay open behind a wide layout, or come back when the screen narrows again.
      if (!next) setOwnMobileOpened(false);
    };
    onMediaChange();
    media?.addEventListener('change', onMediaChange);

    // The shortcut works anywhere on the page, also in a field, unless something there has handled the key.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const shortcut = props.shortcut === undefined ? 'mod+B' : props.shortcut;
      if (shortcut === null) return;
      const shortcuts = typeof shortcut === 'string' ? [shortcut] : shortcut;
      if (!shortcuts.some((one) => matchesShortcut(event, one))) return;
      event.preventDefault();
      toggle();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      media?.removeEventListener('change', onMediaChange);
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  const context: AppShellContextValue = {
    opened,
    setOpened,
    mobile,
    mobileOpened,
    setMobileOpened,
    toggle,
    sidebarId: `slp-app-shell-sidebar-${createUniqueId()}`,
  };

  return (
    <AppShellContext value={context}>
      <div
        data-state={opened() ? 'expanded' : 'collapsed'}
        class={joinClass(['slp-app-shell', style.appShell], props.class)}
        {...others}
      />
    </AppShellContext>
  );
}

// --- Sidebar ----------------------------------------------------------------------------------------------------

export interface AppShellSidebarOwnProps {
  /** The edge it sits against. Defaults to `left`. */
  position?: AppShellSidebarPosition;
  /** Defaults to `sidebar`. */
  variant?: AppShellSidebarVariant;
  /** What collapsing does on a wide screen. Defaults to `offcanvas`. */
  collapsible?: AppShellSidebarCollapsible;
  /** Accessible name of the drawer it opens as on a narrow screen. Defaults to `'Sidebar'`. */
  label?: string;
  /** Whether a press on a link inside closes the drawer on a narrow screen. Defaults to `true`. */
  closeOnLinkClick?: boolean;
}

export type AppShellSidebarProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AppShellSidebarOwnProps>;

/**
 * The sidebar, built from AppShell.SidebarHeader, AppShell.SidebarContent and AppShell.SidebarFooter. On a wide
 * screen it's a column as tall as the viewport that stays in view as the page scrolls; it collapses as `collapsible`
 * says. On a narrow screen it's a drawer in the top layer: modal, with focus kept inside, closed by Escape, a press
 * on the backdrop, or a press on a link inside.
 */
export function AppShellSidebar(props: AppShellSidebarProps) {
  const shell = useShell('AppShell.Sidebar');
  const others = omit(
    props,
    'ref',
    'class',
    'children',
    'position',
    'variant',
    'collapsible',
    'label',
    'closeOnLinkClick',
    'onClick',
  );
  const position = () => props.position ?? 'left';
  const collapsible = () => props.collapsible ?? 'offcanvas';
  const collapsed = () => !shell.opened() && collapsible() !== 'none';
  let sidebar: HTMLDivElement | undefined;
  let panel: HTMLDivElement | undefined;

  // The drawer, on a narrow screen.
  const drawerOpened = () => shell.mobile() && shell.mobileOpened();
  const presence = createPresence({ present: drawerOpened, element: () => sidebar });
  const modal = presence.mounted;
  createDismissal('AppShell.Sidebar', {
    open: drawerOpened,
    // A press on the backdrop is a press on the sidebar itself, outside its panel.
    elements: () => [panel],
    onDismiss: () => shell.setMobileOpened(false),
  });
  // Before the focus scope: focus goes back to the trigger once the shell is no longer inert.
  createEffect(modal, (mounted) => {
    if (!sidebar) return;
    if (mounted) {
      sidebar.showPopover();
      // The rest of the shell is out of reach while the drawer is open, as under a modal dialog.
      const siblings = [...(sidebar.parentElement?.children ?? [])].filter(
        (element): element is HTMLElement => element !== sidebar && element instanceof HTMLElement && !element.inert,
      );
      for (const element of siblings) element.inert = true;
      return () => {
        for (const element of siblings) element.inert = false;
      };
    }
    if (sidebar.matches(':popover-open')) sidebar.hidePopover();
  });
  createFocusScope({ open: modal, element: () => sidebar, trap: () => true });
  createScrollLock({ locked: modal });

  const iconOnly = () => !shell.mobile() && collapsed() && collapsible() === 'icon';

  return (
    <SidebarContext value={{ iconOnly, position }}>
      <div
        ref={[(el: HTMLDivElement) => (sidebar = el), untrack(() => props.ref)]}
        id={shell.sidebarId}
        // Shown in the top layer as the drawer on a narrow screen; on a wide one its CSS shows it in the layout.
        popover="manual"
        role={modal() ? 'dialog' : undefined}
        aria-modal={modal() ? 'true' : undefined}
        aria-label={modal() ? (props.label ?? 'Sidebar') : undefined}
        tabindex={modal() ? -1 : undefined}
        data-state={collapsed() ? 'collapsed' : 'expanded'}
        data-position={position()}
        data-variant={props.variant ?? 'sidebar'}
        data-collapsible={collapsible()}
        data-status={presence.status()}
        class={joinClass(['slp-app-shell-sidebar', style.sidebar], props.class)}
        onClick={(event: MouseEvent) => {
          callHandler(props.onClick, event);
          if (event.defaultPrevented || !modal() || !(props.closeOnLinkClick ?? true)) return;
          if ((event.target as Element).closest('a[href]')) shell.setMobileOpened(false);
        }}
        {...others}
      >
        <div ref={(el: HTMLDivElement) => (panel = el)} data-slot="app-shell-sidebar-panel" class={style.panel}>
          {props.children}
        </div>
      </div>
    </SidebarContext>
  );
}

function useSidebar(component: string): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <AppShell.Sidebar>.`);
  return context;
}

export type AppShellPartProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** The top of the sidebar, which doesn't scroll: a logo, a team switcher, a search field. */
export function AppShellSidebarHeader(props: AppShellPartProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-app-shell-sidebar-header', style.header], props.class)} {...others} />;
}

/** The middle of the sidebar, which scrolls when its groups are taller than the room left. */
export function AppShellSidebarContent(props: AppShellPartProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-app-shell-sidebar-content', style.content], props.class)} {...others} />;
}

/** The bottom of the sidebar, which doesn't scroll: the user's menu, settings. */
export function AppShellSidebarFooter(props: AppShellPartProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-app-shell-sidebar-footer', style.footer], props.class)} {...others} />;
}

// --- Groups -----------------------------------------------------------------------------------------------------

export interface AppShellGroupOwnProps {
  /** The group's heading, which also names it. It fades out while the sidebar shows only its icons. */
  label?: JSX.Element;
}

export type AppShellGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AppShellGroupOwnProps>;

/** A section of the sidebar's content, usually a label and an AppShell.Menu, with an optional AppShell.GroupAction. */
export function AppShellGroup(props: AppShellGroupProps) {
  const others = omit(props, 'class', 'label', 'children');
  // Whether there's a label, without reading it: a JSX prop is read only where it's rendered.
  const withLabel = untrack(() => 'label' in props);
  const labelId = `slp-app-shell-group-${createUniqueId()}`;

  return (
    <div
      role="group"
      aria-labelledby={withLabel ? labelId : undefined}
      class={joinClass(['slp-app-shell-group', style.group], props.class)}
      {...others}
    >
      {withLabel && (
        <div id={labelId} data-slot="app-shell-group-label" class={style.groupLabel}>
          {props.label}
        </div>
      )}
      {props.children}
    </div>
  );
}

export interface AppShellActionOwnProps {
  /** Accessible name. Required: the icon alone says nothing to a screen reader. */
  label: string;
  /** The icon. */
  children?: JSX.Element;
}

export type AppShellGroupActionProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>, AppShellActionOwnProps>;

/** A small icon button at the end of a group's label, such as "Add project". Hidden while only icons show. */
export function AppShellGroupAction(props: AppShellGroupActionProps) {
  const others = omit(props, 'class', 'label');
  return (
    <button
      type="button"
      aria-label={props.label}
      class={joinClass(['slp-app-shell-group-action', style.action, style.groupAction], props.class)}
      {...others}
    />
  );
}

// --- Menus ------------------------------------------------------------------------------------------------------

export type AppShellMenuProps = ElementProps<JSX.HTMLAttributes<HTMLUListElement>>;

/** A list of AppShell.MenuItem rows. */
export function AppShellMenu(props: AppShellMenuProps) {
  const others = omit(props, 'class');
  return <ul class={joinClass(['slp-app-shell-menu', style.menu], props.class)} {...others} />;
}

export type AppShellMenuItemProps = ElementProps<JSX.LiHTMLAttributes<HTMLLIElement>>;

/** One row of a menu: an AppShell.MenuButton, optionally with an AppShell.MenuAction, AppShell.MenuBadge or AppShell.MenuSub. */
export function AppShellMenuItem(props: AppShellMenuItemProps) {
  const others = omit(props, 'class');
  return <li class={joinClass(['slp-app-shell-menu-item', style.menuItem], props.class)} {...others} />;
}

export interface AppShellMenuButtonOwnProps {
  /** An icon before the label: all that shows while the sidebar shows only its icons. */
  icon?: JSX.Element;
  /** The label. */
  children?: JSX.Element;
  /** Defaults to `md`. */
  size?: AppShellMenuButtonSize;
  /** Shown next to the row while the sidebar shows only its icons, usually the label again. */
  tooltip?: JSX.Element;
  /** Keeps the link from being followed, or the button from being pressed. */
  disabled?: boolean;
}

export type AppShellMenuButtonProps<T extends ValidComponent = 'a'> = PolymorphicProps<T, AppShellMenuButtonOwnProps>;

/**
 * The row itself: a link with `href`, else a button; `as` renders another link component. It's drawn highlighted while
 * it has `data-active`, which `@solidjs/router` sets on the links it manages to the current page. While the sidebar
 * shows only its icons, it's a square around its icon, with `tooltip` shown beside it.
 */
export function AppShellMenuButton<T extends ValidComponent = 'a'>(props: AppShellMenuButtonProps<T>) {
  return <MenuRow {...(props as unknown as Omit<MenuRowProps, 'part'>)} part="menu-button" />;
}

export interface AppShellMenuSubButtonOwnProps extends Omit<AppShellMenuButtonOwnProps, 'size' | 'tooltip'> {
  /** Defaults to `md` (1.75rem); `sm` is 1.5rem with smaller text. */
  size?: 'sm' | 'md';
}

export type AppShellMenuSubButtonProps<T extends ValidComponent = 'a'> = PolymorphicProps<T, AppShellMenuSubButtonOwnProps>;

/** A row of a nested menu: a link with `href`, else a button; `as` renders another link component. */
export function AppShellMenuSubButton<T extends ValidComponent = 'a'>(props: AppShellMenuSubButtonProps<T>) {
  return <MenuRow {...(props as unknown as Omit<MenuRowProps, 'part'>)} part="menu-sub-button" />;
}

type MenuRowProps = AppShellMenuButtonOwnProps &
  JSX.HTMLAttributes<HTMLElement> & { as?: ValidComponent; href?: string; part: 'menu-button' | 'menu-sub-button' };

function MenuRow(props: MenuRowProps) {
  const others = omit(props, 'ref', 'as', 'class', 'href', 'icon', 'children', 'size', 'tooltip', 'disabled', 'part', 'onClick');
  // Read once: each decides what renders, and reading one doesn't create its elements.
  const { part, withIcon, withTooltip, link } = untrack(() => ({
    part: props.part,
    withIcon: 'icon' in props,
    withTooltip: 'tooltip' in props,
    link: props.href !== undefined,
  }));
  const sidebar = useSidebar(`AppShell.${part === 'menu-button' ? 'MenuButton' : 'MenuSubButton'}`);
  const name = part === 'menu-button' ? style.menuButton : style.menuSubButton;

  const row = (target?: TooltipTargetAttributes) => (
    <Polymorphic
      {...others}
      {...(target ?? {})}
      ref={target ? [target.ref, untrack(() => props.ref)] : untrack(() => props.ref)}
      // A tooltip only shows, and describes the row, while the label is hidden.
      aria-describedby={target && sidebar.iconOnly() ? target['aria-describedby'] : others['aria-describedby']}
      as={props.as ?? (link ? 'a' : 'button')}
      type={!link && !props.as ? 'button' : undefined}
      href={props.disabled ? undefined : props.href}
      // A link that goes nowhere has no href, so it keeps the link role explicitly and says it's disabled.
      role={link && props.disabled ? 'link' : undefined}
      aria-disabled={link && props.disabled ? 'true' : undefined}
      disabled={!link && props.disabled ? true : undefined}
      data-disabled={props.disabled ? '' : undefined}
      data-size={props.size ?? 'md'}
      class={joinClass([`slp-app-shell-${part}`, style.row, name], props.class)}
      onClick={(event: MouseEvent) => {
        if (props.disabled) {
          event.preventDefault();
          return;
        }
        callHandler(props.onClick, event);
      }}
    >
      {withIcon && (
        <span data-slot={`app-shell-${part}-icon`} class={style.rowIcon}>
          {props.icon}
        </span>
      )}
      <span data-slot={`app-shell-${part}-label`} class={style.rowLabel}>
        {props.children}
      </span>
    </Polymorphic>
  );

  // oxlint-disable-next-line solid/components-return-once -- decided once, untracked, above
  if (!withTooltip) return row();
  return (
    <Tooltip
      label={props.tooltip}
      disabled={!sidebar.iconOnly()}
      position={sidebar.position() === 'left' ? 'right' : 'left'}
      offset={8}
    >
      {(target) => row(target)}
    </Tooltip>
  );
}

export interface AppShellMenuActionOwnProps extends AppShellActionOwnProps {
  /** Shows it only while the row is hovered or has focus inside. */
  showOnHover?: boolean;
}

export type AppShellMenuActionProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>, AppShellMenuActionOwnProps>;

/** A small icon button at the end of a row, such as one that opens the row's menu. Hidden while only icons show. */
export function AppShellMenuAction(props: AppShellMenuActionProps) {
  const others = omit(props, 'class', 'label', 'showOnHover');
  return (
    <button
      type="button"
      aria-label={props.label}
      data-show-on-hover={props.showOnHover ? '' : undefined}
      class={joinClass(['slp-app-shell-menu-action', style.action, style.menuAction], props.class)}
      {...others}
    />
  );
}

export type AppShellMenuBadgeProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>>;

/** A count or a short status at the end of a row. Hidden while only icons show. */
export function AppShellMenuBadge(props: AppShellMenuBadgeProps) {
  const others = omit(props, 'class');
  return <span class={joinClass(['slp-app-shell-menu-badge', style.menuBadge], props.class)} {...others} />;
}

/** A nested list of AppShell.MenuSubItem rows under a row, indented with a line. Hidden while only icons show. */
export function AppShellMenuSub(props: AppShellMenuProps) {
  const others = omit(props, 'class');
  return <ul class={joinClass(['slp-app-shell-menu-sub', style.menuSub], props.class)} {...others} />;
}

/** One row of a nested menu, holding an AppShell.MenuSubButton. */
export function AppShellMenuSubItem(props: AppShellMenuItemProps) {
  const others = omit(props, 'class');
  return <li class={joinClass(['slp-app-shell-menu-sub-item', style.menuSubItem], props.class)} {...others} />;
}

// --- Trigger, rail and main -------------------------------------------------------------------------------------

export interface AppShellTriggerOwnProps {
  /** Accessible name. Defaults to `'Toggle sidebar'`; the state is announced through `aria-expanded`. */
  label?: string;
  /** Visual style. Defaults to `ghost`. */
  variant?: ActionIconVariant;
  /** Color role. Without one the icon takes the color of the text around it. */
  color?: SlopColor;
  /** Defaults to `sm`. */
  size?: SlopSize;
  disabled?: boolean;
  /** Replaces the built-in icon. */
  children?: JSX.Element;
}

export type AppShellTriggerProps = ElementProps<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
  AppShellTriggerOwnProps
>;

/**
 * The button that toggles the sidebar: it collapses and expands it on a wide screen, and opens the drawer on a narrow
 * one. Put it anywhere inside the shell, usually at the start of the main area's header.
 */
export function AppShellTrigger(props: AppShellTriggerProps) {
  const shell = useShell('AppShell.Trigger');
  const others = omit(props, 'class', 'label', 'size', 'children', 'onClick');
  const withIcon = untrack(() => 'children' in props);
  const expanded = () => (shell.mobile() ? shell.mobileOpened() : shell.opened());

  return (
    <ActionIcon
      {...others}
      label={props.label ?? 'Toggle sidebar'}
      size={props.size ?? 'sm'}
      aria-expanded={expanded() ? 'true' : 'false'}
      aria-controls={shell.sidebarId}
      class={joinClass(['slp-app-shell-trigger'], props.class)}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (!event.defaultPrevented) shell.toggle();
      }}
    >
      {withIcon ? props.children : <SidebarIcon />}
    </ActionIcon>
  );
}

function SidebarIcon() {
  return (
    <svg
      data-slot="app-shell-trigger-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

export type AppShellRailProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/**
 * A thin strip along the sidebar's inner edge that toggles it when pressed, on a wide screen. It's for the pointer
 * only, hidden from assistive technology: the trigger and the shortcut do the same from the keyboard.
 */
export function AppShellRail(props: AppShellRailProps) {
  const shell = useShell('AppShell.Rail');
  const others = omit(props, 'class', 'onClick');
  return (
    <div
      aria-hidden="true"
      class={joinClass(['slp-app-shell-rail', style.rail], props.class)}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (!event.defaultPrevented) shell.setOpened(!shell.opened());
      }}
      {...others}
    />
  );
}

export type AppShellMainProps<T extends ValidComponent = 'main'> = PolymorphicProps<T>;

/**
 * The main area next to the sidebar: a `main` element, or another through `as`. With an `inset` sidebar, it's a
 * raised card on the sidebar's background.
 */
export function AppShellMain<T extends ValidComponent = 'main'>(props: AppShellMainProps<T>) {
  const own = props as JSX.HTMLAttributes<HTMLElement> & { as?: ValidComponent };
  const others = omit(own, 'as', 'class');
  return <Polymorphic {...others} as={own.as ?? 'main'} class={joinClass(['slp-app-shell-main', style.main], own.class)} />;
}

AppShell.Sidebar = AppShellSidebar;
AppShell.SidebarHeader = AppShellSidebarHeader;
AppShell.SidebarContent = AppShellSidebarContent;
AppShell.SidebarFooter = AppShellSidebarFooter;
AppShell.Group = AppShellGroup;
AppShell.GroupAction = AppShellGroupAction;
AppShell.Menu = AppShellMenu;
AppShell.MenuItem = AppShellMenuItem;
AppShell.MenuButton = AppShellMenuButton;
AppShell.MenuAction = AppShellMenuAction;
AppShell.MenuBadge = AppShellMenuBadge;
AppShell.MenuSub = AppShellMenuSub;
AppShell.MenuSubItem = AppShellMenuSubItem;
AppShell.MenuSubButton = AppShellMenuSubButton;
AppShell.Trigger = AppShellTrigger;
AppShell.Rail = AppShellRail;
AppShell.Main = AppShellMain;
