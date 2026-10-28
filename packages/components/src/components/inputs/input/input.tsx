import { createMemo, omit, Show, untrack } from 'solid-js';
import { type JSX, type ValidComponent } from '@solidjs/web';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import style from './input.module.css';
import { mergeRefs, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import { useInputWrapper } from '../input-wrapper';
import type { SlopSize } from '../../../core';

export type InputVariant = 'outline' | 'soft' | 'ghost';

export interface InputOwnProps {
  /** Visual style. Defaults to `outline`. */
  variant?: InputVariant;
  /** Height and text size. Defaults to the InputWrapper's size, or `md`. */
  size?: SlopSize;
  /** Content before the control, usually an icon. */
  leftSection?: JSX.Element;
  /** Content after the control: an icon, a unit, or a button. */
  rightSection?: JSX.Element;
  /** Marks the field invalid: an error border and `aria-invalid`. Defaults to whether the InputWrapper has an error. */
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Defaults to the InputWrapper's `required`. */
  required?: boolean;
  /** Classes for the box, not the control. */
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  /** Styles for the box, not the control. */
  style?: JSX.CSSProperties;
  /** The control element. */
  ref?: Ref<HTMLElement>;
}

export type InputProps<T extends ValidComponent = 'input'> = PolymorphicProps<T, InputOwnProps>;

const hasContent = (value: JSX.Element) => value != null && value !== false;

// Clicks on these keep their own behavior; a click anywhere else in the box focuses the control.
const INTERACTIVE = 'a, button, input, select, textarea, label, [tabindex], [contenteditable]';

/**
 * A field box: a control, an `input` by default or any element with `as`, with optional sections on either side.
 * `class` and `style` go to the box; every other prop goes to the control. Inside an InputWrapper, it takes the
 * wrapper's id, description, error and size.
 */
export function Input<T extends ValidComponent = 'input'>(props: InputProps<T>) {
  let control: HTMLElement | undefined;
  const wrapper = useInputWrapper();
  const own = props as InputOwnProps &
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof InputOwnProps> & { as?: ValidComponent };

  // `as` and `dynamicAs` stay in: Polymorphic reads them.
  const others = omit(
    own,
    'class',
    'style',
    'ref',
    'variant',
    'size',
    'leftSection',
    'rightSection',
    'invalid',
    'disabled',
    'readOnly',
    'required',
    'id',
    'aria-describedby',
  );

  // Read once: a JSX prop is a getter that creates its elements on every read. Each is rendered whenever it has
  // content, so nothing created here is left out of the page.
  const leftSection = createMemo(() => own.leftSection, { name: 'Input.leftSection' });
  const rightSection = createMemo(() => own.rightSection, { name: 'Input.rightSection' });

  const size = () => own.size ?? wrapper?.size() ?? 'md';
  const invalid = () => own.invalid ?? wrapper?.invalid() ?? false;
  const describedBy = () => [own['aria-describedby'], wrapper?.describedBy()].filter(Boolean).join(' ') || undefined;

  // Read once, like `as` in Polymorphic.
  const multiline = untrack(() => own.as === 'textarea');

  const onMouseDown = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!control || target === control || target.closest(INTERACTIVE) || own.disabled) return;
    // Keeps the focus from going to the box, then gives it to the control.
    event.preventDefault();
    control.focus();
  };

  return (
    <div
      data-variant={own.variant ?? 'outline'}
      data-size={size()}
      data-invalid={invalid() ? '' : undefined}
      data-disabled={own.disabled ? '' : undefined}
      data-read-only={own.readOnly ? '' : undefined}
      data-multiline={multiline ? '' : undefined}
      data-with-left-section={hasContent(leftSection()) ? '' : undefined}
      data-with-right-section={hasContent(rightSection()) ? '' : undefined}
      class={joinClass(['slp-input', style.input], own.class)}
      style={own.style}
      onMouseDown={onMouseDown}
    >
      <Show when={hasContent(leftSection())}>
        <div data-slot="input-left-section" class={style.section}>
          {leftSection()}
        </div>
      </Show>
      <Polymorphic<Record<string, unknown>>
        as="input"
        // A ref is read once.
        ref={mergeRefs(
          (el: HTMLElement) => (control = el),
          untrack(() => own.ref),
        )}
        id={own.id ?? wrapper?.id}
        disabled={own.disabled}
        readOnly={own.readOnly}
        required={own.required ?? wrapper?.required()}
        aria-invalid={invalid() ? 'true' : undefined}
        aria-describedby={describedBy()}
        class={style.control}
        {...others}
        // After the spread: the control is always this slot.
        data-slot="input-control"
      />
      <Show when={hasContent(rightSection())}>
        <div data-slot="input-right-section" class={style.section}>
          {rightSection()}
        </div>
      </Show>
    </div>
  );
}
