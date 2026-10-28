import { createContext, createMemo, omit, Show, untrack, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { Polymorphic } from '../../polymorphic';
import style from './list.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

export interface ListOwnProps {
  /** Renders a numbered `ol` instead of a `ul`. */
  ordered?: boolean;
  /** Font size and line height from the type scale. Without one, the list inherits them. */
  size?: SlopSize;
  /** Space between items. Without one, items sit on consecutive lines. */
  spacing?: SlopSize;
  /** Replaces the markers of every item, usually with an icon. A List.Item's own `icon` wins. */
  icon?: JSX.Element;
}

export interface ListItemOwnProps {
  /** Replaces this item's marker, usually with an icon. */
  icon?: JSX.Element;
}

export type ListProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, ListOwnProps> & {
  /** Native `ol` attributes, for an ordered list. */
  start?: number;
  reversed?: boolean;
  type?: '1' | 'a' | 'A' | 'i' | 'I';
};
export type ListItemProps = ElementProps<JSX.LiHTMLAttributes<HTMLLIElement>, ListItemOwnProps>;

interface ListContextValue {
  // A getter: each read creates the list's icon anew, so every item gets its own element.
  icon: () => JSX.Element;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

const hasContent = (value: JSX.Element) => value != null && value !== false;

/** A list item: an `li`, with an optional icon in place of its marker. */
export function ListItem(props: ListItemProps) {
  const list = useContext(ListContext);
  const others = omit(props, 'class', 'children', 'icon');
  // Read once: a JSX prop is a getter that creates its elements on every read.
  const icon = createMemo(() => ('icon' in props ? props.icon : list?.icon()), { name: 'List.Item.icon' });
  const withIcon = () => hasContent(icon());

  return (
    <li data-with-icon={withIcon() ? '' : undefined} class={joinClass(['slp-list-item', style.item], props.class)} {...others}>
      <Show when={withIcon()} fallback={props.children}>
        <span data-slot="list-item-icon" class={style.icon}>
          {icon()}
        </span>
        <div data-slot="list-item-content" class={style.content}>
          {props.children}
        </div>
      </Show>
    </li>
  );
}

/** A list of items: a `ul`, or an `ol` with `ordered`. Its children are List.Item. */
export function List(props: ListProps) {
  const others = omit(props, 'class', 'children', 'ordered', 'size', 'spacing', 'icon');
  const context: ListContextValue = { icon: () => props.icon };

  return (
    <ListContext value={context}>
      <Polymorphic<JSX.HTMLAttributes<HTMLElement>>
        // `ordered` picks the element once, like `as` on other components.
        as={untrack(() => (props.ordered ? 'ol' : 'ul'))}
        data-size={props.size}
        data-spacing={props.spacing}
        class={joinClass(['slp-list', style.list], props.class)}
        {...others}
      >
        {props.children}
      </Polymorphic>
    </ListContext>
  );
}

List.Item = ListItem;
