import { createEffect, createUniqueId, flush, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './checkbox.module.css';
import { mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import { choiceClass, createChoiceText, type ChoiceLabelPosition, type ChoiceTextProps } from '../choice';
import { ChoiceGroup, createCheckedState, type ChoiceGroupOwnProps, type ChoiceGroupProps } from '../choice-group';
import type { SlopColor, SlopSize } from '../../../core';

function CheckIcon(props: { indeterminate?: boolean }) {
  return (
    <svg
      data-slot="checkbox-icon"
      class={style.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <Show when={props.indeterminate} fallback={<path d="M5 12.5 10 17.5 19 7" />}>
        <path d="M6 12h12" />
      </Show>
    </svg>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Checkbox

export interface CheckboxOwnProps extends ChoiceTextProps {
  /** Whether it's checked, for a controlled checkbox. Inside a Checkbox.Group, the group decides. */
  checked?: boolean;
  /** Whether it starts checked, for an uncontrolled checkbox. */
  defaultChecked?: boolean;
  /** Called with the new state when it's toggled. */
  onChange?: (checked: boolean) => void;
  /** Shows a dash instead of a check, for "some of these": the box's state is mixed until it's toggled. */
  indeterminate?: boolean;
  /** Submitted with a form when checked, and the checkbox's key in a Checkbox.Group. */
  value?: string;
  /** Size of the box and the text. Defaults to the group's, or `md`. */
  size?: SlopSize;
  /** Color role of the checked box. Defaults to `primary`. */
  color?: SlopColor;
  /** Which side of the box the label goes. Defaults to `right`. */
  labelPosition?: ChoiceLabelPosition;
  disabled?: boolean;
  /** Classes for the root. */
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  /** Styles for the root. */
  style?: JSX.CSSProperties;
  /** The `input`. */
  ref?: Ref<HTMLInputElement>;
}

export type CheckboxProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'size'>,
  CheckboxOwnProps
>;

/**
 * A checkbox with a label: a native `input type="checkbox"` drawn as a box with a check, next to a label,
 * description and error. Alone, or in a Checkbox.Group.
 */
export function Checkbox(props: CheckboxProps) {
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
    'indeterminate',
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
  const text = createChoiceText(props, id, 'checkbox');
  const { group, checked, set } = createCheckedState(props);
  const disabled = () => !!props.disabled || !!group?.disabled();

  // Not an attribute: the browser only has the property. Set after hydration, and on every change.
  createEffect(
    () => !!props.indeterminate,
    (indeterminate) => {
      if (input) input.indeterminate = indeterminate;
    },
    { name: 'Checkbox.indeterminate' },
  );

  const onChange = (event: Event) => {
    set((event.currentTarget as HTMLInputElement).checked);
    flush();
    // A controlled checkbox the parent didn't update goes back to what it shows.
    if (input) {
      input.checked = checked();
      input.indeterminate = !!props.indeterminate;
    }
  };

  return (
    <div
      data-checked={checked() ? '' : undefined}
      data-indeterminate={props.indeterminate ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      data-invalid={text.invalid() ? '' : undefined}
      data-size={props.size ?? group?.size() ?? 'md'}
      data-color={props.color ?? 'primary'}
      data-label-position={props.labelPosition ?? 'right'}
      class={joinClass(['slp-checkbox', choiceClass, style.checkbox], props.class)}
      style={props.style}
    >
      <div data-slot="checkbox-control" class={style.control}>
        <input
          ref={mergeRefs(
            (el: HTMLInputElement) => (input = el),
            untrack(() => props.ref),
          )}
          type="checkbox"
          id={id}
          data-slot="checkbox-input"
          class={`${style.box} ${style.input}`}
          checked={checked()}
          value={props.value}
          name={props.name ?? group?.name()}
          disabled={disabled()}
          aria-invalid={text.invalid() ? 'true' : undefined}
          aria-describedby={[props['aria-describedby'], text.describedBy()].filter(Boolean).join(' ') || undefined}
          onChange={onChange}
          {...others}
        />
        <CheckIcon indeterminate={props.indeterminate} />
      </div>
      {text.view()}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Checkbox.Group

export type CheckboxGroupOwnProps = ChoiceGroupOwnProps;
export type CheckboxGroupProps = ChoiceGroupProps;

/**
 * A labelled group of checkboxes with one value: the array of the checked ones' `value`s. A `role="group"` named
 * by the label, in an InputWrapper.
 */
export function CheckboxGroup(props: CheckboxGroupProps) {
  return <ChoiceGroup {...props} rootClass="slp-checkbox-group" itemsSlot="checkbox-group-items" />;
}

// ---------------------------------------------------------------------------------------------------------------
// Checkbox.Card

export interface CheckboxCardOwnProps {
  /** Whether it's checked, for a controlled card. Inside a Checkbox.Group, the group decides. */
  checked?: boolean;
  /** Whether it starts checked, for an uncontrolled card. */
  defaultChecked?: boolean;
  /** Called with the new state when it's toggled. */
  onChange?: (checked: boolean) => void;
  /** Submitted with a form when checked, and the card's key in a Checkbox.Group. */
  value?: string;
  /** Color role of the check and the checked border. Defaults to `primary`. */
  color?: SlopColor;
  disabled?: boolean;
  name?: string;
  /** The card's content, which is also the checkbox's accessible name. */
  children?: JSX.Element;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  /** The hidden `input`. */
  ref?: Ref<HTMLInputElement>;
}

export type CheckboxCardProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'size'>,
  CheckboxCardOwnProps
>;

/**
 * A card that is a checkbox: a `label` around a hidden native checkbox, a check indicator and your content. A click
 * anywhere on it toggles it.
 */
export function CheckboxCard(props: CheckboxCardProps) {
  let input: HTMLInputElement | undefined;
  const others = omit(
    props,
    'class',
    'style',
    'ref',
    'checked',
    'defaultChecked',
    'onChange',
    'value',
    'color',
    'disabled',
    'name',
    'children',
  );
  const { group, checked, set } = createCheckedState(props);
  const disabled = () => !!props.disabled || !!group?.disabled();

  const onChange = (event: Event) => {
    set((event.currentTarget as HTMLInputElement).checked);
    flush();
    if (input) input.checked = checked();
  };

  return (
    <label
      data-checked={checked() ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-checkbox-card', style.card], props.class)}
      style={props.style}
    >
      <input
        ref={mergeRefs(
          (el: HTMLInputElement) => (input = el),
          untrack(() => props.ref),
        )}
        type="checkbox"
        data-slot="checkbox-card-input"
        class={style.cardInput}
        checked={checked()}
        value={props.value}
        name={props.name ?? group?.name()}
        disabled={disabled()}
        onChange={onChange}
        {...others}
      />
      <span data-slot="checkbox-card-indicator" class={`${style.box} ${style.indicator}`}>
        <CheckIcon />
      </span>
      <span data-slot="checkbox-card-content" class={style.content}>
        {props.children}
      </span>
    </label>
  );
}

Checkbox.Group = CheckboxGroup;
Checkbox.Card = CheckboxCard;
