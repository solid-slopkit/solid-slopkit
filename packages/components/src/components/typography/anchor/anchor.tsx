import { omit } from 'solid-js';
import { type ValidComponent } from '@solidjs/web';
import type { PolymorphicProps } from '../../polymorphic';
import style from './anchor.module.css';
import { joinClass } from '../../../style-props';
import { Text, type TextOwnProps } from '../text';

export type AnchorUnderline = 'always' | 'hover' | 'never';

export interface AnchorOwnProps extends Omit<TextOwnProps, 'inherit'> {
  /** When the link is underlined. Defaults to `always`, so links in text stay distinguishable without color. */
  underline?: AnchorUnderline;
}

export type AnchorProps<T extends ValidComponent = 'a'> = PolymorphicProps<T, AnchorOwnProps>;

/**
 * A link: Text rendered as an `a`, in the primary color. It takes the surrounding font size unless `size` is set.
 * `as` renders another link component, such as a router's.
 */
export function Anchor<T extends ValidComponent = 'a'>(props: AnchorProps<T>) {
  const others = omit(props as AnchorOwnProps & { as?: ValidComponent }, 'as', 'class', 'color', 'underline');

  return (
    <Text
      {...others}
      as={(props as { as?: ValidComponent }).as ?? 'a'}
      inherit={props.size === undefined}
      color={props.color ?? 'primary'}
      data-underline={props.underline ?? 'always'}
      class={joinClass(['slp-anchor', style.anchor], props.class)}
    />
  );
}
