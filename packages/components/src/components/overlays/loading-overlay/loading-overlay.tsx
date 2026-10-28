import { omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './loading-overlay.module.css';
import { Overlay } from '../overlay';
import { Loader, type LoaderVariant } from '../../feedback/loader';
import { Transition } from '../../utilities/transition';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export interface LoadingOverlayOwnProps {
  /** Whether it's shown. It fades in and out. */
  visible: boolean;
  /** The loader's accessible name, announced when it appears. Defaults to `'Loading'`. */
  label?: string;
  /** Shape of the loader. Defaults to `spinner`. */
  loaderVariant?: LoaderVariant;
  /** Size of the loader. Defaults to `md`. */
  loaderSize?: SlopSize;
  /** Color role of the loader. Defaults to `primary`. */
  loaderColor?: SlopColor;
  /** Replaces the loader, e.g. with a message; it's centered on the layer. */
  loader?: JSX.Element;
  /** Opacity of the layer's color, from 0 to 1. Defaults to 0.7. */
  backgroundOpacity?: number;
  /** Blurs what's behind it, in px. Defaults to 2. */
  blur?: number;
  /** Duration of the fade, in milliseconds. Defaults to 150. */
  transitionDuration?: number;
}

export type LoadingOverlayProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, LoadingOverlayOwnProps>;

/**
 * Covers its parent while something in it loads: an Overlay in the base surface color, with a Loader centered on it,
 * that fades in and out with `visible`. Like Overlay, it fills the nearest positioned ancestor (give the parent
 * `position: relative`) and catches the pointer.
 */
export function LoadingOverlay(props: LoadingOverlayProps) {
  const others = omit(
    props,
    'ref',
    'class',
    'visible',
    'label',
    'loaderVariant',
    'loaderSize',
    'loaderColor',
    'loader',
    'backgroundOpacity',
    'blur',
    'transitionDuration',
  );
  // Whether a loader is passed, without reading it: a JSX prop is read only where it's rendered.
  const withLoader = untrack(() => 'loader' in props);

  return (
    <Transition mounted={props.visible} transition="fade" duration={props.transitionDuration ?? 150}>
      {(transition) => (
        <Overlay
          {...others}
          {...transition}
          ref={[transition.ref, untrack(() => props.ref)]}
          backgroundOpacity={props.backgroundOpacity ?? 0.7}
          blur={props.blur ?? 2}
          center
          class={joinClass(['slp-loading-overlay', style.overlay, transition.class], props.class)}
          style={{ ...transition.style, ...props.style }}
        >
          {withLoader ? (
            props.loader
          ) : (
            <Loader
              label={props.label ?? 'Loading'}
              variant={props.loaderVariant ?? 'spinner'}
              size={props.loaderSize ?? 'md'}
              color={props.loaderColor ?? 'primary'}
              data-slot="loading-overlay-loader"
            />
          )}
        </Overlay>
      )}
    </Transition>
  );
}
