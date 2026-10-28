import { createMemo, omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './background-image.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface BackgroundImageOwnProps {
  /** The image URL. */
  src: string;
}

export type BackgroundImageProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, BackgroundImageOwnProps>;

// A quoted CSS url(): quotes and backslashes in the URL are escaped, and line breaks, which a CSS string can't hold, dropped.
const cssUrl = (url: string) => `url("${url.replace(/[\\"]/g, '\\$&').replace(/[\n\r\f]/g, '')}")`;

/** A box with an image behind its content: a `div` whose background covers it. */
export function BackgroundImage(props: BackgroundImageProps) {
  const others = omit(props, 'class', 'style', 'src');

  // The URL can be anything, so it goes in a custom property; the stylesheet draws it, and a user's own
  // background-* styles still win.
  const styleValue = createMemo(() => ({ ...props.style, '--_background-image': cssUrl(props.src) }), {
    name: 'BackgroundImage.style',
  });

  return <div class={joinClass(['slp-background-image', style.backgroundImage], props.class)} style={styleValue()} {...others} />;
}
