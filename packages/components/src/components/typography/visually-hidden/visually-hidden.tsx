import { omit, untrack } from 'solid-js';
import { type JSX, type ValidComponent } from '@solidjs/web';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import style from './visually-hidden.module.css';
import { joinClass } from '../../../style-props';

export interface VisuallyHiddenOwnProps {
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  children?: JSX.Element;
}

export type VisuallyHiddenProps<T extends ValidComponent = 'span'> = PolymorphicProps<T, VisuallyHiddenOwnProps>;

/**
 * Content that screen readers announce but the page doesn't show: a `span` by default, or any element with `as`.
 * It takes no space in the layout.
 */
export function VisuallyHidden<T extends ValidComponent = 'span'>(props: VisuallyHiddenProps<T>) {
  const className = () => joinClass(['slp-visually-hidden', style.hidden], props.class);

  // Without `as`, the element is a <span> rendered directly, so the compiler binds each attribute instead of going
  // through Polymorphic's spread. Read once, like `as` in Polymorphic.
  const isPolymorphic = untrack(
    () => (props as { as?: ValidComponent }).as !== undefined || !!(props as { dynamicAs?: boolean }).dynamicAs,
  );

  if (!isPolymorphic) {
    const others = omit(props as VisuallyHiddenOwnProps & { as?: unknown; dynamicAs?: boolean }, 'class', 'as', 'dynamicAs');
    // oxlint-disable-next-line solid/components-return-once -- the branch is decided once, untracked, above
    return <span class={className()} {...(others as JSX.HTMLAttributes<HTMLSpanElement>)} />;
  }

  // `as` and `dynamicAs` stay in: Polymorphic reads them.
  const others = omit(props as VisuallyHiddenOwnProps, 'class');
  return <Polymorphic<Record<string, unknown>> as="span" class={className()} {...others} />;
}
