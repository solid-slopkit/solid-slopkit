import type { OverrideProps } from '../../utils';
import { omit, untrack } from 'solid-js';
import type { ValidComponent, ComponentProps } from '@solidjs/web';
import { dynamic, type JSX } from '@solidjs/web';

export type ElementOf<T> = T extends HTMLElement ? T : T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : any;

export interface PolymorphicAttributes<T extends ValidComponent> {
  as?: T | keyof JSX.HTMLElementTags;
  /**
   * Set when `as` changes after the first render, to swap the rendered element. By default `as` is read once,
   * which skips the per-instance computations that tracking it needs. Read once itself.
   */
  dynamicAs?: boolean;
}

/**
 * Props used by a polymorphic component.
 */
export type PolymorphicProps<T extends ValidComponent, Props extends {} = {}> = OverrideProps<
  ComponentProps<T>,
  Props & PolymorphicAttributes<T>
>;

/**
 * Helper type to get the exact props in Polymnorphic `as` callback.
 */
export type PolymorphicCallbackProps<CustomProps extends {}, Options extends {}, RenderProps extends {}> = Omit<
  CustomProps,
  keyof Options | keyof RenderProps
> &
  RenderProps;

export function Polymorphic<RenderProps>(props: RenderProps & PolymorphicAttributes<ValidComponent>): JSX.Element {
  const others = omit(props, 'as', 'dynamicAs');
  const Element = dynamic(() => props.as, { static: !untrack(() => props.dynamicAs) });

  return <Element {...others} />;
}
