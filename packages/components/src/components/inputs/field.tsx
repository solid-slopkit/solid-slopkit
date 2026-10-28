// Shared by the field components (TextInput, Textarea, …): an InputWrapper around a control, from one props
// object, and the dropdown a field opens under it. Internal; not exported from the package.
import { omit, onCleanup, onSettled } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { joinClass } from '../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from './input-wrapper';
import type { Floating } from '../primitives';
import type { TransitionStyleAttributes } from '../utilities/transition/transition-attributes';

/**
 * The props a field passes to its InputWrapper. `class`, `style` and `data-slot` go to the wrapper too: the whole
 * field, so a component that holds a field names the whole field as its part.
 */
export interface FieldWrapperProps extends Omit<InputWrapperOwnProps, 'children' | 'labelElement'> {
  /** Classes for the field's root. */
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  /** Styles for the field's root. */
  style?: JSX.CSSProperties;
  /** The slot the field's root fills in a component around it. */
  'data-slot'?: string;
}

const WRAPPER_KEYS = [
  'label',
  'labelSection',
  'description',
  'error',
  'required',
  'withAsterisk',
  'size',
  'id',
  'class',
  'style',
  'data-slot',
] as const;

/** The field's props without the wrapper's: what goes to the control. */
export function controlProps<T extends FieldWrapperProps>(props: T): Omit<T, (typeof WRAPPER_KEYS)[number]> {
  return omit(props, ...WRAPPER_KEYS) as unknown as Omit<T, (typeof WRAPPER_KEYS)[number]>;
}

/** An InputWrapper from a field's props, with the field's root class. */
export function FieldWrapper(props: { field: FieldWrapperProps; rootClass: string; children: JSX.Element }) {
  return (
    <InputWrapper
      label={props.field.label}
      labelSection={props.field.labelSection}
      description={props.field.description}
      error={props.field.error}
      required={props.field.required}
      withAsterisk={props.field.withAsterisk}
      // Not `undefined`: an explicit undefined would override InputWrapper's default.
      size={props.field.size ?? 'md'}
      id={props.field.id}
      class={joinClass([props.rootClass], props.field.class)}
      style={props.field.style}
      data-slot={props.field['data-slot']}
    >
      {props.children}
    </InputWrapper>
  );
}

/** The props of the dropdown a field opens under it. */
export interface FieldDropdownProps {
  /** Called with the dropdown as it mounts, and with `undefined` as it unmounts. */
  ref: (element: HTMLDivElement | undefined) => void;
  id: string;
  /** The field's root class and slot prefix: `color-input`. */
  slug: string;
  /** The field's own class for the dropdown. */
  class: string;
  /** The dropdown's accessible name when the field has no label. */
  'aria-label'?: JSX.HTMLAttributes<HTMLDivElement>['aria-label'];
  floating: Floating;
  animation: TransitionStyleAttributes;
  onFocusOut: (event: FocusEvent) => void;
  /** Called once the dropdown is shown and placed, to move the focus or scroll into it. */
  onShow?: (dropdown: HTMLDivElement) => void;
  children: JSX.Element;
}

/**
 * The dropdown a field opens under it: a popover dialog named by the field's label. Render it while the field's
 * presence is mounted; it shows itself once mounted.
 */
export function FieldDropdown(props: FieldDropdownProps) {
  const wrapper = useInputWrapper();
  let dropdown: HTMLDivElement | undefined;
  onSettled(() => {
    if (!dropdown) return;
    dropdown.showPopover();
    props.floating.update();
    props.onShow?.(dropdown);
  });
  onCleanup(() => props.ref(undefined));

  return (
    <div
      ref={(element: HTMLDivElement) => {
        dropdown = element;
        props.ref(element);
      }}
      id={props.id}
      popover="manual"
      role="dialog"
      aria-labelledby={wrapper?.labelId()}
      aria-label={wrapper?.labelId() ? undefined : props['aria-label']}
      data-slot={`${props.slug}-dropdown`}
      data-placement={props.floating.placement()}
      data-transition={props.animation['data-transition']}
      data-status={props.animation['data-status']}
      class={joinClass([`slp-${props.slug}-dropdown`, props.class, props.animation.class], undefined)}
      style={props.animation.style}
      onFocusOut={(event: FocusEvent) => props.onFocusOut(event)}
    >
      {props.children}
    </div>
  );
}
