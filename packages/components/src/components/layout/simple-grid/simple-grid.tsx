import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import {
  SIMPLE_GRID_STYLE_PROPS,
  createStyleClasses,
  joinClass,
  type SimpleGridStyleProps,
  type StyleGroup,
} from '../../../style-props';
import type { ElementProps } from '../../../utils';

export type SimpleGridProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, SimpleGridStyleProps>;

const GRID_GROUPS: StyleGroup[] = ['simpleGrid'];

/** A `div` grid of equal-width columns: 1 column with a gap of 4 unless `cols` and `spacing` say otherwise. */
export function SimpleGrid(props: SimpleGridProps) {
  const others = omit(props, 'class', ...SIMPLE_GRID_STYLE_PROPS);
  const styleClasses = createStyleClasses(props, GRID_GROUPS, 'SimpleGrid');

  return <div class={joinClass(['slp-simple-grid', styleClasses()], props.class)} {...others} />;
}
