import { omit } from 'solid-js';
import { dynamic, type JSX } from '@solidjs/web';
import style from './title.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';
import type { TextAlign, TextWeight } from '../text';

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;

export type TitleSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TitleOwnProps {
  /** Heading level: renders `h1` to `h6`, and looks like that level unless `size` says otherwise. Defaults to `1`. */
  order?: TitleOrder;
  /** The look of another level, without changing the element, e.g. an `h2` that looks like an `h4`. */
  size?: TitleSize;
  /** Text color, from a color role. Without one the heading keeps the color it inherits. */
  color?: SlopColor;
  /** Mutes the heading. Works with or without `color`. */
  dimmed?: boolean;
  /** Font weight. Defaults to `--slp-heading-weight`. */
  weight?: TextWeight;
  /** `text-align`. Without one the alignment is inherited. */
  align?: TextAlign;
}

export type TitleProps = ElementProps<JSX.HTMLAttributes<HTMLHeadingElement>, TitleOwnProps>;

/** A heading, `h1` to `h6`, sized from the heading scale. */
export function Title(props: TitleProps) {
  const mergedProps = mergeDefaultProps({ order: 1 as TitleOrder }, props);
  const others = omit(mergedProps, 'class', 'order', 'size', 'color', 'dimmed', 'weight', 'align');
  const Heading = dynamic(() => `h${mergedProps.order}` as const);

  return (
    <Heading
      data-order={mergedProps.order}
      data-size={mergedProps.size ?? `h${mergedProps.order}`}
      data-color={mergedProps.color}
      data-dimmed={mergedProps.dimmed ? '' : undefined}
      data-weight={mergedProps.weight}
      data-align={mergedProps.align}
      class={joinClass(['slp-title', style.title], mergedProps.class)}
      {...others}
    />
  );
}
