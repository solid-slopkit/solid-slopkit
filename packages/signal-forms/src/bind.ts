import type { Field } from './form';
import { REQUIRED } from './metadata';

/**
 * Typed-value binding between a Field and a component.
 *
 *   <TextInput label="Email" {...bind(f.email)} />
 *
 * Where `control()` wires a native element through DOM events, `bind()`
 * wires a component that takes `value` and `onChange(value)` with the typed value,
 * the convention slopkit's inputs follow. It needs no per-type adapters, because
 * the typed value is already the contract. Every field is a getter, so the spread
 * tracks the Field's state.
 *
 * The Field's `T` must be the type the component's `value` and `onChange` carry:
 * `Select` takes `string | null`, `NumberInput` takes `number | undefined` (empty is
 * `undefined`). A mismatch is a type error, not a silent coercion.
 *
 * Text inputs (`TextInput`, `Textarea`, `PasswordInput`) pass `value` and `onInput` to
 * the native element, so they take `bind.text(f)`; `Checkbox` and `Switch` take
 * `bind.checked(f)`. `NativeSelect` reports the native `change` event, so it takes
 * `bind.nativeSelect(f)`.
 */

/** Props for a component bound by `value` / `onChange(value)`. */
export interface ValueBinding<T> {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly onBlur: () => void;
  /** The first error's message (or `true` when it has none) once the field is touched; else `false`. */
  readonly error: string | boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  /** True when a `required(...)` rule is attached to the field. */
  readonly required: boolean;
}

/** Props for a text input that passes `value` / `onInput` to its native element. */
export interface TextBinding {
  readonly value: string;
  readonly onInput: (event: { currentTarget: { value: string } }) => void;
  readonly onBlur: () => void;
  readonly error: string | boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
}

/** Props for a `NativeSelect`, whose `onChange` is the native `change` event. */
export interface NativeSelectBinding {
  readonly value: string;
  readonly onChange: (event: { currentTarget: { value: string } }) => void;
  readonly onBlur: () => void;
  readonly error: string | boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
}

/** Props for a component bound by `checked` / `onChange(checked)`. */
export interface CheckedBinding {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly onBlur: () => void;
  readonly error: string | boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
}

/** The state every binding exposes besides the value, as getters so a spread keeps tracking. */
function stateOf(field: Field<unknown>) {
  return {
    onBlur: () => field.$markTouched(),
    get error(): string | boolean {
      // Errors surface once the user has left the field, or on submit (which touches every field).
      if (!field.$touched()) return false;
      const first = field.$errors()[0];
      return first ? (first.message ?? true) : false;
    },
    get disabled() {
      return field.$disabled();
    },
    get readOnly() {
      return field.$readonly();
    },
    get required() {
      return field.$metadata(REQUIRED) === true;
    },
  };
}

/** Adds the shared state to `target` by descriptor: spreading it would read the getters once and freeze them. */
function withState<B extends object>(target: B, field: Field<unknown>): B & ReturnType<typeof stateOf> {
  return Object.defineProperties(target, Object.getOwnPropertyDescriptors(stateOf(field))) as B & ReturnType<typeof stateOf>;
}

function valueBinding<T>(field: Field<T>): ValueBinding<T> {
  return withState(
    {
      get value() {
        return field.$value();
      },
      onChange: (value: T) => field.$set(value),
    },
    field as Field<unknown>,
  );
}

function textBinding(field: Field<string>): TextBinding {
  return withState(
    {
      get value() {
        return field.$value();
      },
      onInput: (event: { currentTarget: { value: string } }) => field.$set(event.currentTarget.value),
    },
    field as Field<unknown>,
  );
}

function nativeSelectBinding(field: Field<string>): NativeSelectBinding {
  return withState(
    {
      get value() {
        return field.$value();
      },
      onChange: (event: { currentTarget: { value: string } }) => {
        // A select has no native readonly: refuse the edit and put the element back.
        if (field.$readonly()) {
          event.currentTarget.value = field.$value();
          return;
        }
        field.$set(event.currentTarget.value);
      },
    },
    field as Field<unknown>,
  );
}

function checkedBinding(field: Field<boolean>): CheckedBinding {
  return withState(
    {
      get checked() {
        return field.$value();
      },
      onChange: (checked: boolean) => field.$set(checked),
    },
    field as Field<unknown>,
  );
}

/**
 * Binds a Field to a component by `value` / `onChange(value)`; `bind.text` is the variant for text inputs
 * (`value` / `onInput`), `bind.checked` the `checked` variant, `bind.nativeSelect` the variant for `NativeSelect`
 * (`value` / `onChange(event)`).
 */
export const bind = Object.assign(valueBinding, {
  text: textBinding,
  checked: checkedBinding,
  nativeSelect: nativeSelectBinding,
});
