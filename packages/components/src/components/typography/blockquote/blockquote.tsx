import { createMemo, omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './blockquote.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface BlockquoteOwnProps {
  /** Who said it, or where it's from. Shown below the quote, outside the `blockquote`. */
  attribution?: JSX.Element;
  /** URL of the source, set as the `blockquote`'s `cite` attribute. */
  cite?: string;
  /** Color of the bar on the start side, from a color role. Without one the bar is a muted text color. */
  color?: SlopColor;
}

export type BlockquoteProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, BlockquoteOwnProps>;

/** A quotation set off from the text: a `figure` with the `blockquote` and its attribution. */
export function Blockquote(props: BlockquoteProps) {
  const others = omit(props, 'class', 'children', 'attribution', 'cite', 'color');
  // Read once: a JSX prop is a getter that creates its elements on every read, and it's read for the check and as a child.
  const attribution = createMemo(() => props.attribution, { name: 'Blockquote.attribution' });

  return (
    <figure data-color={props.color} class={joinClass(['slp-blockquote', style.blockquote], props.class)} {...others}>
      <blockquote data-slot="blockquote-quote" cite={props.cite} class={style.quote}>
        {props.children}
      </blockquote>
      <Show when={attribution() != null && attribution() !== false}>
        <figcaption data-slot="blockquote-attribution" class={style.attribution}>
          {attribution()}
        </figcaption>
      </Show>
    </figure>
  );
}
