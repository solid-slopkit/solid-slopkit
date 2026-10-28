import { createMemo, omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './color-swatch.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

export interface ColorSwatchOwnProps {
  /** The color to show: any CSS color, such as `#7048e8`, `rgb(0 0 0 / 50%)` or `var(--slp-color-primary)`. */
  value: string;
  /** Defaults to `md`. */
  size?: SlopSize;
}

export type ColorSwatchProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, ColorSwatchOwnProps>;

/** A sample of a color: a round `span` filled with it, over a checkerboard that shows transparency. */
export function ColorSwatch(props: ColorSwatchProps) {
  const mergedProps = mergeDefaultProps({ size: 'md' as SlopSize }, props);
  const others = omit(mergedProps, 'class', 'style', 'value', 'size');

  // The value can be any color, so it goes in a custom property rather than a data-attribute selector.
  const styleValue = createMemo(() => ({ ...props.style, '--_swatch-color': props.value }), {
    name: 'ColorSwatch.style',
  });

  return (
    <span
      data-size={mergedProps.size}
      class={joinClass(['slp-color-swatch', style.swatch], mergedProps.class)}
      style={styleValue()}
      {...others}
    />
  );
}
