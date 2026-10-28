import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './kbd.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

export interface KbdOwnProps {
  /** A fixed size from the type scale. Without one, the key scales with the text around it. */
  size?: SlopSize;
}

export type KbdProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, KbdOwnProps>;

/** A keyboard key: a `kbd`, drawn as a keycap. */
export function Kbd(props: KbdProps) {
  const others = omit(props, 'class', 'size');

  return <kbd data-size={props.size} class={joinClass(['slp-kbd', style.kbd], props.class)} {...others} />;
}
