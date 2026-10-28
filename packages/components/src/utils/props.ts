import { type ComponentProps, type ValidComponent, merge } from 'solid-js';
import type { JSX } from '@solidjs/web';

/**
 * Allows for extending a set of props (`Source`) by an overriding set of props (`Override`),
 * ensuring that any duplicates are overridden by the overriding set of props.
 */
export type OverrideProps<Source = {}, Override = {}> = Omit<Source, keyof Override> & Override;

/**
 * Allows for extending a set of `ComponentProps` by an overriding set of props,
 * ensuring that any duplicates are overridden by the overriding set of props.
 */
export type OverrideComponentProps<T extends ValidComponent, P> = OverrideProps<ComponentProps<T>, P>;

export function mergeDefaultProps<T extends {}, D extends Partial<T>>(defaultProps: D, props: T): OverrideProps<T, D> {
  return merge(defaultProps, props) as OverrideProps<T, D>;
}

/**
 * An element's attributes, minus the component's own props, with `style` as an object only. An object lets Solid
 * update one property at a time and lets a component add its own properties to the user's; a CSS string can only
 * be replaced whole.
 */
export type ElementProps<Attributes, Own = {}> = Omit<Attributes, keyof Own | 'style'> & Own & { style?: JSX.CSSProperties };
