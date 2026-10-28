import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './aspect-ratio.module.css';
import {
  ASPECT_RATIO_STYLE_PROPS,
  createStyleClasses,
  joinClass,
  type AspectRatioStyleProps,
  type StyleGroup,
} from '../../../style-props';
import type { ElementProps } from '../../../utils';

export type AspectRatioProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AspectRatioStyleProps>;

const ASPECT_RATIO_GROUPS: StyleGroup[] = ['aspectRatio'];

/**
 * Keeps its child at a width-to-height ratio, filling the available width. Images and videos are cropped to
 * fit (`object-fit: cover`).
 */
export function AspectRatio(props: AspectRatioProps) {
  const others = omit(props, 'class', ...ASPECT_RATIO_STYLE_PROPS);
  const styleClasses = createStyleClasses(props, ASPECT_RATIO_GROUPS, 'AspectRatio');

  return <div class={joinClass(['slp-aspect-ratio', style.aspectRatio, styleClasses()], props.class)} {...others} />;
}
