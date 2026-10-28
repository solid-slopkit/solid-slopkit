import { createUniqueId, flush, omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './switch.module.css';
import { mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import { choiceClass, createChoiceText, type ChoiceLabelPosition, type ChoiceTextProps } from '../choice';
import { ChoiceGroup, createCheckedState, type ChoiceGroupOwnProps, type ChoiceGroupProps } from '../choice-group';
import type { SlopColor, SlopSize } from '../../../core';

export interface SwitchOwnProps extends ChoiceTextProps {
  /** Whether it's on, for a controlled switch. Inside a Switch.Group, the group decides. */
  checked?: boolean;
  /** Whether it starts on, for an uncontrolled switch. */
  defaultChecked?: boolean;
  /** Called with the new state when it's flipped. */
  onChange?: (checked: boolean) => void;
  /** Submitted with a form when on, and the switch's key in a Switch.Group. */
  value?: string;
  /** Size of the track and the text. Defaults to the group's, or `md`. */
  size?: SlopSize;
  /** Color role of the track when on. Defaults to `primary`. */
  color?: SlopColor;
  /** Which side of the switch the label goes. Defaults to `right`. */
  labelPosition?: ChoiceLabelPosition;
  disabled?: boolean;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  /** The `input`. */
  ref?: Ref<HTMLInputElement>;
}

export type SwitchProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'size'>,
  SwitchOwnProps
>;

/**
 * An on/off switch with a label: a native checkbox with `role="switch"`, drawn as a track with a thumb, next to a
 * label, description and error. For a setting that takes effect at once.
 */
export function Switch(props: SwitchProps) {
  let input: HTMLInputElement | undefined;
  const others = omit(
    props,
    'class',
    'style',
    'ref',
    'label',
    'description',
    'error',
    'checked',
    'defaultChecked',
    'onChange',
    'value',
    'size',
    'color',
    'labelPosition',
    'disabled',
    'id',
    'name',
    'aria-describedby',
  );
  const id = (untrack(() => props.id) as string | undefined) ?? `slp-${createUniqueId()}`;
  const text = createChoiceText(props, id, 'switch');
  const { group, checked, set } = createCheckedState(props);
  const disabled = () => !!props.disabled || !!group?.disabled();

  const onChange = (event: Event) => {
    set((event.currentTarget as HTMLInputElement).checked);
    flush();
    // A controlled switch the parent didn't update goes back to what it shows.
    if (input) input.checked = checked();
  };

  return (
    <div
      data-checked={checked() ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      data-invalid={text.invalid() ? '' : undefined}
      data-size={props.size ?? group?.size() ?? 'md'}
      data-color={props.color ?? 'primary'}
      data-label-position={props.labelPosition ?? 'right'}
      class={joinClass(['slp-switch', choiceClass, style.switch], props.class)}
      style={props.style}
    >
      <div data-slot="switch-control" class={style.control}>
        <input
          ref={mergeRefs(
            (el: HTMLInputElement) => (input = el),
            untrack(() => props.ref),
          )}
          type="checkbox"
          role="switch"
          id={id}
          data-slot="switch-track"
          class={style.track}
          checked={checked()}
          value={props.value}
          name={props.name ?? group?.name()}
          disabled={disabled()}
          aria-invalid={text.invalid() ? 'true' : undefined}
          aria-describedby={[props['aria-describedby'], text.describedBy()].filter(Boolean).join(' ') || undefined}
          onChange={onChange}
          {...others}
        />
        <span data-slot="switch-thumb" class={style.thumb} aria-hidden="true" />
      </div>
      {text.view()}
    </div>
  );
}

export type SwitchGroupOwnProps = ChoiceGroupOwnProps;
export type SwitchGroupProps = ChoiceGroupProps;

/**
 * A labelled group of switches with one value: the array of the ones that are on. A `role="group"` named by the
 * label, in an InputWrapper.
 */
export function SwitchGroup(props: SwitchGroupProps) {
  return <ChoiceGroup {...props} rootClass="slp-switch-group" itemsSlot="switch-group-items" />;
}

Switch.Group = SwitchGroup;
