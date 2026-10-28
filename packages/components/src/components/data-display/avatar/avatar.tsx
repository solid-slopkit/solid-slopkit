import { createMemo, omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './avatar.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { createImageFailure } from '../../primitives';
import type { SlopColor, SlopSize } from '../../../core';
import { initials } from './initials';

export type AvatarVariant = 'soft' | 'solid' | 'outline';

export interface AvatarOwnProps {
  /** The image URL. Without one, or when it fails to load, the placeholder shows. */
  src?: string;
  /** The accessible name. Defaults to `name`. `alt=""` marks the avatar decorative and hides it. */
  alt?: string;
  /** The person's name: the placeholder's initials, and the accessible name when there's no `alt`. */
  name?: string;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Color role of the placeholder. Without one it uses the base colors. */
  color?: SlopColor;
  /** Look of the placeholder. Defaults to `soft`. */
  variant?: AvatarVariant;
  /** Placeholder content, such as an icon or `+3`. Wins over the initials. */
  children?: JSX.Element;
}

export type AvatarProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, AvatarOwnProps>;
export type AvatarGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4.25" />
      <path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5z" />
    </svg>
  );
}

/** Stacks avatars so they overlap, each ringed in the surface color. */
export function AvatarGroup(props: AvatarGroupProps) {
  const others = omit(props, 'class');
  return <div class={joinClass(['slp-avatar-group', style.group], props.class)} {...others} />;
}

/** A person or entity: their picture, or a placeholder with initials or an icon. A `span`. */
export function Avatar(props: AvatarProps) {
  let img: HTMLImageElement | undefined;
  const mergedProps = mergeDefaultProps({ size: 'md' as SlopSize, variant: 'soft' as AvatarVariant }, props);
  const others = omit(mergedProps, 'class', 'children', 'src', 'alt', 'name', 'size', 'color', 'variant');

  const { failed, onError } = createImageFailure(
    () => props.src,
    () => img,
  );
  const showImage = () => !!props.src && !failed();
  const decorative = () => props.alt === '';
  const label = () => (decorative() ? undefined : (props.alt ?? props.name));
  const text = createMemo(() => initials(props.name), { name: 'Avatar.initials' });

  return (
    <span
      role={label() ? 'img' : undefined}
      aria-label={label()}
      aria-hidden={decorative() ? 'true' : undefined}
      data-size={mergedProps.size}
      data-color={mergedProps.color}
      data-variant={mergedProps.variant}
      data-placeholder={showImage() ? undefined : ''}
      class={joinClass(['slp-avatar', style.avatar], mergedProps.class)}
      {...others}
    >
      <Show
        when={showImage()}
        fallback={
          // With a label on the root, the placeholder only repeats it; without one, children such as `+3` are the text.
          <span data-slot="avatar-placeholder" class={style.placeholder} aria-hidden={label() ? 'true' : undefined}>
            {props.children ?? (text() || <PersonIcon />)}
          </span>
        }
      >
        <img ref={(el) => (img = el)} data-slot="avatar-image" class={style.image} src={props.src} alt="" onError={onError} />
      </Show>
    </span>
  );
}

Avatar.Group = AvatarGroup;
