import { addRule, METADATA, type FieldContext, type SchemaPath } from './schema';

/**
 * Metadata (CONTEXT.md: Metadata) — a Logic Rule that attaches a *descriptive*
 * value to a Field under a typed key, rather than validating it. Read back with
 * `field.$metadata(key)`. The canonical use is surfacing a constraint to the view
 * (a numeric `min`/`max`, a `pattern`, a hint) so a control can reflect it —
 * without re-deriving it from the validators.
 *
 *   const HINT = createMetadataKey<string>('hint');
 *   schema(p => metadata(p.name, HINT, 'Your legal name'));
 *   // …later…  f.name.$metadata(HINT)  // 'Your legal name'
 *
 * The built-in validators also publish metadata under the limit keys below
 * (`min` → `MIN`, `pattern` → `PATTERN`, …), so `f.age.$metadata(MIN)` reads the
 * bound a `min(p.age, 18)` declared. See validators.ts.
 */

// A phantom brand so a `MetadataKey<T>` carries the value type it reads/writes.
declare const META: unique symbol;

/**
 * A typed, identity-unique handle for one kind of Field metadata. Create one with
 * `createMetadataKey`; the object identity *is* the key. An optional `reduce`
 * combines multiple values declared for the same field (e.g. two `min`s → the
 * most restrictive); without it, the last-declared value wins.
 */
export interface MetadataKey<T> {
  /** Debug label; not used for identity. */
  readonly description?: string;
  /** Combines several values declared at one field into one. */
  readonly reduce?: (values: readonly T[]) => T;
  /** Phantom — never present at runtime. */
  readonly [META]?: T;
}

/** What a Metadata rule's `run` returns — the key it targets and its value. */
export interface MetadataEntry {
  readonly key: MetadataKey<unknown>;
  readonly value: unknown;
}

/** Creates a fresh {@link MetadataKey}; its object identity is the key. */
export function createMetadataKey<T>(description?: string, reduce?: (values: readonly T[]) => T): MetadataKey<T> {
  return { description, reduce };
}

/**
 * Attaches a metadata `value` to the Field at `path` under `key`. The value may
 * be static or a reactive function of the field's context (read back reactively
 * through `$metadata`). A function value is treated as a getter; wrap an actual
 * function-typed value in `() => fn` to store it verbatim.
 */
export function metadata<T, V>(path: SchemaPath<T>, key: MetadataKey<V>, value: V | ((ctx: FieldContext<T>) => V)): void {
  const get: (ctx: FieldContext<T>) => V = typeof value === 'function' ? (value as (ctx: FieldContext<T>) => V) : () => value;
  addRule(path, METADATA, (ctx): MetadataEntry => ({
    key: key as MetadataKey<unknown>,
    value: get(ctx as FieldContext<T>),
  }));
}

// ---------------------------------------------------------------------------
// Built-in limit keys — published by the matching built-in validators, so the
// view can read a field's declared constraints. Their `reduce` keeps the *most
// restrictive* value when a field carries several.
// ---------------------------------------------------------------------------

/** The largest `min(...)` bound declared on a field (most restrictive lower bound). */
export const MIN = createMetadataKey<number>('min', (vs) => Math.max(...vs));
/** The smallest `max(...)` bound declared on a field (most restrictive upper bound). */
export const MAX = createMetadataKey<number>('max', (vs) => Math.min(...vs));
/** The largest `minLength(...)` bound declared on a field. */
export const MIN_LENGTH = createMetadataKey<number>('minLength', (vs) => Math.max(...vs));
/** The smallest `maxLength(...)` bound declared on a field. */
export const MAX_LENGTH = createMetadataKey<number>('maxLength', (vs) => Math.min(...vs));
/** The `pattern(...)` a field must match (last-declared wins). */
export const PATTERN = createMetadataKey<RegExp>('pattern');
/** True when a field carries `required(...)`. */
export const REQUIRED = createMetadataKey<boolean>('required', (vs) => vs.some(Boolean));
