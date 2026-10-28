import { createContext, createSignal, createUniqueId, flush, omit, onCleanup, untrack, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './radio.module.css';
import { mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import { choiceClass, createChoiceText, type ChoiceLabelPosition, type ChoiceTextProps } from '../choice';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import type { SlopColor, SlopSize } from '../../../core';

// ---------------------------------------------------------------------------------------------------------------
// Group context

interface RadioGroupContextValue {
  value: () => string | undefined;
  select: (value: string) => void;
  name: () => string;
  disabled: () => boolean;
  required: () => boolean;
  size: () => SlopSize | undefined;
  /** Adds a radio's way to put its input back to what it shows; returns the removal. */
  register: (sync: () => void) => () => void;
  /** Puts every radio's input back to what it shows. */
  sync: () => void;
}

// `null` rather than `undefined`: a context without a provider and without a default value throws when read.
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** The checked state of one radio: from its group by `value`, else from `checked` when controlled, else its own. */
function createRadioState(props: {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string;
  onChange?: (checked: boolean) => void;
}) {
  const group = useContext(RadioGroupContext);
  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultChecked),
    { name: 'Radio.checked' },
  );
  const checked = () => (group ? props.value !== undefined && group.value() === props.value : (props.checked ?? own()));
  const select = () => {
    if (group) {
      if (props.value !== undefined) group.select(props.value);
    } else if (props.checked === undefined) setOwn(true);
    props.onChange?.(true);
  };
  return { group, checked, select };
}

function Dot() {
  return (
    <svg data-slot="radio-icon" class={style.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5.5" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Radio

export interface RadioOwnProps extends ChoiceTextProps {
  /** The radio's value: what its group's value is when it's chosen, and what a form submits. */
  value?: string;
  /** Whether it's chosen, for a controlled radio outside a group. */
  checked?: boolean;
  /** Whether it starts chosen, for an uncontrolled radio outside a group. */
  defaultChecked?: boolean;
  /** Called with `true` when it's chosen. A radio can't be unchosen by clicking it. */
  onChange?: (checked: boolean) => void;
  /** Size of the circle and the text. Defaults to the group's, or `md`. */
  size?: SlopSize;
  /** Color role of the chosen circle. Defaults to `primary`. */
  color?: SlopColor;
  /** Which side of the circle the label goes. Defaults to `right`. */
  labelPosition?: ChoiceLabelPosition;
  disabled?: boolean;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  /** The `input`. */
  ref?: Ref<HTMLInputElement>;
}

export type RadioProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'size'>,
  RadioOwnProps
>;

/**
 * A radio with a label: a native `input type="radio"` drawn as a circle, next to a label, description and error.
 * Radios are chosen one of several, so put them in a Radio.Group.
 */
export function Radio(props: RadioProps) {
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
    'required',
    'aria-describedby',
  );
  const id = (untrack(() => props.id) as string | undefined) ?? `slp-${createUniqueId()}`;
  const text = createChoiceText(props, id, 'radio');
  const { group, checked, select } = createRadioState(props);
  const disabled = () => !!props.disabled || !!group?.disabled();

  // A controlled choice the parent didn't apply is undone. The browser has already moved the check from one radio to
  // another, so in a group every radio puts its input back.
  const sync = () => {
    if (input) input.checked = checked();
  };
  if (group) onCleanup(group.register(sync));

  const onChange = () => {
    select();
    flush();
    if (group) group.sync();
    else sync();
  };

  return (
    <div
      data-checked={checked() ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      data-invalid={text.invalid() ? '' : undefined}
      data-size={props.size ?? group?.size() ?? 'md'}
      data-color={props.color ?? 'primary'}
      data-label-position={props.labelPosition ?? 'right'}
      class={joinClass(['slp-radio', choiceClass, style.radio], props.class)}
      style={props.style}
    >
      <div data-slot="radio-control" class={style.control}>
        <input
          ref={mergeRefs(
            (el: HTMLInputElement) => (input = el),
            untrack(() => props.ref),
          )}
          type="radio"
          id={id}
          data-slot="radio-input"
          class={`${style.circle} ${style.input}`}
          checked={checked()}
          value={props.value}
          name={props.name ?? group?.name()}
          required={props.required ?? group?.required()}
          disabled={disabled()}
          aria-invalid={text.invalid() ? 'true' : undefined}
          aria-describedby={[props['aria-describedby'], text.describedBy()].filter(Boolean).join(' ') || undefined}
          onChange={onChange}
          {...others}
        />
        <Dot />
      </div>
      {text.view()}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Radio.Group

export interface RadioGroupOwnProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'children'> {
  /** The chosen value, for a controlled group; `undefined` is none. */
  value?: string;
  /** The value chosen at first, for an uncontrolled group. */
  defaultValue?: string;
  /** Called with the newly chosen value. */
  onChange?: (value: string) => void;
  /** The `name` of every radio, which makes them one group for the browser. Defaults to a generated one. */
  name?: string;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Radios, laid out however you like (a Stack, a Group, …). */
  children?: JSX.Element;
}

export type RadioGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, RadioGroupOwnProps>;

function RadioGroupItems(props: { invalid: boolean; required: boolean; children: JSX.Element }) {
  const wrapper = useInputWrapper();
  return (
    <div
      role="radiogroup"
      data-slot="radio-group-items"
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
      aria-invalid={props.invalid ? 'true' : undefined}
      aria-required={props.required ? 'true' : undefined}
    >
      {props.children}
    </div>
  );
}

/**
 * A labelled group of radios with one value: the chosen radio's `value`. A `role="radiogroup"` named by the label,
 * in an InputWrapper. The radios share a `name`, so the arrow keys move the choice.
 */
export function RadioGroup(props: RadioGroupProps) {
  const others = omit(props, 'value', 'defaultValue', 'onChange', 'name', 'disabled', 'children', 'class', 'size', 'required');
  const generatedName = `slp-${createUniqueId()}`;
  const [own, setOwn] = createSignal<string | undefined>(
    untrack(() => props.defaultValue),
    { name: 'RadioGroup.value' },
  );
  // Controlled when the prop is passed at all, so `value={undefined}` is a controlled group with nothing chosen.
  const controlled = untrack(() => 'value' in props);
  const value = () => (controlled ? props.value : own());
  const syncs = new Set<() => void>();

  const context: RadioGroupContextValue = {
    value,
    select: (item) => {
      if (item === value()) return;
      if (!controlled) setOwn(item);
      props.onChange?.(item);
    },
    name: () => props.name ?? generatedName,
    disabled: () => !!props.disabled,
    required: () => !!props.required,
    size: () => props.size,
    register: (sync) => {
      syncs.add(sync);
      return () => syncs.delete(sync);
    },
    sync: () => {
      for (const sync of syncs) sync();
    },
  };

  return (
    <InputWrapper
      {...others}
      labelElement="div"
      required={props.required}
      size={props.size ?? 'md'}
      class={joinClass(['slp-radio-group'], props.class)}
    >
      <RadioGroupContext value={context}>
        <RadioGroupItems invalid={props.error != null && props.error !== false} required={!!props.required}>
          {props.children}
        </RadioGroupItems>
      </RadioGroupContext>
    </InputWrapper>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Radio.Card

export interface RadioCardOwnProps {
  /** The card's value: what its group's value is when it's chosen. */
  value?: string;
  /** Whether it's chosen, for a controlled card outside a group. */
  checked?: boolean;
  /** Whether it starts chosen, for an uncontrolled card outside a group. */
  defaultChecked?: boolean;
  /** Called with `true` when it's chosen. */
  onChange?: (checked: boolean) => void;
  /** Color role of the chosen circle and border. Defaults to `primary`. */
  color?: SlopColor;
  disabled?: boolean;
  name?: string;
  /** The card's content, which is also the radio's accessible name. */
  children?: JSX.Element;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  /** The hidden `input`. */
  ref?: Ref<HTMLInputElement>;
}

export type RadioCardProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'size'>,
  RadioCardOwnProps
>;

/**
 * A card that is a radio: a `label` around a hidden native radio, an indicator and your content. A click anywhere
 * on it chooses it.
 */
export function RadioCard(props: RadioCardProps) {
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
  const { group, checked, select } = createRadioState(props);
  const disabled = () => !!props.disabled || !!group?.disabled();
  const sync = () => {
    if (input) input.checked = checked();
  };
  if (group) onCleanup(group.register(sync));

  const onChange = () => {
    select();
    flush();
    if (group) group.sync();
    else sync();
  };

  return (
    <label
      data-checked={checked() ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-radio-card', style.card], props.class)}
      style={props.style}
    >
      <input
        ref={mergeRefs(
          (el: HTMLInputElement) => (input = el),
          untrack(() => props.ref),
        )}
        type="radio"
        data-slot="radio-card-input"
        class={style.cardInput}
        checked={checked()}
        value={props.value}
        name={props.name ?? group?.name()}
        required={group?.required()}
        disabled={disabled()}
        onChange={onChange}
        {...others}
      />
      <span data-slot="radio-card-indicator" class={`${style.circle} ${style.indicator}`}>
        <Dot />
      </span>
      <span data-slot="radio-card-content" class={style.content}>
        {props.children}
      </span>
    </label>
  );
}

Radio.Group = RadioGroup;
Radio.Card = RadioCard;
