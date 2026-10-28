import { createSignal, createUniqueId, flush, omit, untrack } from 'solid-js';
import { type JSX, type ValidComponent } from '@solidjs/web';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import style from './nav-link.module.css';
import { callHandler } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

/** How the current page's link is drawn: tinted with its color (`soft`) or filled with it (`solid`). */
export type NavLinkVariant = 'soft' | 'solid';

export interface NavLinkOwnProps {
  /** The link's text. */
  label?: JSX.Element;
  /** A second, smaller line under the label. */
  description?: JSX.Element;
  /** Content before the label, usually an icon. */
  leftSection?: JSX.Element;
  /** Content after the label, such as a count. */
  rightSection?: JSX.Element;
  /** Defaults to `soft`. */
  variant?: NavLinkVariant;
  /** The current page's link's color role. Defaults to `primary`. */
  color?: SlopColor;
  /** Keeps the link from being followed, or a parent from opening. */
  disabled?: boolean;
  /** Keeps the label and description on one line each, cut with an ellipsis. */
  noWrap?: boolean;
  /**
   * Nested NavLinks. With children, the NavLink is a `button` that shows and hides them instead of a link. Whether
   * it has children is read once.
   */
  children?: JSX.Element;
  /** Whether the children are shown, for a controlled parent. */
  opened?: boolean;
  /** Whether they're shown at first, for an uncontrolled one. Read once. */
  defaultOpened?: boolean;
  /** Called when a parent is pressed, with the state it asks for. */
  onChange?: (opened: boolean) => void;
  /** Replaces a parent's chevron, which turns as it opens unless `disableChevronRotation`. */
  chevron?: JSX.Element;
  /** Keeps the chevron as it is when the parent opens. */
  disableChevronRotation?: boolean;
}

export type NavLinkProps<T extends ValidComponent = 'a'> = PolymorphicProps<T, NavLinkOwnProps>;

/**
 * A link in a navigation list: a label, an optional description and sections. It's drawn in `color` while it has
 * `data-active`, which `@solidjs/router` sets on the links it manages to the current page. `as` renders another link
 * component. Given children, it's a `button` that shows and hides those nested NavLinks under it instead.
 */
export function NavLink<T extends ValidComponent = 'a'>(props: NavLinkProps<T>) {
  const own = props as NavLinkOwnProps & JSX.HTMLAttributes<HTMLElement> & { as?: ValidComponent; href?: string };
  const others = omit(
    own,
    'as',
    'class',
    'href',
    'label',
    'description',
    'leftSection',
    'rightSection',
    'variant',
    'color',
    'disabled',
    'noWrap',
    'children',
    'opened',
    'defaultOpened',
    'onChange',
    'chevron',
    'disableChevronRotation',
    'onClick',
  );
  // Each optional part is rendered only when passed: reading a JSX prop creates its elements.
  const has = untrack(() => ({
    children: 'children' in props,
    description: 'description' in props,
    leftSection: 'leftSection' in props,
    rightSection: 'rightSection' in props,
    chevron: 'chevron' in props,
  }));

  const content = () => (
    <>
      {has.leftSection && (
        <span data-slot="nav-link-left-section" class={style.section}>
          {own.leftSection}
        </span>
      )}
      <span data-slot="nav-link-body" class={style.body}>
        <span data-slot="nav-link-label" class={style.label}>
          {own.label}
        </span>
        {has.description && (
          <span data-slot="nav-link-description" class={style.description}>
            {own.description}
          </span>
        )}
      </span>
      {has.rightSection && (
        <span data-slot="nav-link-right-section" class={style.section}>
          {own.rightSection}
        </span>
      )}
    </>
  );

  const rootClass = () => joinClass(['slp-nav-link', style.navLink], own.class);

  if (!has.children) {
    // oxlint-disable-next-line solid/components-return-once -- the branch is decided once, untracked, above
    return (
      <Polymorphic
        {...others}
        as={own.as ?? 'a'}
        // A link that goes nowhere has no href, so it keeps the link role explicitly and says it's disabled.
        href={own.disabled ? undefined : own.href}
        role={own.disabled ? 'link' : undefined}
        aria-disabled={own.disabled ? 'true' : undefined}
        data-disabled={own.disabled ? '' : undefined}
        data-no-wrap={own.noWrap ? '' : undefined}
        data-variant={own.variant ?? 'soft'}
        data-color={own.color ?? 'primary'}
        class={rootClass()}
        onClick={(event: MouseEvent) => {
          if (own.disabled) {
            event.preventDefault();
            return;
          }
          callHandler(own.onClick, event);
        }}
      >
        {content()}
      </Polymorphic>
    );
  }

  const [ownOpened, setOwnOpened] = createSignal(
    untrack(() => !!own.defaultOpened),
    { name: 'NavLink.opened' },
  );
  const opened = () => own.opened ?? ownOpened();
  const childrenId = `slp-nav-link-${createUniqueId()}`;

  return (
    <>
      <button
        {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
        type="button"
        disabled={own.disabled}
        aria-expanded={opened() ? 'true' : 'false'}
        aria-controls={childrenId}
        data-opened={opened() ? '' : undefined}
        data-disabled={own.disabled ? '' : undefined}
        data-no-wrap={own.noWrap ? '' : undefined}
        data-variant={own.variant ?? 'soft'}
        data-color={own.color ?? 'primary'}
        data-rotate={own.disableChevronRotation ? undefined : ''}
        class={rootClass()}
        onClick={(event: MouseEvent) => {
          callHandler(own.onClick, event);
          if (event.defaultPrevented) return;
          const next = !opened();
          if (own.opened === undefined) setOwnOpened(next);
          own.onChange?.(next);
          flush();
        }}
      >
        {content()}
        <span data-slot="nav-link-chevron" aria-hidden="true" class={style.chevron}>
          {has.chevron ? own.chevron : <span class={style.defaultChevron} />}
        </span>
      </button>
      <div
        id={childrenId}
        data-opened={opened() ? '' : undefined}
        data-slot="nav-link-children"
        class={`slp-nav-link-children ${style.children}`}
      >
        <div data-slot="nav-link-children-body" class={style.childrenBody}>
          {own.children}
        </div>
      </div>
    </>
  );
}
