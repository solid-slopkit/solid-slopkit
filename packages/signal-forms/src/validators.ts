import { deepClone } from './internal';
import {
  addRule,
  VALIDATE,
  VALIDATE_ASYNC,
  VALIDATE_STANDARD,
  type FieldContext,
  type SchemaPath,
  type ValidationErrorSpec,
} from './schema';
import type { StandardSchemaV1 } from './standard-schema';
import { metadata, MIN, MAX, MIN_LENGTH, MAX_LENGTH, PATTERN, REQUIRED } from './metadata';

/**
 * Validators (CONTEXT.md: Validator) — Logic Rules that inspect a Field's value
 * and yield zero or more Validation Errors. Each built-in is named after its
 * intent and attached by pointing at a Schema Path: `required(path.name)`.
 *
 * Composition: several validators may target one path; all run and their errors
 * concatenate. Following the usual convention, every built-in except `required`
 * skips an *empty* value (so `required` owns emptiness and the rest only fire on
 * present-but-invalid values) — pair `required` with the others as needed.
 */

/** What a validator function may return: nothing, one spec, or several. */
type ValidatorResult = ValidationErrorSpec | readonly ValidationErrorSpec[] | null | undefined;

/** Builds a Validation Error spec; the runtime attaches the `field` (CONTEXT.md: Validation Error). */
export function error(kind: string, message?: string): ValidationErrorSpec {
  return message === undefined ? { kind } : { kind, message };
}

/**
 * The general Validator: runs `fn` against the Field's context and reports the
 * error spec(s) it returns (or none for `null`). `ctx.value()` reads this field;
 * `ctx.valueOf(path)` reads any other — both reactive, so validity re-derives as
 * the Model changes.
 */
export function validate<T>(path: SchemaPath<T>, fn: (ctx: FieldContext<T>) => ValidatorResult): void {
  addRule(path, VALIDATE, fn);
}

/** What an async validator resolves to: nothing, one spec, or several. */
type AsyncValidatorResult = ValidatorResult | Promise<ValidatorResult>;

/**
 * An **asynchronous** Validator (v2, CONTEXT.md: Pending) — `fn` reads the field
 * (and any other) and returns a `Promise` of its error spec(s), e.g. a
 * server-side "is this username taken?" check. While the promise is in flight the
 * field's `$pending()` reads true; when it settles, the resolved errors merge
 * into `$errors()` (after the synchronous validators' errors, in declaration
 * order across async rules).
 *
 * Tracking follows the Solid async rule: reads made *synchronously* — before the
 * first `await` — are tracked and re-trigger the check; reads after an `await`
 * are not. So read the values you depend on up front, then await. Like the
 * synchronous built-ins (except `required`), guard emptiness yourself so an empty
 * field doesn't hit the network. A rejected promise is treated as "no error" and
 * clears `$pending` — catch transport failures and return a spec if you want them
 * surfaced. Disabled fields never run their async validators.
 */
export function validateAsync<T>(path: SchemaPath<T>, fn: (ctx: FieldContext<T>) => AsyncValidatorResult): void {
  addRule(path, VALIDATE_ASYNC, fn);
}

/**
 * Validates a Field's value against a **Standard Schema** (v2) — any schema that
 * conforms to the `~standard` contract (zod, valibot, arktype, …; see
 * standard-schema.ts). Point it at the value you want validated:
 *
 *   validateStandardSchema(p.address, zAddress) // whole object
 *   validateStandardSchema(p.email, z.string().email())
 *
 * Each issue the schema reports is mapped onto the Field its `path` locates,
 * *relative to the validated value* — so an object schema attached at `p.address`
 * surfaces its `street` issue on `f.address.street.$errors()`, and an empty path
 * lands on the field itself. Errors carry the kind `"standard"` and the schema's
 * message. Both synchronous and asynchronous schemas are supported; while an
 * async `validate` is in flight the target field's `$pending()` reads true.
 *
 * Unlike the hand-written synchronous validators, a Standard Schema settles on
 * the reactive flush (its `validate` is treated as possibly-async per the spec),
 * so its errors appear once the effect has run rather than on the very first
 * synchronous read.
 *
 * The value is deep-cloned before it reaches the schema: this reads the whole
 * subtree *synchronously* through the store (so an async schema — whose reads
 * after its first `await` wouldn't otherwise be tracked — still re-runs on any
 * change within the validated value), and hands the library a plain object rather
 * than a live store proxy.
 */
export function validateStandardSchema<T>(path: SchemaPath<T>, schema: StandardSchemaV1<T, unknown>): void {
  addRule(path, VALIDATE_STANDARD, (ctx) => schema['~standard'].validate(deepClone(ctx.value())));
}

/** A value that counts as "absent" for validation: null/undefined, empty string, empty array. */
function isEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}

/** Length of a string or array, or `null` for anything else. */
function lengthOf(value: unknown): number | null {
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  return null;
}

/** Fails when the value is empty (null/undefined, `''`, or `[]`). */
export function required<T>(path: SchemaPath<T>, message = 'Required'): void {
  metadata(path, REQUIRED, true);
  validate(path, (ctx) => (isEmpty(ctx.value()) ? error('required', message) : null));
}

/** Fails when a present number is less than `n`. */
export function min(path: SchemaPath<number>, n: number, message?: string): void {
  metadata(path, MIN, n);
  validate(path, (ctx) => {
    const value = ctx.value();
    return typeof value === 'number' && !Number.isNaN(value) && value < n
      ? error('min', message ?? `Must be at least ${n}`)
      : null;
  });
}

/** Fails when a present number is greater than `n`. */
export function max(path: SchemaPath<number>, n: number, message?: string): void {
  metadata(path, MAX, n);
  validate(path, (ctx) => {
    const value = ctx.value();
    return typeof value === 'number' && !Number.isNaN(value) && value > n
      ? error('max', message ?? `Must be at most ${n}`)
      : null;
  });
}

// Deliberately simple: one `@`, a dot in the domain, no spaces. Not RFC 5322.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fails when a present string is not a plausible email address. */
export function email(path: SchemaPath<string>, message = 'Must be a valid email'): void {
  validate(path, (ctx) => {
    const value = ctx.value();
    return typeof value === 'string' && value !== '' && !EMAIL_RE.test(value) ? error('email', message) : null;
  });
}

/** Fails when a present string does not match `re`. */
export function pattern(path: SchemaPath<string>, re: RegExp, message = 'Invalid format'): void {
  metadata(path, PATTERN, re);
  validate(path, (ctx) => {
    const value = ctx.value();
    return typeof value === 'string' && value !== '' && !re.test(value) ? error('pattern', message) : null;
  });
}

/** Fails when a present string/array is shorter than `n` (empty is skipped). */
export function minLength(path: SchemaPath<string | readonly unknown[]>, n: number, message?: string): void {
  metadata(path, MIN_LENGTH, n);
  validate(path, (ctx) => {
    const len = lengthOf(ctx.value());
    return len !== null && len > 0 && len < n ? error('minLength', message ?? `Must be at least ${n} characters`) : null;
  });
}

/** Fails when a string/array is longer than `n`. */
export function maxLength(path: SchemaPath<string | readonly unknown[]>, n: number, message?: string): void {
  metadata(path, MAX_LENGTH, n);
  validate(path, (ctx) => {
    const len = lengthOf(ctx.value());
    return len !== null && len > n ? error('maxLength', message ?? `Must be at most ${n} characters`) : null;
  });
}
