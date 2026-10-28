import type { JSX } from '@solidjs/web';
import type { Field } from './form';

/**
 * Prop-spread binding between a Field Node and a DOM input.
 *
 *   <input {...control(f.email)} />
 *
 * The returned object exposes `value`/`checked` as **getters** so Solid tracks
 * them through the spread and the input stays in sync with the store. The
 * `onInput`/`onChange` handlers write via `$set`, and `onBlur` marks the field
 * touched — all in the event phase, clear of Solid's owned-write rule.
 *
 * `control(field)` binds a text input; type-specific adapters (`control.checkbox`,
 * `control.number`, `control.select`) handle the non-text cases explicitly
 * rather than through hidden magic.
 *
 * Conditions are reflected onto the input, also as getters so they
 * track: `$disabled()` → the native `disabled` attribute (a disabled element
 * fires no events, so no write can happen); `$readonly()` → the native
 * `readonly` attribute on text/number inputs. Checkbox and select have no native
 * `readonly`, so their handlers guard on `$readonly()` and snap the DOM back to
 * the store value — keeping the field non-editable but still present and bound.
 */

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;
type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement>;

/** Props for a text `<input>` bound to a string field. */
export type TextControlProps = Pick<InputProps, 'value' | 'onInput' | 'onBlur' | 'disabled' | 'readonly'>;
/** Props for a `<input type="checkbox">` bound to a boolean field. */
export type CheckboxControlProps = Pick<InputProps, 'checked' | 'onChange' | 'onBlur' | 'disabled'>;
/** Props for a numeric `<input>` bound to a number field. */
export type NumberControlProps = Pick<InputProps, 'value' | 'onInput' | 'onBlur' | 'disabled' | 'readonly'>;
/** Props for a `<select>` bound to a string field. */
export type SelectControlProps = Pick<SelectProps, 'value' | 'onChange' | 'onBlur' | 'disabled'>;

function textControl(field: Field<string>): TextControlProps {
  return {
    get value() {
      return field.$value();
    },
    get disabled() {
      return field.$disabled();
    },
    get readonly() {
      return field.$readonly();
    },
    onInput: (e) => field.$set(e.currentTarget.value),
    onBlur: () => field.$markTouched(),
  };
}

function checkboxControl(field: Field<boolean>): CheckboxControlProps {
  return {
    get checked() {
      return field.$value();
    },
    get disabled() {
      return field.$disabled();
    },
    onChange: (e) => {
      // No native readonly for checkboxes: block the edit and snap the DOM
      // back to the store value (the getter alone won't, since it didn't change).
      if (field.$readonly()) {
        e.currentTarget.checked = field.$value();
        return;
      }
      field.$set(e.currentTarget.checked);
    },
    onBlur: () => field.$markTouched(),
  };
}

function numberControl(field: Field<number>): NumberControlProps {
  return {
    get value() {
      return field.$value();
    },
    get disabled() {
      return field.$disabled();
    },
    get readonly() {
      return field.$readonly();
    },
    // Empty input yields NaN via valueAsNumber; callers that need null/optional
    // semantics can model the field as `number | null` and adapt.
    onInput: (e) => field.$set(e.currentTarget.valueAsNumber),
    onBlur: () => field.$markTouched(),
  };
}

function selectControl(field: Field<string>): SelectControlProps {
  return {
    get value() {
      return field.$value();
    },
    get disabled() {
      return field.$disabled();
    },
    onChange: (e) => {
      // Selects have no native readonly either — same guard-and-snap as checkbox.
      if (field.$readonly()) {
        e.currentTarget.value = field.$value();
        return;
      }
      field.$set(e.currentTarget.value);
    },
    onBlur: () => field.$markTouched(),
  };
}

export const control = Object.assign(textControl, {
  checkbox: checkboxControl,
  number: numberControl,
  select: selectControl,
});
