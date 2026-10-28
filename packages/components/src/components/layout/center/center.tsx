import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { Flex } from '../flex';
import { joinClass } from '../../../style-props';
import type { ElementProps } from '../../../utils';

export type CenterProps = ElementProps<
  JSX.HTMLAttributes<HTMLDivElement>,
  {
    /** `inline-flex` rather than `flex`, to center inside a line of text or next to other inline content. */
    inline?: boolean;
  }
>;

/** Centers its content horizontally and vertically: a Flex with `align` and `justify` set to `center`. */
export function Center(props: CenterProps) {
  const others = omit(props, 'class', 'inline');

  return (
    <Flex
      class={joinClass(['slp-center'], props.class)}
      display={props.inline ? 'inline-flex' : 'flex'}
      align="center"
      justify="center"
      {...others}
    />
  );
}
