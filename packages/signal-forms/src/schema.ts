import type { Accessor, Store } from 'solid-js';
import { normalizeKey, readPath, type PathKey } from './internal';

/**
 * Schema authoring (CONTEXT.md: Schema, Schema Path, Logic Rule).
 *
 * A schema function receives a **Schema Path** tree mirroring the Model and
 * attaches Logic Rules by pointing at paths — `required(path.name)`. A Schema
 * Path is an authoring *locator*, not a live Field Node: navigating it only
 * records a path. Rules are collected into the ambient schema being built.
 */

// ---------------------------------------------------------------------------
// Schema Path
// ---------------------------------------------------------------------------

// Runtime carrier for a Schema Path's key list, and a phantom type brand so
// `validate(path, fn)` can infer the value type a rule sees.
const PATH = Symbol('@solid-slopkit/signal-forms/path');
declare const VALUE: unique symbol;

interface SchemaPathBrand<T> {
  /** phantom — never present at runtime */
  readonly [VALUE]?: T;
}

/** A navigable authoring locator over a value of type `T`. */
export type SchemaPath<T> = SchemaPathBrand<T> & SchemaPathNav<T>;

type SchemaPathNav<T> =
  NonNullable<T> extends readonly (infer E)[]
    ? { readonly [index: number]: SchemaPath<E> }
    : NonNullable<T> extends object
      ? { readonly [K in keyof NonNullable<T>]-?: SchemaPath<NonNullable<T>[K]> }
      : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {};

/** Reads the key list a Schema Path points at. */
export function pathOf(p: SchemaPath<unknown>): readonly PathKey[] {
  return (p as unknown as Record<symbol, readonly PathKey[]>)[PATH]!;
}

function createSchemaPath(path: readonly PathKey[]): SchemaPath<unknown> {
  const children = new Map<PathKey, SchemaPath<unknown>>();
  const handler: ProxyHandler<Record<never, never>> = {
    get(_target, prop) {
      if (prop === PATH) return path;
      if (typeof prop === 'symbol') return undefined;
      const key = normalizeKey(prop);
      let child = children.get(key);
      if (child === undefined) {
        child = createSchemaPath([...path, key]);
        children.set(key, child);
      }
      return child;
    },
  };
  return new Proxy(Object.create(null) as Record<never, never>, handler) as SchemaPath<unknown>;
}

// ---------------------------------------------------------------------------
// Logic context
// ---------------------------------------------------------------------------

/**
 * The read-only context a Logic Rule runs in. `value()` reads the target
 * field; `valueOf(path)` reads any field. Both track (rules run reactively).
 *
 * When the rule comes from a Structure Combinator (`apply`/`applyEach`/…), the
 * combinator scopes `valueOf` so that Schema Paths resolve *relative to where
 * the sub-schema was attached* — a reusable schema referencing `p.city` reads
 * the city under its own target, not the form root.
 */
export interface FieldContext<TValue = unknown> {
  /** This field's current value. */
  readonly value: Accessor<TValue>;
  /** Any field's current value, by Schema Path. */
  valueOf<U>(path: SchemaPath<U>): U;
}

/**
 * The richer context the runtime actually builds — `FieldContext` plus the
 * concrete field path and a low-level `read`. Combinators use these to re-scope
 * `valueOf`; the public `FieldContext` hides them.
 */
export interface InternalFieldContext<TValue = unknown> extends FieldContext<TValue> {
  /** The concrete field path this context reads for. */
  readonly path: readonly PathKey[];
  /** The scope root that relative Schema Paths in `valueOf` resolve under. */
  readonly base: readonly PathKey[];
  /** Reads the store root at an absolute key list (tracks). */
  read(keys: readonly PathKey[]): unknown;
}

/** Builds a root-scoped FieldContext for `path` over the live store `root`. */
export function createFieldContext<TValue>(root: Store<unknown>, path: readonly PathKey[]): InternalFieldContext<TValue> {
  const read = (keys: readonly PathKey[]) => readPath(root, keys);
  return {
    path,
    base: [],
    read,
    value: () => read(path) as TValue,
    valueOf: <U>(p: SchemaPath<U>) => read(pathOf(p)) as U,
  };
}

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------

/**
 * A validation failure a Field reports (CONTEXT.md: Validation Error). Yielded
 * by `$errors()`; `field` is the path of the Field it belongs to.
 */
export interface ValidationError {
  /** The failure kind — `required`, `min`, `email`, or an author's own. */
  readonly kind: string;
  /** Path of the Field this error belongs to. */
  readonly field: readonly PathKey[];
  /** Optional human-readable message. */
  readonly message?: string;
}

/**
 * What a Validator returns for one failure — a Validation Error without its
 * `field`, which the runtime attaches from the rule's path. Built with `error()`.
 */
export type ValidationErrorSpec = Omit<ValidationError, 'field'>;

/** The `kind` marking a Logic Rule as a Validator (its `run` yields error specs). */
export const VALIDATE = 'validate';
/**
 * The `kind` marking a Logic Rule as an *asynchronous* Validator (v2): its `run`
 * yields a `Promise` of error specs. The runtime drives these through an owned
 * effect and surfaces the in-flight state as `$pending` (see form.ts).
 */
export const VALIDATE_ASYNC = 'validateAsync';
/**
 * The `kind` marking a Logic Rule as a **Standard Schema** validator (v2): its
 * `run` returns the raw `~standard.validate` result (sync or a Promise) for the
 * field's value, and the runtime maps each issue's `path` onto the matching
 * descendant Field (see form.ts). Interops with zod / valibot / any conforming
 * library (see standard-schema.ts).
 */
export const VALIDATE_STANDARD = 'validateStandard';
/**
 * The `kind` marking a Logic Rule as **Metadata** (v2): its `run` returns a
 * `{ key, value }` pair describing the field rather than validating it. Read back
 * through a field's `$metadata(key)` (see form.ts, metadata.ts).
 */
export const METADATA = 'metadata';

// Condition rule kinds. Each carries a `run` that returns a boolean —
// the field is in that condition when any rule of the kind at its path is true.
/** A Logic Rule that marks a field disabled (excluded from the effective value). */
export const DISABLED = 'disabled';
/** A Logic Rule that marks a field hidden (removed from the view). */
export const HIDDEN = 'hidden';
/** A Logic Rule that marks a field readonly (visible + submitted, not editable). */
export const READONLY = 'readonly';

// ---------------------------------------------------------------------------
// Rules & schema collection
// ---------------------------------------------------------------------------

/**
 * A wildcard path segment. Matches any single key at that position —
 * how `applyEach` targets every item of an array whose length isn't known at
 * authoring time: the item rules live at `[...arrayPath, WILDCARD, ...itemPath]`.
 */
export const WILDCARD = Symbol('@solid-slopkit/signal-forms/wildcard');

/** A rule's target path — model keys, with `WILDCARD` standing for "any index". */
export type RulePath = readonly (PathKey | typeof WILDCARD)[];

/** A Logic Rule bound to a path. `run` returns a rule-kind-specific result. */
export interface Rule {
  readonly path: RulePath;
  readonly kind: string;
  readonly run: (ctx: FieldContext) => unknown;
}

/** True when `rulePath` (which may hold `WILDCARD`s) matches a concrete field path. */
export function ruleMatches(rulePath: RulePath, path: readonly PathKey[]): boolean {
  if (rulePath.length !== path.length) return false;
  for (let i = 0; i < path.length; i++) {
    const seg = rulePath[i];
    if (seg !== WILDCARD && seg !== path[i]) return false;
  }
  return true;
}

/** The Logic Rules targeting a concrete field path, in declaration order. */
export function resolveRules(rules: readonly Rule[], path: readonly PathKey[]): readonly Rule[] {
  return rules.filter((r) => ruleMatches(r.path, path));
}

/** A reusable, model-shaped bundle of Logic Rules (CONTEXT.md: Schema). */
// `T` is a phantom parameter: it makes a Schema contravariant in the model it is attached to.
// oxlint-disable-next-line eslint/no-unused-vars
export interface Schema<in T> {
  readonly rules: readonly Rule[];
}

export type SchemaFn<T> = (path: SchemaPath<T>) => void;
export type SchemaOrFn<T> = Schema<T> | SchemaFn<T>;

// Ambient collection target while a schema function runs.
let activeRules: Rule[] | null = null;

/**
 * Registers a Logic Rule at `path` into the schema currently being built.
 * Validators call this; exported for the lib, not the public index.
 */
export function addRule<T>(path: SchemaPath<T>, kind: string, run: (ctx: FieldContext<T>) => unknown): void {
  if (activeRules === null) {
    throw new Error('@solid-slopkit/signal-forms: a logic rule was declared outside a schema function');
  }
  activeRules.push({
    path: pathOf(path),
    kind,
    run: run as (ctx: FieldContext) => unknown,
  });
}

/**
 * Registers an already-formed Rule into the schema being built — the primitive
 * the Structure Combinators use to push rules they've rebased onto a
 * new path (with `WILDCARD`s, for `applyEach`).
 */
export function addRawRule(rule: Rule): void {
  if (activeRules === null) {
    throw new Error('@solid-slopkit/signal-forms: a logic rule was declared outside a schema function');
  }
  activeRules.push(rule);
}

/** Runs `fn` against a fresh root Schema Path, collecting the rules it declares. */
export function collectRules<T>(fn: SchemaFn<T>): Rule[] {
  const previous = activeRules;
  const rules: Rule[] = [];
  activeRules = rules;
  try {
    fn(createSchemaPath([]) as SchemaPath<T>);
  } finally {
    activeRules = previous;
  }
  return rules;
}

/** Builds a reusable Schema from a schema function (CONTEXT.md: Schema). */
export function schema<T>(fn: SchemaFn<T>): Schema<T> {
  return { rules: collectRules(fn) };
}

/** Normalizes a schema-or-function argument to its rule list. */
export function rulesOf<T>(def: SchemaOrFn<T>): readonly Rule[] {
  return typeof def === 'function' ? collectRules(def) : def.rules;
}
