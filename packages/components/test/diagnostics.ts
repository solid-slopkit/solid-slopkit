import type { NoDiagnosticsOptions } from '@solidjs/diagnostics';

/**
 * Options for `toHaveNoDiagnostics()`. HOT_SCOPE_TIME measures wall-clock compute, so it fires at random on a
 * busy machine; re-run budgets and `toHaveNoWaste()` are the deterministic performance checks.
 */
export const NO_DIAGNOSTICS: NoDiagnosticsOptions = { allow: ['HOT_SCOPE_TIME'] };
