// Shared by Checkbox, Radio and Switch: the label, description and error next to a small control, and the ids that
// wire them to it. Internal; not exported from the package.
import { createMemo, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './choice.module.css';

export type ChoiceLabelPosition = 'right' | 'left';

export interface ChoiceTextProps {
  /** The label, next to the control. */
  label?: JSX.Element;
  /** Help text under the label. */
  description?: JSX.Element;
  /** An error message under the label, which also marks the control invalid. `true` marks it without a message. */
  error?: JSX.Element;
}

const hasContent = (value: JSX.Element) => value != null && value !== false && value !== true && value !== '';

/**
 * The text column next to a control, with its parts' ids. `slot` prefixes the slots (`checkbox-label`, …). Each
 * JSX prop is read once and rendered whenever it has content.
 */
export function createChoiceText(props: ChoiceTextProps, id: string, slot: string) {
  const label = createMemo(() => props.label, { name: `${slot}.label` });
  const description = createMemo(() => props.description, { name: `${slot}.description` });
  const error = createMemo(() => props.error, { name: `${slot}.error` });

  const withLabel = () => hasContent(label());
  const withDescription = () => hasContent(description());
  const withError = () => hasContent(error());

  return {
    invalid: () => withError() || error() === true,
    describedBy: () =>
      [withDescription() ? `${id}-description` : '', withError() ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
    view: () => (
      <Show when={withLabel() || withDescription() || withError()}>
        <div data-slot={`${slot}-text`} class={style.text}>
          <Show when={withLabel()}>
            <label for={id} data-slot={`${slot}-label`} class={style.label}>
              {label()}
            </label>
          </Show>
          <Show when={withDescription()}>
            <div id={`${id}-description`} data-slot={`${slot}-description`} class={style.description}>
              {description()}
            </div>
          </Show>
          <Show when={withError()}>
            <div id={`${id}-error`} data-slot={`${slot}-error`} class={style.error}>
              {error()}
            </div>
          </Show>
        </div>
      </Show>
    ),
  };
}

/** The root's class for the shared layout. */
export const choiceClass = style.choice;
