import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './badge.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export type BadgeVariant = 'solid' | 'soft' | 'outline' | 'dash';

export interface BadgeOwnProps {
  /** Visual style. Defaults to `solid`. */
  variant?: BadgeVariant;
  /** Color role. Without one the badge uses the base colors. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Round for a single character or digit; a longer count grows into a pill. */
  circle?: boolean;
  /** Content before the label, usually an icon. */
  leftSection?: JSX.Element;
  /** Content after the label, usually an icon. */
  rightSection?: JSX.Element;
}

export type BadgeProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, BadgeOwnProps>;

/** A short label for a status, a category or a count: a `span`. */
export function Badge(props: BadgeProps) {
  const mergedProps = mergeDefaultProps({ variant: 'solid' as BadgeVariant, size: 'md' as SlopSize }, props);
  const others = omit(mergedProps, 'class', 'children', 'variant', 'color', 'size', 'circle', 'leftSection', 'rightSection');

  return (
    <span
      data-variant={mergedProps.variant}
      data-color={mergedProps.color}
      data-size={mergedProps.size}
      data-circle={mergedProps.circle ? '' : undefined}
      class={joinClass(['slp-badge', style.badge], mergedProps.class)}
      {...others}
    >
      {mergedProps.leftSection}
      <span data-slot="badge-label" class={style.label}>
        {mergedProps.children}
      </span>
      {mergedProps.rightSection}
    </span>
  );
}
