import { omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './loader.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export type LoaderVariant = 'spinner' | 'dots' | 'bars';

export interface LoaderOwnProps {
  /** Shape of the animation. Defaults to `spinner`. */
  variant?: LoaderVariant;
  /** A fixed size. Without one, the loader is 1em: it scales with the text around it. */
  size?: SlopSize;
  /** Color role. Without one, the loader takes the current text color. */
  color?: SlopColor;
  /** The accessible name. Defaults to `Loading`. */
  label?: string;
}

export type LoaderProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, LoaderOwnProps>;

/** Shows that something is loading: a `span` with `role="status"`, animated as a spinner, dots or bars. */
export function Loader(props: LoaderProps) {
  const mergedProps = mergeDefaultProps({ variant: 'spinner' as LoaderVariant, label: 'Loading' }, props);
  const others = omit(mergedProps, 'class', 'variant', 'size', 'color', 'label');

  return (
    <span
      role="status"
      aria-label={mergedProps.label}
      data-variant={mergedProps.variant}
      data-size={mergedProps.size}
      data-color={mergedProps.color}
      class={joinClass(['slp-loader', style.loader], mergedProps.class)}
      {...others}
    >
      {/* The spinner is drawn by the root itself; dots and bars are three parts. */}
      <Show when={mergedProps.variant !== 'spinner'}>
        <span data-slot="loader-part" class={style.part} />
        <span data-slot="loader-part" class={style.part} />
        <span data-slot="loader-part" class={style.part} />
      </Show>
    </span>
  );
}
