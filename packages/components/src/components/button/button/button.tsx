import { createMemo, omit, untrack, type Accessor } from 'solid-js';
import { Polymorphic, type ElementOf, type PolymorphicProps } from '../../polymorphic';
import style from './button.module.css';
import { type JSX, type ValidComponent } from '@solidjs/web';
import { callHandler, mergeDefaultProps, mergeRefs } from '../../../utils';
import { createTagName } from '../../primitives';
import { joinClass } from '../../../style-props';
import { isButton } from './is-button';
import type { SlopColor, SlopSize } from '../../../core';

export interface ButtonRootOptions {}

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'dash' | 'ghost' | 'link';

export type ButtonShape = 'default' | 'square' | 'circle';

type ButtonRootCommonProps<T extends HTMLElement = HTMLElement> = {
  children?: JSX.Element;
  disabled?: boolean;
  type: string | undefined;
  ref: T | ((el: T) => void);
  tabIndex: number | string | undefined;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;

  /** Visual style. Defaults to `solid`. */
  variant?: ButtonVariant;

  /** Theme color. Without one the button uses the base colors. */
  color?: SlopColor;

  /** Defaults to `md`. */
  size?: SlopSize;

  /** `square` and `circle` make a fixed-width button for a single icon. */
  shape?: ButtonShape;

  /** Stretches the button to the width of its container. */
  fullWidth?: boolean;

  /** Forces the pressed look, e.g. for a toggled button. */
  active?: boolean;

  /** Shows a spinner over the content and disables the button. */
  loading?: boolean;

  /** Content before the label, usually an icon. */
  leftSection?: JSX.Element;

  /** Content after the label, usually an icon. */
  rightSection?: JSX.Element;
};

export interface ButtonRootRenderProps extends ButtonRootCommonProps {
  role: 'menuitem' | 'button' | undefined;
  'aria-disabled': 'true' | undefined;
  'aria-busy': 'true' | undefined;
  'data-disabled': string | undefined;
  onClick: (event: MouseEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp: (event: KeyboardEvent) => void;
}

export type ButtonRootProps<T extends ValidComponent | HTMLElement = HTMLElement> = ButtonRootOptions &
  Partial<ButtonRootCommonProps<ElementOf<T>>>;

// A section prop is read once, through a memo: a JSX prop is a getter that creates its element on every read,
// and a section is read both for its data attribute and as a child. Only buttons that pass the prop pay for it.
function createSection(props: object, key: 'leftSection' | 'rightSection'): Accessor<JSX.Element> | undefined {
  if (!untrack(() => key in props)) return undefined;
  return createMemo(() => (props as Record<string, JSX.Element>)[key], { name: `Button.${key}` });
}

// Marks a side with content, so the CSS can pull that side's padding in.
function sectionAttribute(section: Accessor<JSX.Element> | undefined): '' | undefined {
  const value = section?.();
  return value != null && value !== false ? '' : undefined;
}

export function Button<T extends ValidComponent = 'button'>(props: PolymorphicProps<T, ButtonRootProps<T>>) {
  let ref: HTMLElement | undefined;

  const mergedProps = mergeDefaultProps(
    { type: 'button', size: 'md', variant: 'solid', shape: 'default' },
    props as ButtonRootProps,
  );

  const others = omit(
    mergedProps,
    'ref',
    'type',
    'disabled',
    'class',
    'children',
    'leftSection',
    'rightSection',
    'loading',
    'size',
    'variant',
    'color',
    'shape',
    'fullWidth',
    'active',
  );

  // Without `as`, the element is a native <button>: rendered directly, so the compiler binds each attribute
  // instead of going through Polymorphic's spread, and the tag-name detection below is not needed. Read once,
  // like `as` in Polymorphic; `dynamicAs` keeps the polymorphic path for an `as` that appears later.
  const isPolymorphic = untrack(
    () => (props as { as?: ValidComponent }).as !== undefined || !!(props as { dynamicAs?: boolean }).dynamicAs,
  );

  const leftSection = createSection(props, 'leftSection');
  const rightSection = createSection(props, 'rightSection');

  if (!isPolymorphic) {
    // Loading blocks interaction like `disabled`, but keeps the button's own look.
    const disabled = createMemo(() => !!mergedProps.disabled || !!mergedProps.loading);

    // oxlint-disable-next-line solid/components-return-once -- the branch is decided once, untracked, above
    return (
      <button
        ref={mergedProps.ref as any}
        type={mergedProps.type as 'button' | 'submit' | 'reset' | undefined}
        disabled={disabled()}
        aria-busy={mergedProps.loading ? 'true' : undefined}
        data-disabled={mergedProps.disabled ? '' : undefined}
        data-loading={mergedProps.loading ? '' : undefined}
        data-pressed={mergedProps.active ? '' : undefined}
        data-full-width={mergedProps.fullWidth ? '' : undefined}
        data-size={mergedProps.size}
        data-color={mergedProps.color}
        data-variant={mergedProps.variant}
        data-shape={mergedProps.shape}
        data-with-left-section={sectionAttribute(leftSection)}
        data-with-right-section={sectionAttribute(rightSection)}
        class={joinClass(['slp-button', style.button], mergedProps.class)}
        {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {leftSection?.()}
        {mergedProps.children}
        {rightSection?.()}
      </button>
    );
  }

  const tagName = createTagName(
    () => ref,
    () => (props as { as?: ValidComponent }).as ?? 'button',
  );

  const isNativeButton = createMemo(() => {
    const elementTagName = tagName();
    if (!elementTagName) return false;
    return isButton({ tagName: elementTagName, type: mergedProps.type });
  });

  const isNativeInput = createMemo(() => tagName() === 'input');

  // Read from props, not the DOM, so it stays reactive and works during SSR.
  const isNativeLink = createMemo(() => tagName() === 'a' && (props as { href?: string }).href != null);

  const isNativeControl = createMemo(() => isNativeButton() || isNativeInput());

  // Loading blocks interaction like `disabled`, but keeps the button's own look.
  const isInert = createMemo(() => !!mergedProps.disabled || !!mergedProps.loading);

  const elementType = createMemo(() => (isNativeControl() ? mergedProps.type : undefined));

  // Kept in a memo rather than inline in the JSX: an inline ternary on a call compiles to a
  // lazily-created memo on the server, which shifts hydration keys against the client.
  const nativeDisabled = createMemo(() => (isNativeControl() ? isInert() : undefined));

  // An element that only has `role="button"` gets a button's keyboard behavior: Enter clicks on key down,
  // Space on key up. Disabled or loading, it ignores clicks, like a native button.
  const isRoleButton = createMemo(() => !isNativeButton() && !isNativeLink());
  const handlers = props as { onClick?: unknown; onKeyDown?: unknown; onKeyUp?: unknown };
  let spacePressed = false;
  const polymorphicOthers = omit(others as Record<string, unknown>, 'onClick', 'onKeyDown', 'onKeyUp');

  const onClick = (event: MouseEvent) => {
    if (!isNativeControl() && isInert()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    callHandler(handlers.onClick, event);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(handlers.onKeyDown, event);
    if (event.defaultPrevented || event.target !== event.currentTarget || !isRoleButton() || isInert()) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    } else if (event.key === ' ') {
      // Stops the page from scrolling; the click comes on key up.
      event.preventDefault();
      spacePressed = true;
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    callHandler(handlers.onKeyUp, event);
    if (event.key !== ' ' || !spacePressed) return;
    spacePressed = false;
    if (!event.defaultPrevented && isRoleButton() && !isInert()) (event.currentTarget as HTMLElement).click();
  };

  return (
    <Polymorphic<ButtonRootRenderProps>
      as="button"
      ref={mergeRefs((el) => (ref = el), mergedProps.ref as any)}
      type={elementType()}
      role={!isNativeButton() && !isNativeLink() ? 'button' : undefined}
      tabIndex={!isNativeButton() && !isNativeLink() && !isInert() ? 0 : undefined}
      disabled={nativeDisabled()}
      aria-disabled={!isNativeControl() && isInert() ? 'true' : undefined}
      aria-busy={mergedProps.loading ? 'true' : undefined}
      data-disabled={mergedProps.disabled ? '' : undefined}
      data-loading={mergedProps.loading ? '' : undefined}
      data-pressed={mergedProps.active ? '' : undefined}
      data-full-width={mergedProps.fullWidth ? '' : undefined}
      data-size={mergedProps.size}
      data-color={mergedProps.color}
      data-variant={mergedProps.variant}
      data-shape={mergedProps.shape}
      data-with-left-section={sectionAttribute(leftSection)}
      data-with-right-section={sectionAttribute(rightSection)}
      class={joinClass(['slp-button', style.button], mergedProps.class)}
      {...polymorphicOthers}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {leftSection?.()}
      {mergedProps.children}
      {rightSection?.()}
    </Polymorphic>
  );
}
