import { createContext, createMemo, createProjection, createSignal, flush, For, omit, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './tree.module.css';
import { createListNavigation, createTypeahead } from '../../primitives';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface TreeNodeData {
  /** Names the node: what `expanded` and `selected` hold. Unique in the whole tree. */
  value: string;
  /** What the node shows. */
  label: JSX.Element;
  /** The nodes under it. */
  children?: readonly TreeNodeData[];
}

/** What `renderNode` gets for each node. The state is read through getters, so it stays current. */
export interface TreeRenderNodePayload {
  node: TreeNodeData;
  /** 1 for the top level. */
  level: number;
  readonly expanded: boolean;
  readonly selected: boolean;
  hasChildren: boolean;
}

interface TreeSharedProps {
  /** The nodes at the top level. */
  data: readonly TreeNodeData[];
  /** The expanded nodes' values, for a controlled tree. */
  expanded?: readonly string[];
  /** The nodes expanded at first, for an uncontrolled one. Read once. */
  defaultExpanded?: readonly string[];
  /** Called with the expanded nodes' values. */
  onExpandedChange?: (expanded: string[]) => void;
  /** Replaces each node's label, e.g. to add an icon. */
  renderNode?: (payload: TreeRenderNodePayload) => JSX.Element;
  /** The selected nodes' color role. Defaults to `primary`. */
  color?: SlopColor;
}

interface TreeSingleProps {
  /** Lets several nodes be selected at once. Read once. */
  multiple?: false;
  /** The selected node's value, for a controlled selection; `null` for none. */
  selected?: string | null;
  /** The node selected at first, for an uncontrolled one. Read once. */
  defaultSelected?: string | null;
  /** Called with the selected node's value. */
  onSelectedChange?: (selected: string | null) => void;
}

interface TreeMultipleProps {
  multiple: true;
  /** The selected nodes' values, for a controlled selection. */
  selected?: readonly string[];
  /** The nodes selected at first, for an uncontrolled one. Read once. */
  defaultSelected?: readonly string[];
  /** Called with the selected nodes' values. */
  onSelectedChange?: (selected: string[]) => void;
}

export type TreeOwnProps = TreeSharedProps & (TreeSingleProps | TreeMultipleProps);

export type TreeProps = ElementProps<JSX.HTMLAttributes<HTMLUListElement>, TreeOwnProps>;

interface TreeContextValue {
  isExpanded: (value: string) => boolean;
  isSelected: (value: string) => boolean;
  isTabbable: (value: string) => boolean;
  activate: (value: string) => void;
  renderNode: () => TreeSharedProps['renderNode'];
}

const TreeContext = createContext<TreeContextValue | null>(null);

/** Keeps a projection keyed by value in step with a list of values: a change re-runs only the keys that changed. */
function createKeySet(values: () => readonly string[], name: string) {
  let previous: readonly string[] = [];
  return createProjection<Record<string, true>>(
    (draft) => {
      const next = values();
      for (const value of previous) if (!next.includes(value)) delete draft[value];
      for (const value of next) draft[value] = true;
      previous = next;
    },
    {},
    { name },
  );
}

const toList = (value: string | null | readonly string[] | undefined): readonly string[] =>
  value == null ? [] : typeof value === 'string' ? [value] : value;

function TreeNodes(props: { nodes: readonly TreeNodeData[]; level: number }) {
  return (
    <For each={props.nodes}>
      {(node, index) => <TreeItem node={node} level={props.level} position={index() + 1} size={props.nodes.length} />}
    </For>
  );
}

function TreeItem(props: { node: TreeNodeData; level: number; position: number; size: number }) {
  const context = useContext(TreeContext)!;
  const value = () => props.node.value;
  const hasChildren = () => (props.node.children?.length ?? 0) > 0;
  const expanded = () => hasChildren() && context.isExpanded(value());
  const selected = () => context.isSelected(value());

  return (
    <li
      role="treeitem"
      aria-level={props.level}
      aria-setsize={props.size}
      aria-posinset={props.position}
      aria-expanded={hasChildren() ? (expanded() ? 'true' : 'false') : undefined}
      aria-selected={selected() ? 'true' : 'false'}
      tabindex={context.isTabbable(value()) ? 0 : -1}
      data-value={value()}
      data-expanded={expanded() ? '' : undefined}
      data-selected={selected() ? '' : undefined}
      data-slot="tree-item"
      class={style.item}
    >
      <div
        data-slot="tree-node"
        class={style.node}
        style={{ '--_tree-level': String(props.level - 1) }}
        onClick={() => context.activate(value())}
      >
        <span data-slot="tree-chevron" aria-hidden="true" class={style.chevron}>
          {hasChildren() && <span class={style.defaultChevron} />}
        </span>
        <span data-slot="tree-label" class={style.label}>
          {context.renderNode()
            ? context.renderNode()!({
                node: props.node,
                level: props.level,
                get expanded() {
                  return expanded();
                },
                get selected() {
                  return selected();
                },
                hasChildren: hasChildren(),
              })
            : props.node.label}
        </span>
      </div>
      <Show when={expanded()}>
        <ul role="group" data-slot="tree-group" class={style.group}>
          <TreeNodes nodes={props.node.children!} level={props.level + 1} />
        </ul>
      </Show>
    </li>
  );
}

/**
 * A hierarchy of nodes, such as files in folders, from `data`. Nodes with children expand and collapse; a node is
 * selected by a click, Enter or Space, and several with `multiple`. One tab stop: the arrows move through the
 * visible nodes, Right and Left expand, collapse and move between levels, and typing jumps to a node by its label.
 */
export function Tree(props: TreeProps) {
  const others = omit(
    props as TreeSharedProps & TreeSingleProps & JSX.HTMLAttributes<HTMLUListElement>,
    'class',
    'data',
    'expanded',
    'defaultExpanded',
    'onExpandedChange',
    'multiple',
    'selected',
    'defaultSelected',
    'onSelectedChange',
    'renderNode',
    'color',
    'onKeyDown',
    'onFocusIn',
  );
  const multiple = untrack(() => !!props.multiple);
  let root: HTMLUListElement | undefined;

  const [ownExpanded, setOwnExpanded] = createSignal<readonly string[]>(
    untrack(() => props.defaultExpanded ?? []),
    { name: 'Tree.expanded' },
  );
  const expandedValues = () => props.expanded ?? ownExpanded();
  const [ownSelected, setOwnSelected] = createSignal<readonly string[]>(
    untrack(() => toList(props.defaultSelected)),
    { name: 'Tree.selected' },
  );
  const selectedValues = () => (props.selected !== undefined ? toList(props.selected) : ownSelected());

  // Each node's parent and whether it has children, to know which nodes are visible.
  const nodes = createMemo(
    () => {
      const parents = new Map<string, string | null>();
      const branches = new Set<string>();
      const walk = (list: readonly TreeNodeData[], parent: string | null) => {
        for (const node of list) {
          parents.set(node.value, parent);
          if (node.children?.length) {
            branches.add(node.value);
            walk(node.children, node.value);
          }
        }
      };
      walk(props.data, null);
      return { parents, branches };
    },
    { name: 'Tree.nodes' },
  );

  const expandedSet = createKeySet(expandedValues, 'Tree.expandedSet');
  const selectedSet = createKeySet(selectedValues, 'Tree.selectedSet');

  const isVisible = (value: string) => {
    const { parents } = nodes();
    if (!parents.has(value)) return false;
    for (let parent = parents.get(value); parent != null; parent = parents.get(parent)) {
      if (!expandedSet[parent]) return false;
    }
    return true;
  };

  // The one node in the tab order: the one last focused while it's visible, else the first visible selected one,
  // else the first node.
  const [focused, setFocused] = createSignal<string | null>(null, { name: 'Tree.focused' });
  const tabbable = createMemo(
    () => {
      const current = focused();
      if (current != null && isVisible(current)) return [current];
      const selected = selectedValues().find(isVisible);
      if (selected != null) return [selected];
      const first = props.data[0]?.value;
      return first == null ? [] : [first];
    },
    { name: 'Tree.tabbable' },
  );
  const tabbableSet = createKeySet(tabbable, 'Tree.tabbableSet');

  const setExpanded = (next: string[]) => {
    if (props.expanded === undefined) setOwnExpanded(next);
    props.onExpandedChange?.(next);
    flush();
  };
  const setExpandedOne = (value: string, open: boolean) => {
    const current = expandedValues();
    if (current.includes(value) === open) return;
    setExpanded(open ? [...current, value] : current.filter((other) => other !== value));
  };

  const select = (value: string) => {
    const current = selectedValues();
    const next = multiple
      ? current.includes(value)
        ? current.filter((other) => other !== value)
        : [...current, value]
      : [value];
    if (!multiple && current.length === 1 && current[0] === value) return;
    if (props.selected === undefined) setOwnSelected(next);
    if (multiple) (props.onSelectedChange as ((selected: string[]) => void) | undefined)?.(next);
    else (props.onSelectedChange as ((selected: string | null) => void) | undefined)?.(value);
    flush();
  };

  /** A click, Enter or Space: selects the node, and expands or collapses one with children. */
  const activate = (value: string) => {
    select(value);
    if (nodes().branches.has(value)) setExpandedOne(value, !expandedValues().includes(value));
  };

  // The rendered items are exactly the visible nodes, in order.
  const items = () => [...(root?.querySelectorAll<HTMLLIElement>('[role="treeitem"]') ?? [])];
  const currentIndex = () => items().indexOf(document.activeElement as HTMLLIElement);
  const focusItem = (item: HTMLElement | null | undefined) => {
    if (!item) return;
    item.focus();
    setFocused(item.dataset.value ?? null);
    flush();
  };

  const navigation = createListNavigation({
    orientation: () => 'vertical',
    count: () => items().length,
    current: currentIndex,
    loop: () => false,
    onMove: (index) => focusItem(items()[index]),
  });

  const typeahead = createTypeahead({
    count: () => items().length,
    current: currentIndex,
    getLabel: (index) => items()[index]?.querySelector(':scope > [data-slot="tree-node"]')?.textContent ?? '',
    onMatch: (index) => focusItem(items()[index]),
  });

  const onKeyDown = (event: KeyboardEvent) => {
    const item = (event.target as Element).closest<HTMLLIElement>('[role="treeitem"]');
    if (!item || event.target !== item || event.altKey || event.ctrlKey || event.metaKey) return;
    const value = item.dataset.value!;
    const isBranch = nodes().branches.has(value);
    const isExpanded = expandedValues().includes(value);

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (!isBranch) return;
        if (!isExpanded) setExpandedOne(value, true);
        else focusItem(item.querySelector<HTMLLIElement>(':scope > [role="group"] > [role="treeitem"]'));
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (isBranch && isExpanded) setExpandedOne(value, false);
        else focusItem(item.parentElement?.closest<HTMLLIElement>('[role="treeitem"]'));
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(value);
        return;
      case '*': {
        event.preventDefault();
        const { parents, branches } = nodes();
        const parent = parents.get(value);
        const siblings = [...parents].filter(([other, otherParent]) => otherParent === parent && branches.has(other));
        const current = expandedValues();
        const added = siblings.map(([other]) => other).filter((other) => !current.includes(other));
        if (added.length) setExpanded([...current, ...added]);
        return;
      }
    }
    navigation.onKeyDown(event);
    typeahead.onKeyDown(event);
  };

  const context: TreeContextValue = {
    isExpanded: (value) => expandedSet[value] === true,
    isSelected: (value) => selectedSet[value] === true,
    isTabbable: (value) => tabbableSet[value] === true,
    activate,
    renderNode: () => props.renderNode,
  };

  return (
    <TreeContext value={context}>
      <ul
        ref={(element: HTMLUListElement) => (root = element)}
        role="tree"
        aria-multiselectable={multiple ? 'true' : undefined}
        data-color={props.color ?? 'primary'}
        class={joinClass(['slp-tree', style.tree], props.class)}
        onKeyDown={(event: KeyboardEvent) => {
          callHandler(props.onKeyDown, event);
          if (!event.defaultPrevented) onKeyDown(event);
        }}
        onFocusIn={(event: FocusEvent) => {
          callHandler(props.onFocusIn, event);
          const item = (event.target as HTMLElement).closest<HTMLLIElement>('[role="treeitem"]');
          if (item && item === event.target && item.dataset.value !== focused()) {
            setFocused(item.dataset.value ?? null);
            flush();
          }
        }}
        {...others}
      >
        <TreeNodes nodes={props.data} level={1} />
      </ul>
    </TreeContext>
  );
}
