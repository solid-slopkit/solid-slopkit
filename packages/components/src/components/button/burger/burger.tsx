import { createSignal, omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './burger.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { ActionIcon, type ActionIconVariant } from '../action-icon';
import type { SlopColor, SlopSize } from '../../../core';

export interface BurgerOwnProps {
  /** Whether what it toggles is open, for a controlled burger. */
  opened?: boolean;
  /** Whether it starts open, for an uncontrolled burger. */
  defaultOpened?: boolean;
  /** Called with the new state when it's pressed. */
  onChange?: (opened: boolean) => void;
  /** Accessible name: what it opens. Defaults to `'Navigation'`; the open state is announced through `aria-expanded`. */
  label?: string;
  /** Visual style. Defaults to `ghost`. */
  variant?: ActionIconVariant;
  /** Color role. Without one the lines take the color of the text around it. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  disabled?: boolean;
}

export type BurgerProps = ElementProps<Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onChange'>, BurgerOwnProps>;

/** A button with three lines that turn into an X while what it toggles, usually the navigation, is open. */
export function Burger(props: BurgerProps) {
  const others = omit(props, 'class', 'opened', 'defaultOpened', 'onChange', 'label', 'onClick');

  // Follows `opened` when controlled. Uncontrolled, it starts at `defaultOpened` and only the user changes it.
  const [opened, setOpened] = createSignal(() => props.opened ?? untrack(() => !!props.defaultOpened), {
    name: 'Burger.opened',
  });

  const onClick = (event: MouseEvent) => {
    callHandler(props.onClick, event);
    if (event.defaultPrevented) return;
    const next = !opened();
    if (props.opened === undefined) setOpened(next);
    props.onChange?.(next);
  };

  return (
    <ActionIcon
      {...others}
      label={props.label ?? 'Navigation'}
      aria-expanded={opened() ? 'true' : 'false'}
      data-opened={opened() ? '' : undefined}
      class={joinClass(['slp-burger', style.burger], props.class)}
      onClick={onClick}
    >
      <span data-slot="burger-lines" class={style.lines} aria-hidden="true" />
    </ActionIcon>
  );
}
