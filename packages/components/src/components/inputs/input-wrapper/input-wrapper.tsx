import { createContext, createMemo, createUniqueId, omit, Show, untrack, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './input-wrapper.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopSize } from '../../../core';

export type InputWrapperLabelElement = 'label' | 'div';

export interface InputWrapperOwnProps {
  /** The field's label. */
  label?: JSX.Element;
  /**
   * Content at the end of the label's row, such as the current value or a link. It isn't part of the label, so it
   * doesn't change the field's accessible name.
   */
  labelSection?: JSX.Element;
  /** Help text between the label and the field. */
  description?: JSX.Element;
  /**
   * An error message under the field, which also marks the field invalid. `true` marks it invalid without a
   * message.
   */
  error?: JSX.Element;
  /** Marks the field required: an asterisk after the label, and `required` on the control. */
  required?: boolean;
  /** Shows the asterisk without making the control `required`, e.g. for your own validation. Defaults to `required`. */
  withAsterisk?: boolean;
  /** Size of the label, texts and field. Defaults to `md`. */
  size?: SlopSize;
  /**
   * The control's id, which the label points to. Defaults to a generated one. Pass it here rather than on the
   * control.
   */
  id?: string;
  /**
   * `label` (the default) labels one control with `for`. `div` is for a group of controls, such as radios, which
   * points at the label with `aria-labelledby` instead. Read once.
   */
  labelElement?: InputWrapperLabelElement;
  children?: JSX.Element;
}

export type InputWrapperProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, InputWrapperOwnProps>;

/** What an InputWrapper tells the control inside it. Read with `useInputWrapper()`. */
export interface InputWrapperContextValue {
  /** The control's id. */
  id: string;
  /** The label's id, for controls labelled with `aria-labelledby`. */
  labelId: () => string | undefined;
  /** Ids of the description and error, for `aria-describedby`. */
  describedBy: () => string | undefined;
  invalid: () => boolean;
  required: () => boolean;
  size: () => SlopSize;
}

// `null` rather than `undefined`: a context without a provider and without a default value throws when read.
const InputWrapperContext = createContext<InputWrapperContextValue | null>(null);

/** The InputWrapper around the calling component, if there is one. */
export function useInputWrapper(): InputWrapperContextValue | undefined {
  return useContext(InputWrapperContext) ?? undefined;
}

const hasContent = (value: JSX.Element) => value != null && value !== false && value !== true && value !== '';

/**
 * A label, description and error around a field. The field inside, such as an Input, gets the ids, the invalid
 * state and the size from it, so the label and texts are wired for screen readers without passing ids around.
 */
export function InputWrapper(props: InputWrapperProps) {
  const mergedProps = mergeDefaultProps({ size: 'md' as SlopSize, labelElement: 'label' as InputWrapperLabelElement }, props);
  const others = omit(
    mergedProps,
    'class',
    'children',
    'label',
    'labelSection',
    'description',
    'error',
    'required',
    'withAsterisk',
    'size',
    'id',
    'labelElement',
  );

  const generatedId = createUniqueId();
  // Read once: the ids the label and texts point at don't change.
  const id = untrack(() => props.id) ?? `slp-${generatedId}`;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  // Read once: a JSX prop is a getter that creates its elements on every read. Each is rendered whenever it has
  // content, so nothing created here is left out of the page.
  const label = createMemo(() => props.label, { name: 'InputWrapper.label' });
  const labelSection = createMemo(() => props.labelSection, { name: 'InputWrapper.labelSection' });
  const description = createMemo(() => props.description, { name: 'InputWrapper.description' });
  const error = createMemo(() => props.error, { name: 'InputWrapper.error' });

  const withLabel = () => hasContent(label());
  const withLabelSection = () => hasContent(labelSection());
  const withDescription = () => hasContent(description());
  const withError = () => hasContent(error());
  const invalid = () => withError() || error() === true;

  // The element is chosen once, like `as`.
  const labelIsElement = untrack(() => mergedProps.labelElement) === 'label';
  const labelContent = () => (
    <>
      {label()}
      <Show when={mergedProps.withAsterisk ?? mergedProps.required}>
        <span data-slot="input-wrapper-required" class={style.required} aria-hidden="true">
          *
        </span>
      </Show>
    </>
  );

  // With a label section, the label and the section share a row.
  const labelView = () =>
    labelIsElement ? (
      <label id={labelId} for={id} data-slot="input-wrapper-label" class={style.label}>
        {labelContent()}
      </label>
    ) : (
      <div id={labelId} data-slot="input-wrapper-label" class={style.label}>
        {labelContent()}
      </div>
    );

  const context: InputWrapperContextValue = {
    id,
    labelId: () => (withLabel() ? labelId : undefined),
    describedBy: () =>
      [withDescription() ? descriptionId : '', withError() ? errorId : ''].filter(Boolean).join(' ') || undefined,
    invalid,
    required: () => !!mergedProps.required,
    size: () => mergedProps.size,
  };

  return (
    <div
      data-size={mergedProps.size}
      data-invalid={invalid() ? '' : undefined}
      class={joinClass(['slp-input-wrapper', style.wrapper], mergedProps.class)}
      {...others}
    >
      <Show when={withLabelSection()} fallback={<Show when={withLabel()}>{labelView()}</Show>}>
        <div data-slot="input-wrapper-label-row" class={style.labelRow}>
          <Show when={withLabel()}>{labelView()}</Show>
          <div data-slot="input-wrapper-label-section" class={style.labelSection}>
            {labelSection()}
          </div>
        </div>
      </Show>
      <Show when={withDescription()}>
        <div id={descriptionId} data-slot="input-wrapper-description" class={style.description}>
          {description()}
        </div>
      </Show>
      <InputWrapperContext value={context}>{mergedProps.children}</InputWrapperContext>
      <Show when={withError()}>
        <div id={errorId} data-slot="input-wrapper-error" class={style.error}>
          {error()}
        </div>
      </Show>
    </div>
  );
}
