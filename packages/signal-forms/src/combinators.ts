import {
  addRawRule,
  collectRules,
  pathOf,
  rulesOf,
  WILDCARD,
  type FieldContext,
  type InternalFieldContext,
  type Rule,
  type RulePath,
  type SchemaFn,
  type SchemaOrFn,
  type SchemaPath,
} from './schema';
import type { PathKey } from './internal';

/**
 * Structure Combinators (CONTEXT.md) — Logic Rules that compose schemas across
 * the tree rather than validating a single field. Each is called inside a schema
 * function and re-bases another schema's rules onto a target path:
 *
 *   apply(path.shipping, addressSchema)
 *   applyWhen(path.shipping, (c) => c.valueOf(path.needsShipping), addressSchema)
 *   applyEach(path.items, (item) => required(item.sku))
 *
 * Rebasing prepends the target path to every rule the sub-schema declared, so a
 * rule authored at `city` lands at `shipping.city`. It also threads a **scope
 * base** through the rule's context: inside the sub-schema, `ctx.value()` still
 * reads the rule's own field, while `ctx.valueOf(p.city)` resolves under the
 * target — so reusable schemas compose without knowing where they'll attach.
 * `applyWhen`'s `cond` closes over the *caller's* path (form root at the top
 * level, the item inside `applyEach`), so it resolves against the enclosing
 * scope. This threading makes nesting — including `applyEach` within
 * `applyEach` and conditional applies within `applyEach` — resolve correctly.
 */

/** Re-scopes a rule context so relative Schema Paths resolve under `base`. */
function withBase(ctx: InternalFieldContext, base: readonly PathKey[]): InternalFieldContext {
  return {
    path: ctx.path,
    base,
    read: ctx.read,
    value: ctx.value,
    valueOf: <U>(p: SchemaPath<U>) => ctx.read([...base, ...pathOf(p)]) as U,
  };
}

/**
 * Rebases one rule under `prefix` and threads the scope base. `baseOf`-style
 * work is inlined: the new scope root is the enclosing base plus this prefix
 * (plus the matched index, for a `WILDCARD`/`applyEach` rule). An optional
 * `gate` (evaluated at the target, against the *enclosing* scope) makes the rule
 * conditional — yielding the neutral `null` when off (no errors / condition off).
 */
function rebase(prefix: readonly PathKey[], wildcard: boolean, rule: Rule, gate?: (ctx: FieldContext) => boolean): void {
  const inner = rule.run;
  const head: RulePath = wildcard ? [...prefix, WILDCARD] : prefix;
  addRawRule({
    path: [...head, ...rule.path],
    kind: rule.kind,
    run: (ctx) => {
      const ictx = ctx as InternalFieldContext;
      let base = [...ictx.base, ...prefix];
      if (wildcard) {
        // The matched array index sits right after `base` in the concrete path.
        const arr = ictx.read(base);
        const index = ictx.path[base.length]!;
        // Out-of-range once an item is removed: go neutral, no stale errors.
        // Reads length, so this re-derives as the array grows or shrinks.
        if (!Array.isArray(arr) || (index as number) >= arr.length) return null;
        base = [...base, index];
      }
      if (gate) {
        // `cond` sees the target's value, but resolves its own paths against the
        // enclosing scope (its `valueOf` is the incoming, un-rescoped one).
        const target = base;
        const gateCtx: FieldContext = {
          value: () => ictx.read(target),
          valueOf: ictx.valueOf,
        };
        if (!gate(gateCtx)) return null;
      }
      return inner(withBase(ictx, base));
    },
  });
}

/** Attaches `def`'s rules at `path`, each rebased under it (CONTEXT.md: apply). */
export function apply<T>(path: SchemaPath<T>, def: SchemaOrFn<T>): void {
  const prefix = pathOf(path);
  for (const rule of rulesOf(def)) rebase(prefix, false, rule);
}

/**
 * Attaches `def`'s rules at `path`, active only while `cond` (read at `path`)
 * holds. When inactive, each rebased rule yields the neutral result — no errors
 * for validators, "off" for conditions (CONTEXT.md: applyWhen).
 */
export function applyWhen<T>(path: SchemaPath<T>, cond: (ctx: FieldContext<T>) => boolean, def: SchemaOrFn<T>): void {
  const prefix = pathOf(path);
  const gate = (ctx: FieldContext) => cond(ctx as FieldContext<T>);
  for (const rule of rulesOf(def)) rebase(prefix, false, rule, gate);
}

/** `applyWhen` keyed off a predicate over the value at `path` (CONTEXT.md: applyWhenValue). */
export function applyWhenValue<T>(path: SchemaPath<T>, predicate: (value: T) => boolean, def: SchemaOrFn<T>): void {
  applyWhen(path, (ctx) => predicate(ctx.value()), def);
}

/**
 * Applies a per-item schema across every element of an array (CONTEXT.md:
 * applyEach). The item rules are collected once against a fresh item Schema Path
 * and stored at `[...arrayPath, WILDCARD, ...itemPath]`, so they resolve for
 * every concrete index — including indices that appear only after an insert.
 * Each rule's context is scoped to its own item, so `ctx.valueOf(item.sibling)`
 * reads that item's sibling.
 */
export function applyEach<E>(arrayPath: SchemaPath<readonly E[]>, itemFn: (item: SchemaPath<E>) => void): void {
  const prefix = pathOf(arrayPath);
  for (const rule of collectRules(itemFn as SchemaFn<E>)) {
    rebase(prefix, true, rule);
  }
}
