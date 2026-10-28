import { addRule, DISABLED, HIDDEN, READONLY, type FieldContext, type SchemaPath } from './schema';

/**
 * Field conditions (CONTEXT.md: Disabled / Hidden / Readonly) — Logic Rules that
 * put a Field into a state rather than validating its value. Each is authored by
 * pointing at a Schema Path, optionally with a reactive condition:
 *
 *   disabled(path.coupon)                 // always disabled
 *   disabled(path.coupon, (c) => !c.valueOf(path.hasCoupon))  // conditional
 *
 * The condition runs in the field's `FieldContext`, so it re-derives as the Model
 * changes. Omitting it means the condition is unconditionally on.
 *
 * Propagation (see form.ts): a Container in one of these states puts its whole
 * subtree in it too — a disabled group disables every descendant, etc. Semantics:
 * **Disabled** excludes the field from the form's effective value and submission;
 * **Hidden** removes it from the view but keeps it in the value; **Readonly**
 * keeps it visible and submitted but not editable.
 */

/** A reactive predicate for a condition rule, run in the field's context. */
export type Condition<T> = (ctx: FieldContext<T>) => boolean;

/** Adds a condition rule; an omitted predicate is unconditionally true. */
function condition<T>(kind: string, path: SchemaPath<T>, cond?: Condition<T>): void {
  addRule(path, kind, cond ? (ctx) => cond(ctx as FieldContext<T>) : () => true);
}

/** Marks a field disabled — excluded from the effective value (CONTEXT.md: Disabled). */
export function disabled<T>(path: SchemaPath<T>, cond?: Condition<T>): void {
  condition(DISABLED, path, cond);
}

/** Marks a field hidden — removed from the view, kept in the value (CONTEXT.md: Hidden). */
export function hidden<T>(path: SchemaPath<T>, cond?: Condition<T>): void {
  condition(HIDDEN, path, cond);
}

/** Marks a field readonly — visible and submitted, but not editable (CONTEXT.md: Readonly). */
export function readonly<T>(path: SchemaPath<T>, cond?: Condition<T>): void {
  condition(READONLY, path, cond);
}
