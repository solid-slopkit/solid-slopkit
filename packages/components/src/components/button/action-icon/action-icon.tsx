import { omit } from 'solid-js';
import { type JSX, type ValidComponent } from '@solidjs/web';
import type { PolymorphicProps } from '../../polymorphic';
import { joinClass } from '../../../style-props';
import { Button, type ButtonVariant } from '../button';
import type { SlopColor, SlopSize } from '../../../core';

export type ActionIconVariant = Exclude<ButtonVariant, 'link'>;

export type ActionIconShape = 'square' | 'circle';

export interface ActionIconOwnProps {
  /** Accessible name. Required: the icon alone says nothing to a screen reader. */
  label: string;
  /** Visual style. Defaults to `ghost`. */
  variant?: ActionIconVariant;
  /** Color role. Without one the button uses the base colors, or the text color around it when ghost. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Defaults to `square`. */
  shape?: ActionIconShape;
  /** Forces the pressed look, e.g. for a toggled button. */
  active?: boolean;
  /** Shows a spinner over the icon and disables the button. */
  loading?: boolean;
  disabled?: boolean;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  /** The icon. */
  children?: JSX.Element;
}

export type ActionIconProps<T extends ValidComponent = 'button'> = PolymorphicProps<T, ActionIconOwnProps>;

/**
 * A button that shows only an icon: a fixed-size square or circle Button, named by `label`. `as` renders another
 * element, such as a link.
 */
export function ActionIcon<T extends ValidComponent = 'button'>(props: ActionIconProps<T>) {
  const others = omit(props as ActionIconOwnProps, 'class', 'label', 'variant', 'size', 'shape');

  return (
    <Button
      {...(others as Record<string, unknown>)}
      variant={props.variant ?? 'ghost'}
      size={props.size ?? 'md'}
      shape={props.shape ?? 'square'}
      aria-label={props.label}
      class={joinClass(['slp-action-icon'], props.class)}
    />
  );
}
