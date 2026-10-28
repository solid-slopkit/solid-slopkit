import { createMemo, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './overlay.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface OverlayOwnProps {
  /** Color role of the layer. Without one it's black. */
  color?: SlopColor;
  /** Opacity of the layer's color, from 0 to 1. Its children stay opaque. Defaults to 0.6. */
  backgroundOpacity?: number;
  /** Blurs what's behind it, in px. Defaults to 0. */
  blur?: number;
  /** Covers the viewport instead of its parent. */
  fixed?: boolean;
  /** Centers its children on it. */
  center?: boolean;
}

export type OverlayProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, OverlayOwnProps>;

/**
 * A layer over its parent, such as behind a loader or a message: a `div` that fills the nearest positioned ancestor
 * (give the parent `position: relative`), or the viewport with `fixed`. It takes the parent's rounded corners, and
 * catches the pointer, so what's under it can't be clicked.
 */
export function Overlay(props: OverlayProps) {
  const mergedProps = mergeDefaultProps({ backgroundOpacity: 0.6, blur: 0 }, props);
  const others = omit(mergedProps, 'class', 'style', 'color', 'backgroundOpacity', 'blur', 'fixed', 'center');

  // Any opacity or blur, so they go in custom properties rather than data-attribute selectors.
  const styleValue = createMemo(
    () => ({
      ...props.style,
      '--_overlay-opacity': `${mergedProps.backgroundOpacity * 100}%`,
      '--_overlay-blur': mergedProps.blur > 0 ? `${mergedProps.blur}px` : undefined,
    }),
    { name: 'Overlay.style' },
  );

  return (
    <div
      data-color={mergedProps.color}
      data-blur={mergedProps.blur > 0 ? '' : undefined}
      data-fixed={mergedProps.fixed ? '' : undefined}
      data-center={mergedProps.center ? '' : undefined}
      class={joinClass(['slp-overlay', style.overlay], mergedProps.class)}
      style={styleValue()}
      {...others}
    />
  );
}
