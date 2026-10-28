/**
 * @solid-slopkit/signal-forms — schema-driven, signal-based forms for SolidJS 2.x. Rules are attached
 * to paths of a Solid store, and every field's state is a signal.
 *
 * Public entry point.
 *
 * Vocabulary: ../CONTEXT.md — Decisions: ../docs/adr (0017–0022)
 */

export { form, submit } from './form';
export type { Field, FieldState, SignalForm, SubmitHandler } from './form';

export { control } from './control';
export type { TextControlProps, CheckboxControlProps, NumberControlProps, SelectControlProps } from './control';

export { bind } from './bind';
export type { ValueBinding, TextBinding, CheckedBinding, NativeSelectBinding } from './bind';

export { schema } from './schema';
export type { Schema, SchemaFn, SchemaOrFn, SchemaPath, FieldContext, ValidationError } from './schema';

export {
  validate,
  validateAsync,
  validateStandardSchema,
  required,
  min,
  max,
  email,
  pattern,
  minLength,
  maxLength,
  error,
} from './validators';

export type { StandardSchemaV1 } from './standard-schema';

export { disabled, hidden, readonly } from './conditions';
export type { Condition } from './conditions';

export { apply, applyWhen, applyWhenValue, applyEach } from './combinators';

export { metadata, createMetadataKey, MIN, MAX, MIN_LENGTH, MAX_LENGTH, PATTERN, REQUIRED } from './metadata';
export type { MetadataKey } from './metadata';
