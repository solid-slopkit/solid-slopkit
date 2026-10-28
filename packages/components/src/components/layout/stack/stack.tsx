import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { Flex } from '../flex';
import { joinClass, type FlexAlign, type FlexJustify, type SpacingValue } from '../../../style-props';
import type { ElementProps } from '../../../utils';

export interface StackOwnProps {
  /** Space between children, in spacing units. Default `4`. */
  gap?: SpacingValue;
  /** `align-items`. Default `'stretch'`. */
  align?: FlexAlign;
  /** `justify-content`. Default `'flex-start'`. */
  justify?: FlexJustify;
}

export type StackProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, StackOwnProps>;

/** Stacks children vertically: a column Flex with a gap. Its props are not responsive; for that, use Flex. */
export function Stack(props: StackProps) {
  const others = omit(props, 'class', 'gap', 'align', 'justify');

  return (
    <Flex
      class={joinClass(['slp-stack'], props.class)}
      direction="column"
      gap={props.gap ?? 4}
      align={props.align ?? 'stretch'}
      justify={props.justify ?? 'flex-start'}
      {...others}
    />
  );
}
