import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './image.module.css';
import { callHandler, mergeDefaultProps, mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import { createImageFailure } from '../../primitives';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface ImageOwnProps {
  /** The image URL. */
  src?: string;
  /** Text alternative. Required; pass `alt=""` for a decorative image. */
  alt: string;
  /** How the image fills its box when the box has another aspect ratio (`object-fit`). Defaults to `cover`. */
  fit?: ImageFit;
  /** Shown instead of `src` when it fails to load. */
  fallbackSrc?: string;
  ref?: Ref<HTMLImageElement>;
}

export type ImageProps = ElementProps<JSX.ImgHTMLAttributes<HTMLImageElement>, ImageOwnProps>;

/** An image: an `img` that fills its box and can fall back to another source when it fails to load. */
export function Image(props: ImageProps) {
  let img: HTMLImageElement | undefined;
  const mergedProps = mergeDefaultProps({ fit: 'cover' as ImageFit }, props);
  const others = omit(mergedProps, 'ref', 'class', 'src', 'fit', 'fallbackSrc', 'onError');

  const { failed, onError: markFailed } = createImageFailure(
    () => props.src,
    () => img,
  );
  const src = () => (failed() && props.fallbackSrc ? props.fallbackSrc : props.src);

  const onError: JSX.EventHandler<HTMLImageElement, Event> = (event) => {
    markFailed();
    callHandler(props.onError, event);
  };

  return (
    <img
      ref={mergeRefs((el: HTMLImageElement) => (img = el), mergedProps.ref)}
      src={src()}
      data-fit={mergedProps.fit}
      data-fallback={failed() && props.fallbackSrc ? '' : undefined}
      class={joinClass(['slp-image', style.image], mergedProps.class)}
      onError={onError}
      {...others}
    />
  );
}
