import { createContext, createMemo, omit, Show, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import inputStyle from '../input/input.module.css';
import style from './pills-input.module.css';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { useInputWrapper } from '../input-wrapper';
import { type InputOwnProps } from '../input';
import { PillGroupContext } from '../pill/pill-group-context';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface PillsInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'invalid'> {}

export type PillsInputProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, PillsInputOwnProps>;

// The id is the PillsInput's (`id`), which its label points at.
export type PillsInputFieldProps = Omit<ElementProps<JSX.InputHTMLAttributes<HTMLInputElement>>, 'id'>;

interface PillsInputContextValue {
  disabled: () => boolean;
  setField: (element: HTMLInputElement | undefined) => void;
}

const PillsInputContext = createContext<PillsInputContextValue | null>(null);

const hasContent = (value: JSX.Element) => value != null && value !== false;

// Presses on these keep their own behavior; a press anywhere else in the box focuses the field.
const INTERACTIVE = 'a, button, input, select, textarea, label, [tabindex], [contenteditable]';

/**
 * The text field after the pills: an `input` that takes the label, description, error and required state of the
 * PillsInput around it, and grows to fill the rest of the row.
 */
export function PillsInputField(props: PillsInputFieldProps) {
  const context = useContext(PillsInputContext);
  if (!context) throw new Error('<PillsInput.Field> must be rendered inside <PillsInput>.');
  const wrapper = useInputWrapper();
  const others = omit(props, 'ref', 'class', 'disabled', 'required', 'aria-describedby', 'aria-invalid');
  const describedBy = () => [props['aria-describedby'], wrapper?.describedBy()].filter(Boolean).join(' ') || undefined;
  const invalid = () => props['aria-invalid'] ?? (wrapper?.invalid() ? 'true' : undefined);

  return (
    <input
      ref={[(el: HTMLInputElement) => context.setField(el), untrack(() => props.ref)]}
      id={wrapper?.id}
      disabled={props.disabled ?? context.disabled()}
      required={props.required ?? wrapper?.required()}
      aria-invalid={invalid()}
      aria-describedby={describedBy()}
      data-slot="pills-input-field"
      class={joinClass(['slp-pills-input-field', style.field], props.class)}
      {...others}
    />
  );
}

/** The box without the label and texts, for the fields built on it (MultiSelect, TagsInput). Internal. */
export function PillsInputBox(props: PillsInputProps) {
  const wrapper = useInputWrapper();
  const others = omit(
    controlProps(props) as PillsInputProps,
    'children',
    'variant',
    'leftSection',
    'rightSection',
    'disabled',
    'invalid',
    'onMouseDown',
  );
  let field: HTMLInputElement | undefined;

  // Read once: a JSX prop is a getter that creates its elements on every read.
  const leftSection = createMemo(() => props.leftSection, { name: 'PillsInput.leftSection' });
  const rightSection = createMemo(() => props.rightSection, { name: 'PillsInput.rightSection' });
  const size = () => wrapper?.size() ?? 'md';
  const invalid = () => props.invalid ?? wrapper?.invalid() ?? false;
  const disabled = () => !!props.disabled;

  const onMouseDown = (event: MouseEvent) => {
    callHandler(props.onMouseDown, event);
    const target = event.target as Element;
    if (!field || event.defaultPrevented || target === field || target.closest(INTERACTIVE) || disabled()) return;
    // Keeps the focus from going to the box, then gives it to the field.
    event.preventDefault();
    field.focus();
  };

  return (
    <PillsInputContext value={{ disabled, setField: (element) => (field = element) }}>
      <PillGroupContext value={{ size, color: () => undefined, disabled }}>
        <div
          data-variant={props.variant ?? 'outline'}
          data-size={size()}
          data-invalid={invalid() ? '' : undefined}
          data-disabled={disabled() ? '' : undefined}
          data-with-left-section={hasContent(leftSection()) ? '' : undefined}
          data-with-right-section={hasContent(rightSection()) ? '' : undefined}
          data-slot="pills-input-box"
          class={joinClass(['slp-input', inputStyle.input, style.box], undefined)}
          onMouseDown={onMouseDown}
          {...others}
        >
          <Show when={hasContent(leftSection())}>
            <div data-slot="input-left-section" class={inputStyle.section}>
              {leftSection()}
            </div>
          </Show>
          <div data-slot="pills-input-content" class={style.content}>
            {props.children}
          </div>
          <Show when={hasContent(rightSection())}>
            <div data-slot="input-right-section" class={inputStyle.section}>
              {rightSection()}
            </div>
          </Show>
        </div>
      </PillGroupContext>
    </PillsInputContext>
  );
}

/**
 * A field box that holds pills and a text field after them, in rows that wrap: the base of MultiSelect and
 * TagsInput. Put Pills and a PillsInput.Field in it; the pills take its size. It has an InputWrapper's label,
 * description and error, which name and describe the field. A press on the box focuses the field.
 */
export function PillsInput(props: PillsInputProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-pills-input">
      <PillsInputBox {...props} />
    </FieldWrapper>
  );
}

PillsInput.Field = PillsInputField;
