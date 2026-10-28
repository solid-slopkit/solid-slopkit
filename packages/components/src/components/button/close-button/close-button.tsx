import { omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { Button } from '../button';
import type { SlopColor, SlopSize } from '../../../core';

export interface CloseButtonOwnProps {
  /** Accessible name, for screen readers. Defaults to `'Close'`. */
  label?: string;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Color role of the icon and the hover tint. Without one, the icon takes the color of the text around it. */
  color?: SlopColor;
  /** Native type. Defaults to `'button'`, so it never submits a form by accident. */
  type?: 'button' | 'submit' | 'reset';
  /** Disables the button. */
  disabled?: boolean;
  /** Replaces the built-in X icon. */
  children?: JSX.Element;
}

export type CloseButtonProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>, CloseButtonOwnProps>;

/** A square ghost Button with an X icon, for closing or dismissing what it sits in. */
export function CloseButton(props: CloseButtonProps) {
  const others = omit(props, 'class', 'label', 'size', 'color', 'children');
  // Read once: whether the prop is passed decides which icon renders, and reading it doesn't create the element.
  const withIcon = untrack(() => 'children' in props);

  return (
    <Button
      variant="ghost"
      shape="square"
      size={props.size ?? 'md'}
      color={props.color}
      aria-label={props.label ?? 'Close'}
      class={joinClass(['slp-close-button'], props.class)}
      {...others}
    >
      {withIcon ? props.children : <CloseIcon />}
    </Button>
  );
}

function CloseIcon() {
  return (
    <svg
      data-slot="close-button-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
