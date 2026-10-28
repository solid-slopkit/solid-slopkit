import { readFileSync } from 'node:fs';
import { parseJsonc } from './jsonc';
import type { ResolvedI18nOptions } from './options';
import { validateTranslations, type Validated } from './validate';

/** Reads, parses and validates one translation file; a file that is not valid JSON is a diagnostic, not a throw. */
export function readTranslations(file: string, options: ResolvedI18nOptions): Validated {
  try {
    return validateTranslations(parseJsonc(readFileSync(file, 'utf8')), options);
  } catch (cause) {
    return {
      diagnostics: [{ level: 'error', message: `invalid JSON: ${cause instanceof Error ? cause.message : String(cause)}` }],
    };
  }
}
