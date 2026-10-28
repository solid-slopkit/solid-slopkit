import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './divider.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

export interface DividerOwnProps {
  /** `vertical` draws a line as tall as its row, for separating items in a Group or Flex. Defaults to `horizontal`. */
  orientation?: DividerOrientation;
  /** Line style. Defaults to `solid`. */
  variant?: DividerVariant;
  /** Line color, from a color role. Without one the line is a muted text color. */
  color?: SlopColor;
}

export type DividerProps = ElementProps<JSX.HTMLAttributes<HTMLHRElement>, DividerOwnProps>;

/** A thin line between content: an `hr`, horizontal or vertical. */
export function Divider(props: DividerProps) {
  const mergedProps = mergeDefaultProps(
    { orientation: 'horizontal' as DividerOrientation, variant: 'solid' as DividerVariant },
    props,
  );
  const others = omit(mergedProps, 'class', 'orientation', 'variant', 'color');

  return (
    <hr
      aria-orientation={mergedProps.orientation === 'vertical' ? 'vertical' : undefined}
      data-orientation={mergedProps.orientation}
      data-variant={mergedProps.variant}
      data-color={mergedProps.color}
      class={joinClass(['slp-divider', style.divider], mergedProps.class)}
      {...others}
    />
  );
}
