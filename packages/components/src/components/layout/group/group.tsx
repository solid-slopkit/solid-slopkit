import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './group.module.css';
import { Flex } from '../flex';
import { joinClass, type FlexAlign, type FlexJustify, type FlexWrap, type SpacingValue } from '../../../style-props';
import type { ElementProps } from '../../../utils';

export interface GroupOwnProps {
  /** Space between children, in spacing units. Default `4`. */
  gap?: SpacingValue;
  /** `align-items`. Default `'center'`. */
  align?: FlexAlign;
  /** `justify-content`. Default `'flex-start'`. */
  justify?: FlexJustify;
  /** `flex-wrap`. Default `'wrap'`. */
  wrap?: FlexWrap;
  /** Children grow to fill the row. */
  grow?: boolean;
  /** With `grow`, children share the row equally and their content cannot widen them. Default `true`. */
  preventGrowOverflow?: boolean;
}

export type GroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, GroupOwnProps>;

/** Lays children out in a row: a row Flex with a gap that wraps. Its props are not responsive; for that, use Flex. */
export function Group(props: GroupProps) {
  const others = omit(props, 'class', 'gap', 'align', 'justify', 'wrap', 'grow', 'preventGrowOverflow');

  return (
    <Flex
      class={joinClass(['slp-group', style.group], props.class)}
      gap={props.gap ?? 4}
      align={props.align ?? 'center'}
      justify={props.justify ?? 'flex-start'}
      wrap={props.wrap ?? 'wrap'}
      data-grow={props.grow ? '' : undefined}
      data-prevent-grow-overflow={props.preventGrowOverflow === false ? undefined : ''}
      {...others}
    />
  );
}
