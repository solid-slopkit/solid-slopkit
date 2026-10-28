import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './paper.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

export type PaperPadding = 'none' | SlopSize;
export type PaperShadow = 'none' | SlopSize;
export type PaperSurface = 'base-100' | 'base-200' | 'base-300';
export type PaperRadius = 'default' | 'none';

export interface PaperOwnProps {
  /** Inner padding: `none`, or `xs` to `xl` (0.5 to 2rem). Defaults to `md` (1rem). */
  padding?: PaperPadding;
  /** Drop shadow, from the `--slp-shadow-*` scale. Defaults to `none`. */
  shadow?: PaperShadow;
  /** A thin border around the surface. */
  withBorder?: boolean;
  /** Background, from the base colors. Defaults to `base-100`. */
  surface?: PaperSurface;
  /** Corner radius: `default` (1rem) or `none`. Defaults to `default`. */
  radius?: PaperRadius;
}

export type PaperProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, PaperOwnProps>;

/** A surface that groups content: a `div` with a background, padding, radius, and optionally a border and shadow. */
export function Paper(props: PaperProps) {
  const mergedProps = mergeDefaultProps(
    { padding: 'md', shadow: 'none', surface: 'base-100', radius: 'default' } as const,
    props,
  );
  const others = omit(mergedProps, 'class', 'padding', 'shadow', 'withBorder', 'surface', 'radius');

  return (
    <div
      data-padding={mergedProps.padding}
      data-shadow={mergedProps.shadow}
      data-surface={mergedProps.surface}
      data-radius={mergedProps.radius}
      data-with-border={mergedProps.withBorder ? '' : undefined}
      class={joinClass(['slp-paper', style.paper], mergedProps.class)}
      {...others}
    />
  );
}
