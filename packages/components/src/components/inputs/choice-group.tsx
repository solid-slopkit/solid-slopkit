// Shared by Checkbox.Group and Switch.Group: a labelled group with one value, the array of its checked items'
// `value`s, and the state each item reads from it. Internal; not exported from the package.
import { createContext, createSignal, omit, untrack, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { type ElementProps } from '../../utils';
import { joinClass } from '../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from './input-wrapper';
import type { SlopSize } from '../../core';

interface ChoiceGroupContextValue {
  value: () => readonly string[];
  toggle: (value: string) => void;
  name: () => string | undefined;
  disabled: () => boolean;
  size: () => SlopSize | undefined;
}

// `null` rather than `undefined`: a context without a provider and without a default value throws when read.
const ChoiceGroupContext = createContext<ChoiceGroupContextValue | null>(null);

/**
 * The checked state of one item: from its group when it's in one, else from `checked` when controlled, else its
 * own. `set` reports a change and applies it when uncontrolled.
 */
export function createCheckedState(props: {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string;
  onChange?: (checked: boolean) => void;
}) {
  const group = useContext(ChoiceGroupContext);
  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultChecked),
    { name: 'checked' },
  );
  const checked = () => {
    if (group && props.value !== undefined) return group.value().includes(props.value);
    return props.checked ?? own();
  };
  const set = (next: boolean) => {
    if (group && props.value !== undefined) group.toggle(props.value);
    else if (props.checked === undefined) setOwn(next);
    props.onChange?.(next);
  };
  return { group: group ?? undefined, checked, set };
}

export interface ChoiceGroupOwnProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'required' | 'children'> {
  /** The checked values, for a controlled group. */
  value?: readonly string[];
  /** The values checked at first, for an uncontrolled group. */
  defaultValue?: readonly string[];
  /** Called with the new checked values, in the order they were checked. */
  onChange?: (value: string[]) => void;
  /** The `name` of every item in the group, for forms. */
  name?: string;
  /** Disables every item in the group. */
  disabled?: boolean;
  /** The items, laid out however you like (a Stack, a Group, …). */
  children?: JSX.Element;
}

export type ChoiceGroupProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, ChoiceGroupOwnProps>;

function ChoiceGroupItems(props: { invalid: boolean; slot: string; children: JSX.Element }) {
  const wrapper = useInputWrapper();
  return (
    <div
      role="group"
      data-slot={props.slot}
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      {props.children}
    </div>
  );
}

/** The group: an InputWrapper with a `div` label around a `role="group"`, and the context its items read. */
export function ChoiceGroup(props: ChoiceGroupProps & { rootClass: string; itemsSlot: string }) {
  const others = omit(
    props,
    'value',
    'defaultValue',
    'onChange',
    'name',
    'disabled',
    'children',
    'class',
    'size',
    'rootClass',
    'itemsSlot',
  );
  const [own, setOwn] = createSignal<readonly string[]>(
    untrack(() => props.defaultValue ?? []),
    { name: 'group.value' },
  );
  const value = () => props.value ?? own();

  const context: ChoiceGroupContextValue = {
    value,
    toggle: (item) => {
      const current = value();
      const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
      if (props.value === undefined) setOwn(next);
      props.onChange?.(next);
    },
    name: () => props.name,
    disabled: () => !!props.disabled,
    size: () => props.size,
  };

  return (
    <InputWrapper {...others} labelElement="div" size={props.size ?? 'md'} class={joinClass([props.rootClass], props.class)}>
      <ChoiceGroupContext value={context}>
        <ChoiceGroupItems slot={props.itemsSlot} invalid={props.error != null && props.error !== false}>
          {props.children}
        </ChoiceGroupItems>
      </ChoiceGroupContext>
    </InputWrapper>
  );
}
