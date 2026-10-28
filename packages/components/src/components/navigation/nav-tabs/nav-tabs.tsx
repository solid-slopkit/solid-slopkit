import { omit, untrack } from 'solid-js';
import type { JSX, ValidComponent } from '@solidjs/web';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import style from '../tabs/tabs.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';
import type { TabsOrientation, TabsVariant } from '../tabs';

export interface NavTabsOwnProps {
  /** Defaults to `underline`. */
  variant?: TabsVariant;
  /** The current link's color role. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** A row of links, or a column. Defaults to `horizontal`. */
  orientation?: TabsOrientation;
  /** Shares the row's width between the links. */
  grow?: boolean;
}

export type NavTabsProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, NavTabsOwnProps>;

export interface NavTabsLinkOwnProps {
  /** Content before the label, usually an icon. */
  leftSection?: JSX.Element;
  /** Content after the label, such as a count. */
  rightSection?: JSX.Element;
  /** Keeps the link from being followed. */
  disabled?: boolean;
}

export type NavTabsLinkProps<T extends ValidComponent = 'a'> = PolymorphicProps<T, NavTabsLinkOwnProps>;

/**
 * A link drawn as a tab. `as` renders another link component, such as a router's. It's drawn as the selected tab while
 * it has `data-active`, which `@solidjs/router` sets on the links it manages to the current page.
 */
export function NavTabsLink<T extends ValidComponent = 'a'>(props: NavTabsLinkProps<T>) {
  const own = props as NavTabsLinkOwnProps & JSX.HTMLAttributes<HTMLElement> & { as?: ValidComponent; href?: string };
  const others = omit(own, 'as', 'class', 'href', 'children', 'leftSection', 'rightSection', 'disabled', 'onClick');
  // A JSX prop creates its elements each time it's read, so a section is read only where it's rendered.
  const hasLeft = untrack(() => 'leftSection' in props);
  const hasRight = untrack(() => 'rightSection' in props);

  return (
    <Polymorphic
      {...others}
      as={own.as ?? 'a'}
      // A link that goes nowhere has no href, so it keeps the link role explicitly and says it's disabled.
      href={own.disabled ? undefined : own.href}
      role={own.disabled ? 'link' : undefined}
      aria-disabled={own.disabled ? 'true' : undefined}
      data-disabled={own.disabled ? '' : undefined}
      data-slot="nav-tabs-link"
      class={joinClass(['slp-nav-tabs-link', style.tab], own.class)}
      onClick={(event: MouseEvent) => {
        if (own.disabled) {
          event.preventDefault();
          return;
        }
        callHandler(own.onClick, event);
      }}
    >
      {hasLeft && (
        <span data-slot="nav-tabs-link-section" data-position="left" class={style.section}>
          {own.leftSection}
        </span>
      )}
      <span data-slot="nav-tabs-link-label">{own.children}</span>
      {hasRight && (
        <span data-slot="nav-tabs-link-section" data-position="right" class={style.section}>
          {own.rightSection}
        </span>
      )}
    </Polymorphic>
  );
}

/**
 * Navigation drawn as tabs: a `nav` of NavTabs.Link, the current page's link, as the router marks it, drawn as the
 * selected tab. The links are plain links, reached with Tab; the page they lead to is the content.
 */
export function NavTabs(props: NavTabsProps) {
  const others = omit(props, 'class', 'children', 'variant', 'color', 'size', 'orientation', 'grow');

  return (
    <nav
      data-variant={props.variant ?? 'underline'}
      data-color={props.color ?? 'primary'}
      data-size={props.size ?? 'md'}
      data-orientation={props.orientation ?? 'horizontal'}
      class={joinClass(['slp-nav-tabs', style.tabs], props.class)}
      {...others}
    >
      <div data-grow={props.grow ? '' : undefined} data-slot="nav-tabs-list" class={style.list}>
        {props.children}
      </div>
    </nav>
  );
}

NavTabs.Link = NavTabsLink;
