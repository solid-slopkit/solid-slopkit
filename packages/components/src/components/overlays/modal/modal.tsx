import { omit } from 'solid-js';
import style from './modal.module.css';
import { DialogBase, type DialogBaseOwnProps, type DialogBaseProps } from '../dialog-base';
import type { ElementProps } from '../../../utils';
import type { JSX } from '@solidjs/web';
import type { SlopSize } from '../../../core';

export interface ModalOwnProps extends DialogBaseOwnProps {
  /** Width: `xs` to `xl` (20 to 48rem). Defaults to `md` (28rem). It never grows past the viewport. */
  size?: SlopSize;
  /** Centers it vertically, rather than near the top. */
  centered?: boolean;
  /** Fills the viewport, without corners. */
  fullScreen?: boolean;
}

export type ModalProps = ElementProps<JSX.DialogHtmlAttributes<HTMLDialogElement>, ModalOwnProps>;

/**
 * A dialog over the page: a modal `<dialog>` in the top layer, which makes the rest of the page inert and keeps focus
 * inside. Rendered while open. Opening focuses the element marked `data-autofocus`, else the first focusable one;
 * closing moves focus back. The close button, Escape and a press on the backdrop ask it to close through `onClose`.
 */
export function Modal(props: ModalProps) {
  const others = omit(props, 'size', 'centered', 'fullScreen');

  return (
    <DialogBase
      {...(others as DialogBaseProps)}
      config={{
        component: 'Modal',
        name: 'modal',
        classes: style,
        defaultTransition: () => 'pop',
        attributes: {
          get 'data-size'() {
            return props.size ?? 'md';
          },
          get 'data-centered'() {
            return props.centered ? '' : undefined;
          },
          get 'data-full-screen'() {
            return props.fullScreen ? '' : undefined;
          },
        },
      }}
    />
  );
}
