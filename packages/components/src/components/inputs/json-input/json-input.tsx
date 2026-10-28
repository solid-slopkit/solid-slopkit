import { createSignal, flush, omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './json-input.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { Textarea, type TextareaOwnProps } from '../textarea';

export interface JsonInputOwnProps extends Omit<TextareaOwnProps, 'error'> {
  /** The text, for a controlled field. */
  value?: string;
  /** The starting text, for an uncontrolled field. */
  defaultValue?: string;
  /** Called with the text on every change, and with the formatted text when `formatOnBlur` formats it. */
  onChange?: (value: string) => void;
  /** Formats valid JSON when the field loses focus. */
  formatOnBlur?: boolean;
  /** Spaces per level when formatting. Defaults to 2. */
  indent?: number;
  /** The message when the text isn't valid JSON. Defaults to `Invalid JSON`. */
  validationError?: JSX.Element;
  /** An error of yours, shown instead of the validation error. */
  error?: JSX.Element;
  /** Parses the text; throws when it's invalid. Defaults to `JSON.parse`. */
  deserialize?: (text: string) => unknown;
  /** Turns the parsed value back into text when formatting. Defaults to `JSON.stringify` with `indent`. */
  serialize?: (value: unknown, indent: number) => string;
}

export type JsonInputProps = ElementProps<
  Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange'>,
  JsonInputOwnProps
>;

/**
 * A labelled field for JSON: a Textarea in a monospace font that checks the text when the field loses focus, shows
 * an error while it's invalid, and can format it.
 */
export function JsonInput(props: JsonInputProps) {
  const others = omit(
    props,
    'value',
    'defaultValue',
    'onChange',
    'formatOnBlur',
    'indent',
    'validationError',
    'error',
    'deserialize',
    'serialize',
    'class',
    'onInput',
    'onBlur',
  );
  const controlled = untrack(() => 'value' in props);
  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? ''),
    { name: 'JsonInput.value' },
  );
  const value = () => (controlled ? (props.value ?? '') : own());
  // Set when the field is left with invalid text; cleared as soon as the text is valid again.
  const [invalid, setInvalid] = createSignal(false, { name: 'JsonInput.invalid' });

  const parse = (text: string): { ok: true; value: unknown } | { ok: false } => {
    if (text.trim() === '') return { ok: true, value: undefined };
    try {
      return { ok: true, value: (props.deserialize ?? JSON.parse)(text) };
    } catch {
      return { ok: false };
    }
  };

  const set = (text: string) => {
    if (!controlled) setOwn(text);
    props.onChange?.(text);
  };

  const onInput = (event: InputEvent) => {
    const text = (event.currentTarget as HTMLTextAreaElement).value;
    set(text);
    if (untrack(invalid) && parse(text).ok) setInvalid(false);
    callHandler(props.onInput, event);
  };

  const onBlur = (event: FocusEvent) => {
    // The text the field shows: a controlled value may not have caught up with the last keystroke yet.
    const text = (event.currentTarget as HTMLTextAreaElement).value;
    const result = parse(text);
    setInvalid(!result.ok);
    if (result.ok && props.formatOnBlur && text.trim() !== '') {
      const indent = props.indent ?? 2;
      const formatted = props.serialize ? props.serialize(result.value, indent) : JSON.stringify(result.value, null, indent);
      if (formatted !== text) set(formatted);
    }
    flush();
    callHandler(props.onBlur, event);
  };

  return (
    <Textarea
      {...others}
      value={value()}
      error={props.error ?? (invalid() ? (props.validationError ?? 'Invalid JSON') : undefined)}
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
      data-invalid-json={invalid() ? '' : undefined}
      class={joinClass(['slp-json-input', style.jsonInput], props.class)}
      onInput={onInput}
      onBlur={onBlur}
    />
  );
}
