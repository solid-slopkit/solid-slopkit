import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { BOX_STYLE_PROPS, createStyleClasses, joinClass, type BoxStyleProps, type StyleGroup } from '../../../style-props';
import type { ElementProps } from '../../../utils';

export type BoxProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, BoxStyleProps>;

const BOX_GROUPS: StyleGroup[] = ['spacing', 'size', 'display'];

/** A `div` with spacing, size and display style props. */
export function Box(props: BoxProps) {
  const others = omit(props, 'class', ...BOX_STYLE_PROPS);
  const styleClasses = createStyleClasses(props, BOX_GROUPS, 'Box');

  return <div class={joinClass(['slp-box', styleClasses()], props.class)} {...others} />;
}
