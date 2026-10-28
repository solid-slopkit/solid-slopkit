import {
  createContext,
  createProjection,
  createSignal,
  createUniqueId,
  flush,
  omit,
  onSettled,
  Show,
  untrack,
  useContext,
  type Accessor,
} from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './tabs.module.css';
import { createListNavigation } from '../../primitives';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export type TabsVariant = 'underline' | 'outline' | 'pills' | 'soft';

export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * When a tab is selected from the keyboard: `automatic` as the arrows reach it, `manual` only on Enter or Space.
 */
export type TabsActivation = 'automatic' | 'manual';

export interface TabsOwnProps {
  /** The selected tab's value, for controlled tabs; `null` for none. */
  value?: string | null;
  /** The tab selected at first, for uncontrolled tabs. Read once. */
  defaultValue?: string | null;
  /** Called with a tab's value when it's selected. */
  onChange?: (value: string) => void;
  /** Defaults to `underline`. */
  variant?: TabsVariant;
  /** The selected tab's color role. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** A row of tabs above the panels, or a column beside them. Defaults to `horizontal`. */
  orientation?: TabsOrientation;
  /** Defaults to `automatic`. */
  activation?: TabsActivation;
  /** Whether the arrows go from the last tab to the first, and back. Defaults to `true`. */
  loop?: boolean;
  /** Keeps the panels that aren't selected in the DOM, hidden, rather than rendering only the selected one. */
  keepMounted?: boolean;
}

export type TabsProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, TabsOwnProps>;

export interface TabsListOwnProps {
  /** Shares the list's width between the tabs. */
  grow?: boolean;
}

export type TabsListProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, TabsListOwnProps>;

export interface TabsTabOwnProps {
  /** The value it selects, and the panel it shows. */
  value: string;
  /** Content before the label, usually an icon. */
  leftSection?: JSX.Element;
  /** Content after the label, such as a count. */
  rightSection?: JSX.Element;
  disabled?: boolean;
}

export type TabsTabProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>, TabsTabOwnProps>;

export interface TabsPanelOwnProps {
  /** The tab it belongs to. */
  value: string;
  /** Keeps it in the DOM, hidden, while its tab isn't selected. Defaults to the Tabs' `keepMounted`. */
  keepMounted?: boolean;
}

export type TabsPanelProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, TabsPanelOwnProps>;

interface TabsContextValue {
  value: Accessor<string | null>;
  /** Whether this value is selected; only the tabs and panels whose answer changes re-run. */
  isSelected: (value: string) => boolean;
  select: (value: string) => void;
  orientation: () => TabsOrientation;
  activation: () => TabsActivation;
  loop: () => boolean;
  keepMounted: () => boolean;
  tabId: (value: string) => string;
  panelId: (value: string) => string;
  /** Whether a panel for this value is in the DOM, so a tab's `aria-controls` points at something. */
  hasPanel: (value: string) => boolean;
  registerPanel: (value: string) => () => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  return context;
}

// A value can hold any character; an id can't hold whitespace, and is easier to select without punctuation.
const idPart = (value: string) => value.replace(/[^\w-]/g, (char) => `_${char.codePointAt(0)!.toString(16)}`);

/** The row (or column) of tabs: a `tablist`. Name it with `aria-label` when the page has more than one. */
export function TabsList(props: TabsListProps) {
  const context = useTabs('Tabs.List');
  const others = omit(props, 'class', 'grow', 'onKeyDown');
  let list: HTMLDivElement | undefined;

  // The tabs in order: those whose nearest tablist is this one, so tabs nested in a panel don't count.
  const tabs = () =>
    [...(list?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])].filter(
      (tab) => tab.closest('[role="tablist"]') === list,
    );

  const navigation = createListNavigation({
    orientation: context.orientation,
    count: () => tabs().length,
    current: () => tabs().indexOf(document.activeElement as HTMLButtonElement),
    isDisabled: (index) => tabs()[index]?.disabled ?? true,
    loop: context.loop,
    onMove: (index) => {
      const tab = tabs()[index];
      tab.focus();
      if (context.activation() === 'automatic' && tab.dataset.value !== undefined) context.select(tab.dataset.value);
    },
  });

  return (
    <div
      ref={(element: HTMLDivElement) => (list = element)}
      role="tablist"
      aria-orientation={context.orientation()}
      data-grow={props.grow ? '' : undefined}
      data-slot="tabs-list"
      class={joinClass(['slp-tabs-list', style.list], props.class)}
      onKeyDown={(event: KeyboardEvent) => {
        callHandler(props.onKeyDown, event);
        // Only the keys pressed on a tab of this list, not in a field inside one of its tabs' sections.
        if ((event.target as Element).closest('[role="tablist"]') === list) navigation.onKeyDown(event);
      }}
      {...others}
    />
  );
}

/**
 * A tab: a `button` with the `tab` role that selects its value. The selected tab is the list's one tab stop; the
 * arrows move between the tabs.
 */
export function TabsTab(props: TabsTabProps) {
  const context = useTabs('Tabs.Tab');
  const others = omit(props, 'class', 'children', 'value', 'leftSection', 'rightSection', 'disabled', 'onClick');
  const selected = () => context.isSelected(props.value);
  // A JSX prop creates its elements each time it's read, so a section is read only where it's rendered.
  const hasLeft = untrack(() => 'leftSection' in props);
  const hasRight = untrack(() => 'rightSection' in props);

  return (
    <button
      type="button"
      role="tab"
      id={context.tabId(props.value)}
      aria-selected={selected() ? 'true' : 'false'}
      aria-controls={context.hasPanel(props.value) ? context.panelId(props.value) : undefined}
      // One tab stop: the selected tab. With none selected, every tab is one, so the list can still be reached.
      tabindex={selected() || context.value() === null ? 0 : -1}
      disabled={props.disabled}
      data-value={props.value}
      data-active={selected() ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined}
      data-slot="tabs-tab"
      class={joinClass(['slp-tabs-tab', style.tab], props.class)}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (!event.defaultPrevented && !props.disabled) context.select(props.value);
      }}
      {...others}
    >
      {hasLeft && (
        <span data-slot="tabs-tab-section" data-position="left" class={style.section}>
          {props.leftSection}
        </span>
      )}
      <span data-slot="tabs-tab-label">{props.children}</span>
      {hasRight && (
        <span data-slot="tabs-tab-section" data-position="right" class={style.section}>
          {props.rightSection}
        </span>
      )}
    </button>
  );
}

/** A tab's content: a `tabpanel` labelled by its tab, rendered while the tab is selected. */
export function TabsPanel(props: TabsPanelProps) {
  const context = useTabs('Tabs.Panel');
  const selected = () => context.isSelected(props.value);
  const keepMounted = () => props.keepMounted ?? context.keepMounted();
  return (
    <Show when={selected() || keepMounted()}>
      <TabsPanelElement {...props} />
    </Show>
  );
}

function TabsPanelElement(props: TabsPanelProps) {
  const context = useTabs('Tabs.Panel');
  const others = omit(props, 'class', 'value', 'keepMounted');
  const selected = () => context.isSelected(props.value);

  onSettled(() => context.registerPanel(untrack(() => props.value)));

  return (
    <div
      role="tabpanel"
      id={context.panelId(props.value)}
      aria-labelledby={context.tabId(props.value)}
      // Reachable with Tab even when it holds nothing focusable.
      tabindex={0}
      hidden={!selected()}
      data-value={props.value}
      data-slot="tabs-panel"
      class={joinClass(['slp-tabs-panel', style.panel], props.class)}
      {...others}
    />
  );
}

/**
 * Tabs that switch between panels of content: a Tabs.List of Tabs.Tab, and a Tabs.Panel for each tab's value. The
 * selected tab's panel shows; the others aren't rendered (or are hidden, with `keepMounted`). The arrows move
 * between the tabs and, by default, select them.
 */
export function Tabs(props: TabsProps) {
  const others = omit(
    props,
    'class',
    'value',
    'defaultValue',
    'onChange',
    'variant',
    'color',
    'size',
    'orientation',
    'activation',
    'loop',
    'keepMounted',
  );
  const baseId = `slp-tabs-${createUniqueId()}`;

  const [own, setOwn] = createSignal<string | null>(
    untrack(() => props.defaultValue ?? null),
    { name: 'Tabs.value' },
  );
  const value = () => (props.value !== undefined ? props.value : own());

  // The selected value as a set of one key: a change re-runs only what reads the old and the new key.
  let previous: string | null = null;
  const selection = createProjection<Record<string, true>>(
    (draft) => {
      const next = value();
      if (previous !== null) delete draft[previous];
      if (next !== null) draft[next] = true;
      previous = next;
    },
    {},
    { name: 'Tabs.selection' },
  );

  const [panels, setPanels] = createSignal<readonly string[]>([], { name: 'Tabs.panels' });

  const context: TabsContextValue = {
    value,
    isSelected: (tab) => selection[tab] === true,
    select: (next) => {
      if (next === value()) return;
      if (props.value === undefined) setOwn(next);
      props.onChange?.(next);
      flush();
    },
    orientation: () => props.orientation ?? 'horizontal',
    activation: () => props.activation ?? 'automatic',
    loop: () => props.loop ?? true,
    keepMounted: () => !!props.keepMounted,
    tabId: (tab) => `${baseId}-tab-${idPart(tab)}`,
    panelId: (tab) => `${baseId}-panel-${idPart(tab)}`,
    hasPanel: (tab) => panels().includes(tab),
    registerPanel: (tab) => {
      setPanels((list) => [...list, tab]);
      // Unregistered after disposal, which can't write signals.
      return () =>
        queueMicrotask(() => {
          setPanels((list) => {
            const index = list.indexOf(tab);
            return index === -1 ? list : [...list.slice(0, index), ...list.slice(index + 1)];
          });
          flush();
        });
    },
  };

  return (
    <TabsContext value={context}>
      <div
        data-variant={props.variant ?? 'underline'}
        data-color={props.color ?? 'primary'}
        data-size={props.size ?? 'md'}
        data-orientation={context.orientation()}
        class={joinClass(['slp-tabs', style.tabs], props.class)}
        {...others}
      />
    </TabsContext>
  );
}

Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
