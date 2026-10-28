import { createMemo, createSignal, For, flush, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './pin-input.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import type { InputVariant } from '../input';
import type { SlopSize } from '../../../core';

export type PinInputType = 'number' | 'alphanumeric';

export interface PinInputOwnProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'children'> {
  /** How many characters. Defaults to 4. */
  length?: number;
  /** `number` (the default) takes digits only; `alphanumeric` takes letters and digits. */
  type?: PinInputType;
  /** The code, for a controlled field. */
  value?: string;
  /** The starting code, for an uncontrolled field. */
  defaultValue?: string;
  /** Called with the code after every change. */
  onChange?: (value: string) => void;
  /** Called with the code when the last empty field is filled. */
  onComplete?: (value: string) => void;
  /** Hides the characters, like a password. */
  mask?: boolean;
  /** Asks the browser to fill in a code from a text message. Defaults to `true`. */
  oneTimeCode?: boolean;
  /** Submits the code with a form under this name, from a hidden input. */
  name?: string;
  /** The accessible name of each field. Defaults to `Character {n} of {length}`. */
  fieldLabel?: (index: number, length: number) => string;
  /** Visual style of the fields. Defaults to `outline`. */
  variant?: InputVariant;
  disabled?: boolean;
  readOnly?: boolean;
}

export type PinInputProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, PinInputOwnProps>;

const PATTERN: Record<PinInputType, RegExp> = { number: /\d/, alphanumeric: /[\p{L}\d]/u };

function PinFields(props: {
  length: number;
  chars: () => string[];
  setChars: (chars: string[]) => void;
  allowed: RegExp;
  numeric: boolean;
  mask: boolean;
  oneTimeCode: boolean;
  fieldLabel: (index: number, length: number) => string;
  variant: InputVariant;
  size: SlopSize;
  disabled: boolean;
  readOnly: boolean;
}) {
  const wrapper = useInputWrapper();
  const fields: HTMLInputElement[] = [];
  const indexes = createMemo(() => Array.from({ length: props.length }, (_, index) => index), { name: 'PinInput.indexes' });

  const focus = (index: number) => {
    const field = fields[Math.max(0, Math.min(props.length - 1, index))];
    field?.focus();
    field?.select();
  };

  // Writes `text` into the fields from `index` on, one character each, and moves to the field after the last one.
  const fill = (index: number, text: string) => {
    const typed = [...text].filter((char) => props.allowed.test(char));
    if (typed.length === 0) return;
    const next = [...props.chars()];
    typed.slice(0, props.length - index).forEach((char, offset) => (next[index + offset] = char));
    props.setChars(next);
    flush();
    focus(index + typed.length);
  };

  const clear = (index: number) => {
    const next = [...props.chars()];
    next[index] = '';
    props.setChars(next);
    flush();
  };

  const onInput = (index: number, event: InputEvent) => {
    const el = event.currentTarget as HTMLInputElement;
    const text = el.value;
    // Put back what the field shows: the state decides, and an invalid character never stays.
    el.value = props.chars()[index] ?? '';
    if (text === '') clear(index);
    // A one-character field holds the new character after the old one; keep the new one.
    else fill(index, text.length === 2 && text[0] === props.chars()[index] ? text[1] : text);
  };

  const onKeyDown = (index: number, event: KeyboardEvent) => {
    if (event.key === 'Backspace' && !props.chars()[index] && index > 0) {
      event.preventDefault();
      clear(index - 1);
      focus(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focus(index + 1);
    }
  };

  const onPaste = (index: number, event: ClipboardEvent) => {
    event.preventDefault();
    if (props.readOnly) return;
    fill(index, event.clipboardData?.getData('text') ?? '');
  };

  return (
    <div
      role="group"
      data-slot="pin-input-fields"
      class={style.fields}
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
    >
      <For each={indexes()}>
        {(index) => (
          <input
            ref={(el) => (fields[index] = el)}
            data-slot="pin-input-field"
            data-variant={props.variant}
            data-size={props.size}
            data-filled={props.chars()[index] ? '' : undefined}
            class={style.field}
            type={props.mask ? 'password' : 'text'}
            inputmode={props.numeric ? 'numeric' : 'text'}
            autocomplete={props.oneTimeCode && index === 0 ? 'one-time-code' : 'off'}
            autocapitalize="off"
            spellcheck="false"
            value={props.chars()[index] ?? ''}
            aria-label={props.fieldLabel(index, props.length)}
            aria-invalid={wrapper?.invalid() ? 'true' : undefined}
            disabled={props.disabled}
            readonly={props.readOnly}
            onInput={(event) => onInput(index, event)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={(event) => onPaste(index, event)}
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
      </For>
    </div>
  );
}

/**
 * A code split into one field per character, such as a one-time code or a PIN: typing moves to the next field,
 * Backspace goes back, and a pasted or autofilled code spreads over the fields.
 */
export function PinInput(props: PinInputProps) {
  const others = omit(
    props,
    'length',
    'type',
    'value',
    'defaultValue',
    'onChange',
    'onComplete',
    'mask',
    'oneTimeCode',
    'name',
    'fieldLabel',
    'variant',
    'disabled',
    'readOnly',
    'class',
    'size',
  );
  const length = () => props.length ?? 4;
  const toChars = (value: string | undefined) => Array.from({ length: length() }, (_, index) => [...(value ?? '')][index] ?? '');

  const controlled = untrack(() => 'value' in props);
  const [own, setOwn] = createSignal(
    untrack(() => toChars(props.defaultValue)),
    { name: 'PinInput.chars' },
  );
  const chars = createMemo(() => (controlled ? toChars(props.value) : own()), { name: 'PinInput.value' });
  const value = () => chars().join('');

  const setChars = (next: string[]) => {
    const before = value();
    const after = next.join('');
    if (!controlled) setOwn(next);
    if (after !== before) props.onChange?.(after);
    if (next.every(Boolean) && after !== before) props.onComplete?.(after);
  };

  return (
    <InputWrapper {...others} labelElement="div" size={props.size ?? 'md'} class={joinClass(['slp-pin-input'], props.class)}>
      <PinFields
        length={length()}
        chars={chars}
        setChars={setChars}
        allowed={PATTERN[props.type ?? 'number']}
        numeric={(props.type ?? 'number') === 'number'}
        mask={!!props.mask}
        oneTimeCode={props.oneTimeCode ?? true}
        fieldLabel={props.fieldLabel ?? ((index, total) => `Character ${index + 1} of ${total}`)}
        variant={props.variant ?? 'outline'}
        size={props.size ?? 'md'}
        disabled={!!props.disabled}
        readOnly={!!props.readOnly}
      />
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={value()} data-slot="pin-input-hidden" />
      </Show>
    </InputWrapper>
  );
}
