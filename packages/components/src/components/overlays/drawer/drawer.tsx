import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './drawer.module.css';
import { DialogBase, type DialogBaseOwnProps, type DialogBaseProps } from '../dialog-base';
import type { TransitionName } from '../../utilities/transition/transition-attributes';
import type { ElementProps } from '../../../utils';
import type { SlopSize } from '../../../core';

/** The edge of the viewport it comes from. */
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerOwnProps extends DialogBaseOwnProps {
  /** The edge it comes from. Defaults to `left`. */
  position?: DrawerPosition;
  /**
   * Its width from the left or right, its height from the top or bottom: `xs` to `xl` (16 to 40rem). Defaults to `md`
   * (24rem). It never grows past the viewport.
   */
  size?: SlopSize;
}

export type DrawerProps = ElementProps<JSX.DialogHtmlAttributes<HTMLDialogElement>, DrawerOwnProps>;

/** Slides in from the edge it comes from. */
const SLIDE: Record<DrawerPosition, TransitionName> = {
  left: 'slide-right',
  right: 'slide-left',
  top: 'slide-down',
  bottom: 'slide-up',
};

/**
 * A panel that slides in from an edge of the viewport, such as navigation or filters: a modal `<dialog>` in the top
 * layer, which makes the rest of the page inert and keeps focus inside. Rendered while open. Opening focuses the
 * element marked `data-autofocus`, else the first focusable one; closing moves focus back. The close button, Escape
 * and a press on the backdrop ask it to close through `onClose`.
 */
export function Drawer(props: DrawerProps) {
  const others = omit(props, 'position', 'size');
  const position = () => props.position ?? 'left';

  return (
    <DialogBase
      {...(others as DialogBaseProps)}
      config={{
        component: 'Drawer',
        name: 'drawer',
        classes: style,
        defaultTransition: () => SLIDE[position()],
        attributes: {
          get 'data-position'() {
            return position();
          },
          get 'data-size'() {
            return props.size ?? 'md';
          },
        },
      }}
    />
  );
}
