import { children, For, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './breadcrumbs.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface BreadcrumbsOwnProps {
  /** Shown between the items, hidden from screen readers. Defaults to `/`. */
  separator?: JSX.Element;
}

export type BreadcrumbsProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, BreadcrumbsOwnProps>;

/**
 * Where the current page sits in the site's hierarchy: a `nav` named `Breadcrumb` with each child in an ordered
 * list, a separator between them. Give the links as Anchors and the current page last, with `aria-current="page"`.
 */
export function Breadcrumbs(props: BreadcrumbsProps) {
  const others = omit(props, 'class', 'children', 'separator');
  const items = children(() => props.children);
  // A JSX prop creates its elements each time it's read: each separator reads it once, so each gets its own.
  const hasSeparator = untrack(() => 'separator' in props);

  return (
    <nav aria-label="Breadcrumb" class={joinClass(['slp-breadcrumbs', style.breadcrumbs], props.class)} {...others}>
      <ol data-slot="breadcrumbs-list" class={style.list}>
        <For each={items.toArray()}>
          {(item, index) => (
            <li data-slot="breadcrumbs-item" class={style.item}>
              {index() > 0 && (
                <span data-slot="breadcrumbs-separator" aria-hidden="true" class={style.separator}>
                  {hasSeparator ? props.separator : '/'}
                </span>
              )}
              {item}
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
}
