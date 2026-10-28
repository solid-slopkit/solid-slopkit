import { createSignal, createMemo, createEffect, createRoot, flush, onCleanup, getOwner, runWithOwner, snapshot } from 'solid-js';
import type { Accessor, Store, StoreSetter } from 'solid-js';
import { deepEqual, normalizeKey, pathKeyString, readPath, type PathKey } from './internal';
import {
  createFieldContext,
  resolveRules,
  rulesOf,
  DISABLED,
  HIDDEN,
  READONLY,
  VALIDATE,
  VALIDATE_ASYNC,
  VALIDATE_STANDARD,
  METADATA,
  type FieldContext,
  type Rule,
  type SchemaOrFn,
  type ValidationError,
  type ValidationErrorSpec,
} from './schema';
import type { StandardSchemaV1 } from './standard-schema';
import type { MetadataKey, MetadataEntry } from './metadata';

/**
 * A Field over a value of type `T` (CONTEXT.md: Field).
 *
 * Navigation is direct property access — `f.address.street` — where any Model
 * key is a valid step. State is read/driven through `$`-prefixed accessors
 *. A node over an object/array (a Container) also exposes its
 * children; a node over a primitive (a Leaf) has state only.
 */
export type Field<T> = FieldState<T> & FieldChildren<T>;

/** The `$`-prefixed state accessors and actions of a Field Node.  */
export type FieldState<T> = {
  /** Reads this field's current value from the store, reactively. */
  readonly $value: Accessor<T>;
  /** Writes this field's value through the store's draft setter. */
  readonly $set: (next: T) => void;
  /** True when the current value differs from the initial value (deep). */
  readonly $dirty: Accessor<boolean>;
  /** True once the field has been visited and left (see `$markTouched`). */
  readonly $touched: Accessor<boolean>;
  /** Marks the field touched — bound to input blur */
  readonly $markTouched: () => void;
  /** Restores this field's value to its initial snapshot and clears touched. */
  readonly $reset: () => void;
  /** This field's own Validation Errors, re-derived as its value changes. */
  readonly $errors: Accessor<readonly ValidationError[]>;
  /** True when this field has no Validation Errors of its own. */
  readonly $valid: Accessor<boolean>;
  /** The negation of `$valid`. */
  readonly $invalid: Accessor<boolean>;
  /** True when disabled by a rule here or inherited from a Container ancestor. */
  readonly $disabled: Accessor<boolean>;
  /** True when hidden by a rule here or inherited from a Container ancestor. */
  readonly $hidden: Accessor<boolean>;
  /** True when readonly by a rule here or inherited from a Container ancestor. */
  readonly $readonly: Accessor<boolean>;
  /** True while an async Validator here (or on any descendant) is in flight (v2). */
  readonly $pending: Accessor<boolean>;
  /**
   * Reads this field's Metadata for `key`, reactively (v2) — the value declared by
   * `metadata(path, key, …)` (or by a built-in validator's limit key), reduced per
   * the key when several are declared, or `undefined` when none is.
   */
  readonly $metadata: <V>(key: MetadataKey<V>) => V | undefined;
  /** True while a `submit(form, …)` handler is in flight — one shared, form-wide fact. */
  readonly $submitting: Accessor<boolean>;
};

type FieldChildren<T> =
  NonNullable<T> extends readonly (infer E)[]
    ? { readonly [index: number]: Field<E> }
    : NonNullable<T> extends object
      ? {
          readonly [K in keyof NonNullable<T>]-?: Field<NonNullable<T>[K]>;
        }
      : // Leaf: no children.
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {};

/** The reactive form returned by `form()` — the root Field over the whole Model (CONTEXT.md: Signal Form). */
export type SignalForm<T> = Field<T>;

// State-accessor names are `$`-prefixed and reserved on every node. A Model key
// that starts with `$` collides with them; that's an accepted edge.
const STATE_ACCESSORS = new Set<string>([
  '$value',
  '$set',
  '$dirty',
  '$touched',
  '$markTouched',
  '$reset',
  '$errors',
  '$valid',
  '$invalid',
  '$disabled',
  '$hidden',
  '$readonly',
  '$pending',
  '$metadata',
  '$submitting',
]);

/** Shared empty result for fields with no rules — avoids per-read allocation. */
const NO_ERRORS: readonly ValidationError[] = [];

/** Appends a validator result's spec(s) to `out`, stamping each with `field`. */
function pushSpecs(result: unknown, field: readonly PathKey[], out: ValidationError[]): void {
  if (result == null) return;
  const specs = (Array.isArray(result) ? result : [result]) as readonly (ValidationErrorSpec | null | undefined)[];
  for (const spec of specs) {
    if (spec) out.push({ kind: spec.kind, field, message: spec.message });
  }
}

/** Errors keyed by a field's path *relative* to a Standard Schema's own field. */
type StandardErrorMap = ReadonlyMap<string, readonly ValidationError[]>;
/** Shared empty map for fields/schemas with no Standard Schema issues. */
const EMPTY_MAP: StandardErrorMap = new Map();

/** A thenable — how a Standard Schema signals an asynchronous `validate`. */
function isThenable(x: unknown): x is PromiseLike<unknown> {
  return x != null && (typeof x === 'object' || typeof x === 'function') && typeof (x as { then?: unknown }).then === 'function';
}

/** Normalizes a Standard Schema issue path to model PathKeys (symbols stringified). */
function issueSegments(issuePath: StandardSchemaV1.Issue['path']): readonly PathKey[] {
  if (!issuePath || issuePath.length === 0) return [];
  return issuePath.map((seg) => {
    const key = typeof seg === 'object' && seg !== null ? (seg as StandardSchemaV1.PathSegment).key : seg;
    return typeof key === 'number' ? key : String(key);
  });
}

/**
 * Folds Standard Schema `validate` results into a map from each issue's path
 * (relative to the schema's own field, joined) to the errors landing there. The
 * schema's own field is the empty-path key. Returns `null` when there are no
 * issues, so callers can share `EMPTY_MAP`.
 */
function buildStandardMap(results: readonly unknown[], path: readonly PathKey[]): StandardErrorMap | null {
  let map: Map<string, ValidationError[]> | null = null;
  for (const result of results) {
    const issues = (result as StandardSchemaV1.Result<unknown> | null | undefined)?.issues;
    if (!issues) continue;
    for (const issue of issues) {
      const segs = issueSegments(issue.path);
      const key = pathKeyString(segs);
      const err: ValidationError = {
        kind: 'standard',
        field: segs.length ? [...path, ...segs] : path,
        message: issue.message,
      };
      if (!map) map = new Map();
      const list = map.get(key);
      if (list) list.push(err);
      else map.set(key, [err]);
    }
  }
  return map;
}

/**
 * Structural equality for two error lists — the `$errors` memo's comparator, so a
 * recompute that yields the *same* errors (a common case: editing one valid field
 * leaves every other field's errors untouched) doesn't fan out to consumers. The
 * empty case already shares `NO_ERRORS`, so this only matters for stable non-empty
 * sets.
 *
 * Either side may be `undefined`: Solid can compare a memo's first computation
 * against a previous value it never had (a lazy memo created inside a held
 * transition and first read after it lands). No previous list is never equal
 * to a computed one.
 */
function errorsEqual(a: readonly ValidationError[] | undefined, b: readonly ValidationError[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (x.kind !== y.kind || x.message !== y.message) return false;
    if (x.field.length !== y.field.length) return false;
    for (let j = 0; j < x.field.length; j++) {
      if (x.field[j] !== y.field[j]) return false;
    }
  }
  return true;
}

/** Per-form context shared by every node. */
interface FormCtx {
  readonly root: Store<unknown>;
  readonly setRoot: StoreSetter<unknown>;
  /** Plain deep snapshot of the model at `form()` time — the dirty/reset baseline. */
  readonly initial: unknown;
  /** The schema's Logic Rules, in declaration order (may carry `WILDCARD` paths). */
  readonly rules: readonly Rule[];
  /** True when any rule is a Standard Schema validator — gates the ancestor walk. */
  readonly hasStandard: boolean;
  /** In-flight submission state, shared by every node's `$submitting`. */
  readonly submitting: Accessor<boolean>;
  readonly setSubmitting: (v: boolean) => void;
  /** True from the start of a `submit` call (including its wait for validation) until it settles. */
  readonly busy: { current: boolean };
  /**
   * The form's Solid owner, captured at `form()`. Every node's derived
   * memos are pinned to it via `runWithOwner`, so a memo created the first time a
   * node is navigated — which may happen lazily inside some *other* computation's
   * scope — still lives as long as the form, not that transient scope.
   */
  readonly owner: ReturnType<typeof getOwner>;
}

/** Internal per-node state; the closures over it back the `$`-accessors. */
interface NodeInternal {
  readonly proxy: Field<unknown>;
  /** This node's absolute path — used to compute relative paths for standard errors. */
  readonly path: readonly PathKey[];
  /** Parent node, or null at the root — walked to collect ancestor standard errors. */
  readonly parent: NodeInternal | null;
  readonly children: Map<PathKey, NodeInternal>;
  readonly clearTouchedDeep: () => void;
  /** Marks this field and every descendant touched — the submit-time sweep. */
  readonly markTouchedDeep: () => void;
  /** Get-or-create the child node at `key` (numeric-looking keys normalized). */
  readonly childNode: (key: PathKey) => NodeInternal;
  /** Aggregate errors — own plus every enabled descendant's. */
  readonly errors: Accessor<readonly ValidationError[]>;
  /** Aggregate touched — this field or any descendant touched. */
  readonly touchedAgg: Accessor<boolean>;
  /** Aggregate pending — an async Validator here or on any descendant is in flight (v2). */
  readonly pending: Accessor<boolean>;
  /** Standard Schema errors declared at *this* node, keyed by descendant-relative path (v2). */
  readonly standardErrors: Accessor<StandardErrorMap>;
  /** Condition accessors, so a child can inherit an ancestor's state. */
  readonly disabled: Accessor<boolean>;
  readonly hidden: Accessor<boolean>;
  readonly readonly: Accessor<boolean>;
}

/** The keys of a Container value, as PathKeys — array indices or object keys. */
function childKeys(value: object): readonly PathKey[] {
  return Array.isArray(value) ? value.map((_, i) => i) : Object.keys(value);
}

/** Writes `next` into the store draft at `path` (replacing the root when empty). */
function writeAtPath(ctx: FormCtx, path: readonly PathKey[], next: unknown): void {
  if (path.length === 0) {
    ctx.setRoot(() => next as never);
    return;
  }
  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];
  ctx.setRoot((draft) => {
    const parent = readPath(draft, parentPath);
    if (parent != null) {
      (parent as Record<PathKey, unknown>)[last!] = next;
    }
  });
}

/**
 * Drives the Standard Schema validators at one node. Like the async-validator
 * effect (and for the same reason — imperative write-back), its compute runs each
 * schema's `validate` against the node's value (tracking the reads) and its effect
 * phase publishes the resulting errors, keyed by descendant-relative path, into a
 * signal every descendant reads. A schema whose `validate` returns synchronously
 * settles within the same flush and is never pending; one returning a Promise
 * flips `pending` until it resolves. The generation counter drops superseded runs;
 * an owner-scoped `disposed` flag drops resolutions arriving after teardown.
 */
function createStandardDriver(
  ctx: FormCtx,
  path: readonly PathKey[],
  fieldCtx: FieldContext,
  rules: readonly Rule[],
  disabled: Accessor<boolean>,
): { errors: Accessor<StandardErrorMap>; pending: Accessor<boolean> } {
  const label = path.length ? path.join('.') : 'root';
  const [errs, setErrs] = createSignal<StandardErrorMap>(EMPTY_MAP, { name: `standardErrors@${label}` });
  const [pending, setPending] = createSignal(false, { name: `standardPending@${label}` });
  let generation = 0;
  let disposed = false;
  runWithOwner(ctx.owner, () => {
    onCleanup(() => {
      disposed = true;
    });
    createEffect(
      () => {
        const gen = ++generation;
        const results: unknown[] = [];
        if (!disabled()) {
          for (const rule of rules) {
            try {
              results.push(rule.run(fieldCtx));
            } catch (e) {
              results.push(Promise.reject(e));
            }
          }
        }
        return { gen, results };
      },
      ({ gen, results }) => {
        if (!results.some(isThenable)) {
          // All synchronous (or disabled → empty): settle immediately.
          setErrs(buildStandardMap(results, path) ?? EMPTY_MAP);
          setPending(false);
          return;
        }
        setPending(true);
        void Promise.all(results.map((r) => Promise.resolve(r)))
          .then((all) => {
            if (disposed || gen !== generation) return;
            setErrs(buildStandardMap(all, path) ?? EMPTY_MAP);
            setPending(false);
          })
          .catch(() => {
            if (disposed || gen !== generation) return;
            setErrs(EMPTY_MAP);
            setPending(false);
          });
      },
      { name: `standardValidate@${label}` },
    );
  });
  return { errors: errs, pending };
}

function createNode(ctx: FormCtx, path: readonly PathKey[], parent: NodeInternal | null): NodeInternal {
  const children = new Map<PathKey, NodeInternal>();
  // `label` feeds diagnostics attribution on every scope this node owns.
  const label = path.length ? path.join('.') : 'root';
  const [touched, setTouched] = createSignal(false, { name: `touched@${label}` });

  const value: Accessor<unknown> = () => readPath(ctx.root, path);
  const initialValue = () => readPath(ctx.initial, path);

  // Derived aggregate state is a lazy, pull-based memo
  // pinned to the form owner, so a Container's rollup recomputes at
  // most once per relevant change and only fans out to consumers when its result
  // actually changes — an edit to one valid field no longer re-runs every
  // `$valid()`/`$errors()` reader elsewhere. `name` feeds diagnostics attribution.
  // `lazy` defers the first computation to first read — so the memo bodies below
  // may reference `childNode` (declared later) without a TDZ, and an unnavigated
  // subtree's memos never compute. While observed (read inside an effect/JSX) the
  // memo stays cached and only notifies when its value changes; unobserved, it
  // recomputes on demand like the plain accessors it replaced — pull-based, no
  // teardown. Owner-pinned so lazy creation in a foreign scope is safe.
  const memo = <V>(fn: () => V, name: string, equals?: (prev: V, next: V) => boolean): Accessor<V> =>
    runWithOwner(ctx.owner, () => createMemo(fn, { name: `${name}@${label}`, equals, lazy: true })) as Accessor<V>;

  // Reading value() through deepEqual tracks the store, so dirty is reactive;
  // for a Container it reflects any descendant change.
  const dirty = memo(() => !deepEqual(value(), initialValue()), 'dirty');

  const set = (next: unknown) => writeAtPath(ctx, path, next);

  // Validation. The Validator rules at this path run against a FieldContext for
  // it; each reads value()/valueOf() (tracking the store), so $errors — and the
  // $valid/$invalid derived from it — recompute reactively as the Model changes.
  // Own-field only for now; Container rollups arrive.
  const fieldCtx = createFieldContext(ctx.root, path);
  // The Logic Rules targeting this exact path — exact-path rules plus any
  // WILDCARD rule (from `applyEach`) whose pattern matches. Resolved once: the
  // rule set is static after `form()`; only the rules' *results* are reactive.
  const rules = resolveRules(ctx.rules, path);

  const ownErrors: Accessor<readonly ValidationError[]> = () => {
    if (rules.length === 0) return NO_ERRORS;
    const out: ValidationError[] = [];
    for (const rule of rules) {
      if (rule.kind !== VALIDATE) continue;
      pushSpecs(rule.run(fieldCtx), path, out);
    }
    return out;
  };

  // Conditions. A field is in a condition when any rule of that kind
  // at its path runs true, OR when it inherits the condition from an ancestor
  // Container — so a disabled/hidden/readonly group carries its whole subtree.
  // The rule `run`s read the store through `fieldCtx`, so these track and
  // re-derive reactively as the Model changes. (Defined before the aggregates
  // below, which skip disabled subtrees.)
  const ownCondition = (kind: string): boolean => {
    for (const rule of rules) {
      if (rule.kind === kind && rule.run(fieldCtx)) return true;
    }
    return false;
  };
  const disabled: Accessor<boolean> = () => ownCondition(DISABLED) || (parent ? parent.disabled() : false);
  const hidden: Accessor<boolean> = () => ownCondition(HIDDEN) || (parent ? parent.hidden() : false);
  const readonly: Accessor<boolean> = () => ownCondition(READONLY) || (parent ? parent.readonly() : false);

  // Async validators (v2). Producing async results needs imperative write-back,
  // so this is the one Field-State fact driven by an owned *effect* rather than a
  // lazy pull-memo: the effect's compute runs each async rule's
  // synchronous prefix — tracking the reads made before its first `await`, the
  // same rule Solid's async memos follow — and returns the in-flight promises;
  // the effect phase (imperative, writes allowed) flips `pending` and, when the
  // latest run settles, writes the resolved errors. A `generation` counter drops
  // stale resolutions: a superseded run, or one that lands after teardown (the
  // effect's cleanup bumps it). Disabled fields validate nothing (gated in the
  // compute, which reads `disabled()` so it re-runs when the condition toggles),
  // so they are never pending and add no async errors — matching the sync path.
  const asyncRules = rules.filter((r) => r.kind === VALIDATE_ASYNC);
  let asyncErrors: Accessor<readonly ValidationError[]> = () => NO_ERRORS;
  let ownPending: Accessor<boolean> = () => false;
  if (asyncRules.length > 0) {
    const [errs, setErrs] = createSignal<readonly ValidationError[]>(NO_ERRORS, {
      equals: errorsEqual,
      name: `asyncErrors@${label}`,
    });
    const [pendingSig, setPending] = createSignal(false, { name: `asyncPending@${label}` });
    // Each compute run gets a fresh generation; a resolution only lands if it is
    // still the latest (drops superseded runs). `disposed` is a separate teardown
    // guard set once when the form owner disposes — kept out of the effect's own
    // cleanup, which fires between runs and would wrongly cancel the newest run.
    let generation = 0;
    let disposed = false;
    runWithOwner(ctx.owner, () => {
      onCleanup(() => {
        disposed = true;
      });
      createEffect(
        () => {
          const gen = ++generation;
          const promises: Promise<unknown>[] = [];
          if (!disabled()) {
            for (const rule of asyncRules) {
              try {
                promises.push(Promise.resolve(rule.run(fieldCtx)));
              } catch (e) {
                promises.push(Promise.reject(e));
              }
            }
          }
          return { gen, promises };
        },
        ({ gen, promises }) => {
          if (promises.length === 0) {
            // Disabled (or nothing to run): settle to a clean, not-pending state.
            setErrs(NO_ERRORS);
            setPending(false);
            return;
          }
          setPending(true);
          void Promise.all(promises)
            .then((results) => {
              if (disposed || gen !== generation) return; // torn down or superseded
              const out: ValidationError[] = [];
              for (const result of results) pushSpecs(result, path, out);
              setErrs(out.length ? out : NO_ERRORS);
              setPending(false);
            })
            .catch(() => {
              // A rejected async validator is treated as "no error" (fail-open);
              // authors surface transport failures by returning a spec instead.
              if (disposed || gen !== generation) return;
              setErrs(NO_ERRORS);
              setPending(false);
            });
        },
        { name: `asyncValidate@${label}` },
      );
    });
    asyncErrors = errs;
    ownPending = pendingSig;
  }

  // Standard Schema validators (v2). A schema attached here validates this node's
  // value and distributes its issues to descendants by path; the driver publishes
  // an errors-by-relative-path map that descendants read, and folds its in-flight
  // state into this node's `pending`.
  const standardRules = rules.filter((r) => r.kind === VALIDATE_STANDARD);
  let standardErrors: Accessor<StandardErrorMap> = () => EMPTY_MAP;
  if (standardRules.length > 0) {
    const driver = createStandardDriver(ctx, path, fieldCtx, standardRules, disabled);
    standardErrors = driver.errors;
    const priorPending = ownPending;
    ownPending = () => priorPending() || driver.pending();
  }

  // Standard Schema errors landing on *this* field — gathered by walking self and
  // every ancestor that carries a schema, looking up this field's path relative to
  // each. Only walked when the form uses Standard Schema at all (otherwise a plain
  // no-op), so ordinary forms pay nothing. `self`/`parent` are read lazily (the
  // first read happens well after the node is built).
  const standardOwn = (): readonly ValidationError[] => {
    let out: ValidationError[] | null = null;
    let anc: NodeInternal | null = self;
    while (anc) {
      const map = anc.standardErrors();
      if (map.size) {
        const errs = map.get(pathKeyString(path.slice(anc.path.length)));
        if (errs) (out ??= []).push(...errs);
      }
      anc = anc.parent;
    }
    return out ?? NO_ERRORS;
  };

  // This field's own errors — synchronous validators, then any settled async ones,
  // then any Standard Schema issues mapped here. Reading the async/standard signals
  // here tracks them, so the `errors` rollup below re-derives when a check resolves.
  const combinesExtra = asyncRules.length > 0 || ctx.hasStandard;
  const ownErrorsAll: Accessor<readonly ValidationError[]> = !combinesExtra
    ? ownErrors
    : () => {
        const sync = ownErrors();
        const async = asyncRules.length > 0 ? asyncErrors() : NO_ERRORS;
        const std = ctx.hasStandard ? standardOwn() : NO_ERRORS;
        if (async.length === 0 && std.length === 0) return sync;
        const out: ValidationError[] = [];
        for (const e of sync) out.push(e);
        for (const e of async) out.push(e);
        for (const e of std) out.push(e);
        return out;
      };

  // Aggregate state. A Container rolls up its descendants; a Leaf has
  // none, so each rollup collapses to its own value. The walk reads value() and
  // descends through childNode(), so it tracks both value edits and structural
  // changes (an added/removed key re-derives on its own). Disabled subtrees are
  // excluded from validity — a disabled field is pruned from the effective value
  // and reports no errors, so it never blocks its Container.
  const errors = memo<readonly ValidationError[]>(
    () => {
      if (disabled()) return NO_ERRORS;
      const own = ownErrorsAll();
      const v = value();
      if (v === null || typeof v !== 'object') return own; // Leaf
      const out: ValidationError[] = own.length ? own.slice() : [];
      for (const key of childKeys(v)) {
        for (const e of childNode(key).errors()) out.push(e);
      }
      return out.length ? out : NO_ERRORS;
    },
    'errors',
    errorsEqual,
  );
  const valid = memo(() => errors().length === 0, 'valid');
  const invalid: Accessor<boolean> = () => !valid();

  // Touched rolls up over all descendants (a disabled field can't be touched,
  // so no need to special-case it here).
  // oxlint-disable-next-line solid/reactivity -- `memo` is this file's named createMemo wrapper
  const touchedAgg = memo(() => {
    if (touched()) return true;
    const v = value();
    if (v === null || typeof v !== 'object') return false; // Leaf
    for (const key of childKeys(v)) {
      if (childNode(key).touchedAgg()) return true;
    }
    return false;
  }, 'touched');

  // Pending rolls up like touched: true when this field's own async validator is
  // in flight, or any descendant's is (v2). A disabled subtree runs no async
  // validators, so it contributes nothing — short-circuited here to avoid
  // materializing a disabled Container's children.
  const pendingAgg = memo(() => {
    if (ownPending()) return true;
    if (disabled()) return false;
    const v = value();
    if (v === null || typeof v !== 'object') return false; // Leaf
    for (const key of childKeys(v)) {
      if (childNode(key).pending()) return true;
    }
    return false;
  }, 'pending');

  const clearTouchedDeep = () => {
    setTouched(false);
    for (const child of children.values()) child.clearTouchedDeep();
  };

  // Submit marks the whole subtree touched so every field's errors surface. Walks
  // the live value shape (materializing nodes via childNode), so leaves that were
  // never navigated still get their touched signal set — mirrors touchedAgg.
  const markTouchedDeep = () => {
    setTouched(true);
    const v = value();
    if (v === null || typeof v !== 'object') return; // Leaf
    for (const key of childKeys(v)) childNode(key).markTouchedDeep();
  };

  const markTouched = () => setTouched(true);

  const reset = () => {
    // Restore this subtree's value to a fresh clone of its initial snapshot,
    // then clear touched across the subtree. Dirty derives to false on its own.
    writeAtPath(ctx, path, structuredClone(initialValue()));
    clearTouchedDeep();
  };

  // Metadata (v2). Runs the Metadata rules at this exact path, collecting the
  // values declared for `key`; reduces them per the key (most-restrictive for the
  // limit keys) or takes the last when a key has no reducer. A plain accessor like
  // `$errors` — it re-runs on read and tracks the store through any reactive value
  // getter, so metadata derived from the model updates reactively.
  const metaFn = <V>(key: MetadataKey<V>): V | undefined => {
    let values: V[] | null = null;
    for (const rule of rules) {
      if (rule.kind !== METADATA) continue;
      const entry = rule.run(fieldCtx) as MetadataEntry | null | undefined;
      if (entry && entry.key === key) (values ??= []).push(entry.value as V);
    }
    if (values === null) return undefined;
    if (values.length === 1) return values[0];
    return key.reduce ? key.reduce(values) : values[values.length - 1];
  };

  // Get-or-create a child, keyed by a normalized PathKey so f.items[0],
  // f.items['0'] and the effective-value walk all reach one node.
  let self: NodeInternal;
  const childNode = (key: PathKey): NodeInternal => {
    const k = typeof key === 'string' ? normalizeKey(key) : key;
    let child = children.get(k);
    if (child === undefined) {
      child = createNode(ctx, [...path, k], self);
      children.set(k, child);
    }
    return child;
  };

  const handler: ProxyHandler<Record<never, never>> = {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined;
      switch (prop) {
        case '$value':
          return value;
        case '$set':
          return set;
        case '$dirty':
          return dirty;
        case '$touched':
          return touchedAgg;
        case '$markTouched':
          return markTouched;
        case '$reset':
          return reset;
        case '$errors':
          return errors;
        case '$valid':
          return valid;
        case '$invalid':
          return invalid;
        case '$disabled':
          return disabled;
        case '$hidden':
          return hidden;
        case '$readonly':
          return readonly;
        case '$pending':
          return pendingAgg;
        case '$metadata':
          return metaFn;
        case '$submitting':
          return ctx.submitting;
      }
      // Navigation. Numeric-looking keys normalize so f.items[0] and
      // f.items['0'] resolve to the same node.
      return childNode(prop).proxy;
    },
    has(_target, prop) {
      return typeof prop === 'string' && STATE_ACCESSORS.has(prop);
    },
  };

  const proxy = new Proxy(Object.create(null) as Record<never, never>, handler) as Field<unknown>;

  self = {
    proxy,
    path,
    parent,
    children,
    clearTouchedDeep,
    markTouchedDeep,
    childNode,
    errors,
    touchedAgg,
    pending: pendingAgg,
    standardErrors,
    disabled,
    hidden,
    readonly,
  };
  return self;
}

/** Sentinel: a disabled subtree is omitted from the effective value entirely. */
const OMIT = Symbol('@solid-slopkit/signal-forms/omit');

/**
 * The effective value of a node's subtree — the value that would be submitted.
 * Disabled fields (own or inherited) are pruned: a disabled leaf/object key is
 * omitted, and disabled array items are dropped. Hidden and readonly fields are
 * kept (Hidden affects the view only; Readonly is still submitted). Reads the
 * store through indexing, so it tracks and re-derives when the Model changes.
 */
function effectiveValueOf(node: NodeInternal, value: unknown): unknown {
  if (node.disabled()) return OMIT;
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (let i = 0; i < value.length; i++) {
      const child = effectiveValueOf(node.childNode(i), value[i]);
      if (child !== OMIT) out.push(child);
    }
    return out;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const child = effectiveValueOf(node.childNode(key), (value as Record<string, unknown>)[key]);
      if (child !== OMIT) out[key] = child;
    }
    return out;
  }
  return value;
}

// Test seam: recover a form's internals from its tree.
interface FormRoots {
  readonly ctx: FormCtx;
  readonly root: NodeInternal;
}
const CTX = new WeakMap<object, FormRoots>();

/** Internal: the Logic Rules, FieldContext, and effective value of a form. */
export function formInternals<T>(tree: SignalForm<T>) {
  const found = CTX.get(tree as object);
  if (!found) throw new Error('@solid-slopkit/signal-forms: not a form tree');
  const { ctx, root } = found;
  return {
    rulesAt(path: readonly PathKey[]): readonly Rule[] {
      return resolveRules(ctx.rules, path);
    },
    contextAt<TValue>(path: readonly PathKey[]): FieldContext<TValue> {
      return createFieldContext<TValue>(ctx.root, path);
    },
    /** The form's effective (submitted) value — disabled fields pruned. */
    effectiveValue(): T {
      return effectiveValueOf(root, ctx.root) as T;
    },
  };
}

/** The action `submit` runs once the form is valid. It may be async; whatever it returns is ignored (a rejection propagates). */
export type SubmitHandler<T> = (value: T) => unknown;

/**
 * Submits a form. Marks every field touched so validation surfaces, waits for any
 * in-flight asynchronous validation to settle, then blocks if the form is invalid — using the same enabled-only rollup as
 * `$invalid` (a disabled subtree is excluded, matching the effective value). When
 * valid, runs `handler` with the effective value; while an async handler is in
 * flight, every node's `$submitting()` reads true (it clears when the handler
 * settles, even if it throws — the rejection then propagates to the caller).
 *
 * Returns a promise for the whole call (a resolved one when blocked), so a caller can
 * await completion. A call made while another submit is running is ignored. Call it from an event handler, never during render (Solid
 * forbids the touched/submitting writes in an owned scope).
 */
export async function submit<T>(tree: SignalForm<T>, handler: SubmitHandler<T>): Promise<void> {
  const found = CTX.get(tree as object);
  if (!found) throw new Error('@solid-slopkit/signal-forms: not a form tree');
  const { ctx, root } = found;

  // One submit at a time: a second call (a double click) is ignored until the first settles.
  if (ctx.busy.current) return;
  ctx.busy.current = true;
  try {
    root.markTouchedDeep();
    // Newly reached nodes start their asynchronous validators on the next flush;
    // flush now so `$pending` is accurate before deciding.
    flush();
    // Only wait when something is pending, so a plain submit starts its handler in the same tick.
    if (root.pending()) await whenSettled(ctx, root);
    if (root.errors().length !== 0) return; // invalid → blocked, but now shown

    ctx.setSubmitting(true);
    try {
      await handler(effectiveValueOf(root, ctx.root) as T);
    } finally {
      ctx.setSubmitting(false);
    }
  } finally {
    ctx.busy.current = false;
  }
}

/**
 * Resolves once no asynchronous validator under `root` is in flight, so `submit`
 * decides on settled errors. If the form's owner is disposed first, it resolves too
 * (the form is gone; nothing is left to wait for).
 */
function whenSettled(ctx: FormCtx, root: NodeInternal): Promise<void> {
  return new Promise<void>((resolve) => {
    createRoot((dispose) => {
      const done = () => {
        dispose();
        resolve();
      };
      createEffect(
        () => root.pending(),
        (pending) => {
          if (!pending) done();
        },
        { name: 'submit:settled' },
      );
      if (ctx.owner) runWithOwner(ctx.owner, () => onCleanup(done));
    });
  });
}

/**
 * Builds a Signal Form over a Solid store (CONTEXT.md: Signal Form, Field Tree).
 *
 * @param model    the store's read view (the Model source of truth)
 * @param setModel the store's draft-mutation setter
 * @param def      optional Schema or schema function attaching Logic Rules
 */
export function form<T extends object>(model: Store<T>, setModel: StoreSetter<T>, def?: SchemaOrFn<T>): SignalForm<T> {
  const [submitting, setSubmitting] = createSignal(false, { name: 'submitting' });
  const rules = def ? rulesOf(def) : [];
  const ctx: FormCtx = {
    root: model as Store<unknown>,
    setRoot: setModel as StoreSetter<unknown>,
    initial: snapshot(model),
    rules,
    hasStandard: rules.some((r) => r.kind === VALIDATE_STANDARD),
    submitting,
    setSubmitting,
    busy: { current: false },
    owner: getOwner(),
  };
  const root = createNode(ctx, [], null);
  const tree = root.proxy as SignalForm<T>;
  CTX.set(tree as object, { ctx, root });
  return tree;
}
