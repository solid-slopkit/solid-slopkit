import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './skeleton.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface SkeletonOwnProps {
  /** Shows the placeholder. With `false`, the children show as they are. Defaults to `true`. */
  visible?: boolean;
  /** Animates a shimmer across the placeholder. Defaults to `true`. */
  animate?: boolean;
  /** Rounds the placeholder into a circle, for an avatar or an icon. */
  circle?: boolean;
}

export type SkeletonProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, SkeletonOwnProps>;

/**
 * A placeholder for content that is loading: a `div`. Around children, it takes their size and hides them until
 * `visible` is false; without children, size it with `style`.
 */
export function Skeleton(props: SkeletonProps) {
  const mergedProps = mergeDefaultProps({ visible: true, animate: true }, props);
  const others = omit(mergedProps, 'class', 'visible', 'animate', 'circle');

  return (
    <div
      aria-hidden={mergedProps.visible ? 'true' : undefined}
      data-visible={mergedProps.visible ? '' : undefined}
      data-animate={mergedProps.visible && mergedProps.animate ? '' : undefined}
      data-circle={mergedProps.circle ? '' : undefined}
      class={joinClass(['slp-skeleton', style.skeleton], mergedProps.class)}
      {...others}
    />
  );
}
