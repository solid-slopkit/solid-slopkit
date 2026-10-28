import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import type { ResolvedI18nOptions } from './options';
import { TYPES_DIR, typesFileFor } from './paths';
import { readTranslations } from './read';
import { generateTypes } from './types';
import type { Diagnostic } from './validate';

export interface FileResult {
  /** Absolute path of the translation file. */
  file: string;
  diagnostics: Diagnostic[];
  /** True when the declaration file was (re)written. */
  written: boolean;
}

const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage']);

/** Every translation file under `root`, skipping `node_modules`, build output and dot-directories. */
export function findTranslationFiles(root: string, suffix: string): string[] {
  const found: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name) && !entry.name.startsWith('.')) walk(join(directory, entry.name));
      } else if (entry.name.endsWith(suffix)) {
        found.push(join(directory, entry.name));
      }
    }
  };
  walk(root);
  return found.sort();
}

/** Parses and validates one translation file and writes its declaration file when it is valid and changed. */
export function processFile(root: string, file: string, options: ResolvedI18nOptions): FileResult {
  const { diagnostics, defaultMessages } = readTranslations(file, options);
  const types = defaultMessages ? generateTypes(defaultMessages) : undefined;

  let written = false;
  if (types !== undefined) {
    const target = typesFileFor(root, file, options.suffix);
    // Only touch the file when it changed, so a TypeScript watcher is not restarted for nothing.
    if (!existsSync(target) || readFileSync(target, 'utf8') !== types) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, types);
      written = true;
    }
  }
  return { file, diagnostics, written };
}

/** Removes declaration files whose translation file no longer exists. */
export function pruneTypes(root: string, sources: readonly string[], options: ResolvedI18nOptions): string[] {
  const keep = new Set(sources.map((file) => typesFileFor(root, file, options.suffix)));
  const removed: string[] = [];
  const walk = (directory: string) => {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (!keep.has(path)) {
        rmSync(path);
        removed.push(path);
      }
    }
  };
  walk(join(root, TYPES_DIR));
  return removed;
}

/** One pass over the project: validate every translation file, write the declaration files, drop stale ones. */
export function generateAll(root: string, options: ResolvedI18nOptions): FileResult[] {
  const files = findTranslationFiles(root, options.suffix);
  const results = files.map((file) => processFile(root, file, options));
  pruneTypes(root, files, options);
  return results;
}

export function formatDiagnostic(root: string, file: string, diagnostic: Diagnostic): string {
  return `${relative(root, file)}: ${diagnostic.message}`;
}
