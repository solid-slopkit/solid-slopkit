import { createUniqueId, omit, Show, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './pill.module.css';
import { PillGroupContext } from './pill-group-context';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export interface PillOwnProps {
  /** Defaults to `md`, or the group's size. Sized to fit in an input of the same size. */
  size?: SlopSize;
  /** Color role: a tint of it, with the text in it. Defaults to the group's; without one the base colors. */
  color?: SlopColor;
  /** Shows a button that removes it, which calls `onRemove`. */
  withRemoveButton?: boolean;
  /** Called when the remove button is pressed. */
  onRemove?: () => void;
  /** The first word of the remove button's name, followed by the pill's text: `Remove Apple`. Defaults to `Remove`. */
  removeLabel?: string;
  /** Dims it and disables the remove button. Defaults to the group's. */
  disabled?: boolean;
}

export type PillProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, PillOwnProps>;

export interface PillGroupOwnProps {
  /** The size of the pills in it. Defaults to `md`. */
  size?: SlopSize;
  /** The color role of the pills in it. */
  color?: SlopColor;
  /** Disables every pill in it. */
  disabled?: boolean;
}

export type PillGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, PillGroupOwnProps>;

/** Pills in a row that wraps, with a gap that follows their size. */
export function PillGroup(props: PillGroupProps) {
  const others = omit(props, 'class', 'size', 'color', 'disabled');
  return (
    <PillGroupContext value={{ size: () => props.size, color: () => props.color, disabled: () => !!props.disabled }}>
      <div
        data-size={props.size ?? 'md'}
        data-disabled={props.disabled ? '' : undefined}
        class={joinClass(['slp-pill-group', style.group], props.class)}
        {...others}
      />
    </PillGroupContext>
  );
}

/**
 * A small rounded tag for a value someone chose, such as a tag or a picked option, optionally with a button that
 * removes it: a `span`. The remove button is named after the pill, `Remove Apple`.
 */
export function Pill(props: PillProps) {
  const group = useContext(PillGroupContext);
  const others = omit(props, 'class', 'children', 'size', 'color', 'withRemoveButton', 'onRemove', 'removeLabel', 'disabled');
  const disabled = () => props.disabled ?? group?.disabled() ?? false;
  const labelId = `slp-pill-${createUniqueId()}`;
  const removeId = `${labelId}-remove`;

  return (
    <span
      data-size={props.size ?? group?.size() ?? 'md'}
      data-color={props.color ?? group?.color()}
      data-disabled={disabled() ? '' : undefined}
      data-with-remove={props.withRemoveButton ? '' : undefined}
      class={joinClass(['slp-pill', style.pill], props.class)}
      {...others}
    >
      <span id={labelId} data-slot="pill-label" class={style.label}>
        {props.children}
      </span>
      <Show when={props.withRemoveButton}>
        <button
          id={removeId}
          type="button"
          // Its own label, then the pill's text.
          aria-label={props.removeLabel ?? 'Remove'}
          aria-labelledby={`${removeId} ${labelId}`}
          disabled={disabled()}
          data-slot="pill-remove"
          class={style.remove}
          onClick={() => props.onRemove?.()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </Show>
    </span>
  );
}

Pill.Group = PillGroup;
