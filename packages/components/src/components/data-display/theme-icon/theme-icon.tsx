import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './theme-icon.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export type ThemeIconVariant = 'solid' | 'soft' | 'outline';

export interface ThemeIconOwnProps {
  /** Visual style. Defaults to `solid`. */
  variant?: ThemeIconVariant;
  /** Color role. Without one the box uses the base colors. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
}

export type ThemeIconProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, ThemeIconOwnProps>;

/** An icon in a colored box: a `span` that centers its child and sizes an SVG to fit. */
export function ThemeIcon(props: ThemeIconProps) {
  const mergedProps = mergeDefaultProps({ variant: 'solid' as ThemeIconVariant, size: 'md' as SlopSize }, props);
  const others = omit(mergedProps, 'class', 'variant', 'color', 'size');

  return (
    <span
      data-variant={mergedProps.variant}
      data-color={mergedProps.color}
      data-size={mergedProps.size}
      class={joinClass(['slp-theme-icon', style.themeIcon], mergedProps.class)}
      {...others}
    />
  );
}
