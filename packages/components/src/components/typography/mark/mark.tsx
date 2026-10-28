import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './mark.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface MarkOwnProps {
  /** Highlight color, from a color role. Defaults to `warning`. */
  color?: SlopColor;
}

export type MarkProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, MarkOwnProps>;

/** Highlighted text: a `mark`, tinted with a color role. */
export function Mark(props: MarkProps) {
  const mergedProps = mergeDefaultProps({ color: 'warning' as SlopColor }, props);
  const others = omit(mergedProps, 'class', 'color');

  return <mark data-color={mergedProps.color} class={joinClass(['slp-mark', style.mark], mergedProps.class)} {...others} />;
}
