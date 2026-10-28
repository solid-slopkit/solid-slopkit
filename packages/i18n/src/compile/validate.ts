import { MessageSyntaxError } from '../message/ast';
import { handles, inferParams, type Params } from '../message/params';
import { parseMessage } from '../message/parse';
import type { ResolvedI18nOptions } from './options';

export interface Diagnostic {
  level: 'error' | 'warning';
  message: string;
}

/** A tree of messages: strings at the leaves. */
export interface MessageTree {
  [key: string]: string | MessageTree;
}

export interface Validated {
  diagnostics: Diagnostic[];
  /** The default locale's messages; the type source. Undefined when the file has errors that make it unusable. */
  defaultMessages?: MessageTree;
  /** Every locale's messages; present together with `defaultMessages`. */
  locales?: Map<string, MessageTree>;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Validates a parsed translation file: `{ "<locale>": { …messages… } }`. */
export function validateTranslations(value: unknown, options: ResolvedI18nOptions): Validated {
  const diagnostics: Diagnostic[] = [];
  const error = (message: string) => diagnostics.push({ level: 'error', message });

  if (!isObject(value)) {
    error('a translation file must be an object of locales: { "en": { … }, "de": { … } }');
    return { diagnostics };
  }

  const trees = new Map<string, MessageTree>();
  for (const [locale, messages] of Object.entries(value)) {
    if (!options.locales.includes(locale)) {
      error(`unknown locale "${locale}" (allowed: ${options.locales.join(', ')})`);
    } else if (!isObject(messages)) {
      error(`locale "${locale}" must be an object of messages`);
    } else {
      const tree = checkTree(messages, locale, error);
      if (tree) trees.set(locale, tree);
    }
  }

  const defaults = trees.get(options.defaultLocale);
  if (!(options.defaultLocale in value)) {
    error(`the default locale "${options.defaultLocale}" is missing: it defines the shape of the messages`);
  }
  if (defaults) {
    for (const [locale, tree] of trees) {
      if (locale !== options.defaultLocale) compare(defaults, tree, locale, options, diagnostics);
    }
  }

  const hasErrors = diagnostics.some((d) => d.level === 'error');
  return hasErrors || !defaults ? { diagnostics } : { diagnostics, defaultMessages: defaults, locales: trees };
}

/** Checks keys and leaves of one locale; returns the tree, or undefined when it holds a bad entry. */
function checkTree(node: Record<string, unknown>, path: string, error: (message: string) => void): MessageTree | undefined {
  const tree: MessageTree = {};
  let ok = true;
  for (const [key, child] of Object.entries(node)) {
    const at = `${path}.${key}`;
    if (key === '' || key.includes('.')) {
      error(`${at}: keys must not be empty or contain "."`);
      ok = false;
    } else if (typeof child === 'string') {
      const problem = messageProblem(child);
      if (problem) {
        error(`${at}: ${problem}`);
        ok = false;
      } else {
        tree[key] = child;
      }
    } else if (isObject(child)) {
      const sub = checkTree(child, at, error);
      if (sub) tree[key] = sub;
      else ok = false;
    } else {
      error(`${at}: a message must be a string or a group of messages, not ${describe(child)}`);
      ok = false;
    }
  }
  return ok ? tree : undefined;
}

/** The reason a message cannot be compiled, if any. */
function messageProblem(text: string): string | undefined {
  try {
    inferParams(parseMessage(text));
  } catch (cause) {
    if (cause instanceof MessageSyntaxError) return cause.message;
    throw cause;
  }
}

const paramsOf = (text: string): Params => inferParams(parseMessage(text));

const describe = (value: unknown) => (value === null ? 'null' : Array.isArray(value) ? 'an array' : `a ${typeof value}`);

/** Compares a non-default locale with the default one. */
function compare(
  base: MessageTree,
  other: MessageTree,
  path: string,
  options: ResolvedI18nOptions,
  diagnostics: Diagnostic[],
): void {
  const missing = options.strict ? 'error' : 'warning';
  for (const [key, child] of Object.entries(other)) {
    if (!(key in base)) {
      diagnostics.push({ level: 'error', message: `${path}.${key}: not in the default locale "${options.defaultLocale}"` });
    } else if (typeof child !== typeof base[key]) {
      diagnostics.push({
        level: 'error',
        message: `${path}.${key}: a ${typeof child === 'string' ? 'message' : 'group'} here, but a ${typeof child === 'string' ? 'group' : 'message'} in "${options.defaultLocale}"`,
      });
    } else if (typeof child !== 'string') {
      compare(base[key] as MessageTree, child, `${path}.${key}`, options, diagnostics);
    } else {
      compareParams(base[key] as string, child, `${path}.${key}`, options, diagnostics);
    }
  }
  for (const [key, child] of Object.entries(base)) {
    if (!(key in other)) {
      const what = typeof child === 'string' ? 'message' : 'group';
      diagnostics.push({ level: missing, message: `${path}.${key}: ${what} missing, falls back to "${options.defaultLocale}"` });
    }
  }
}

/** A translation may use fewer arguments than the default, but not others, nor ones it cannot render. */
function compareParams(base: string, other: string, path: string, options: ResolvedI18nOptions, diagnostics: Diagnostic[]): void {
  const baseParams = paramsOf(base);
  for (const [name, kind] of paramsOf(other)) {
    const expected = baseParams.get(name);
    if (!expected) {
      diagnostics.push({ level: 'error', message: `${path}: uses {${name}}, which "${options.defaultLocale}" does not pass` });
    } else if (!handles(kind, expected)) {
      diagnostics.push({
        level: 'error',
        message: `${path}: {${name}} is used differently from "${options.defaultLocale}", so it cannot render every value callers pass`,
      });
    }
  }
}
