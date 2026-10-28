import { createMemo, createSignal, runWithOwner, useContext } from 'solid-js';
import { DEV } from 'solid-js';
import type { LocaleData, Part, Shape } from '../message/ast';
import { fromParts, type Message } from '../message/format';
import { I18nContext, resolveLocale } from './context';

/** A locale's messages, inline, or a loader for a per-locale chunk. */
export type LocaleSource = LocaleData | (() => Promise<LocaleData>);

export type { LocaleData, Shape };

export interface TranslationsDefinition {
  /** Names the file in warnings. */
  name?: string;
  defaultLocale: string;
  shape: Shape;
  locales: Record<string, LocaleSource>;
}

const DEFINITION = Symbol.for('slopkit.i18n.definition');

interface Entry {
  read(): LocaleData;
  load(): Promise<LocaleData>;
}
const entries = new WeakMap<TranslationsDefinition, Map<string, Entry>>();

function entryFor(definition: TranslationsDefinition, locale: string): Entry {
  let byLocale = entries.get(definition);
  if (!byLocale) entries.set(definition, (byLocale = new Map()));
  let entry = byLocale.get(locale);
  if (!entry) byLocale.set(locale, (entry = createEntry(definition, locale)));
  return entry;
}

function createEntry(definition: TranslationsDefinition, locale: string): Entry {
  const source = definition.locales[locale]!;
  if (typeof source !== 'function') return { read: () => source, load: () => Promise.resolve(source) };

  // A loaded chunk is shared by every reader, so its memo lives outside whichever owner read first. Once the
  // chunk has arrived, reads skip the memo: they are plain reads, and `preloadTranslations` can fill the
  // entry before anything renders.
  let loaded: LocaleData | undefined;
  let promise: Promise<LocaleData> | undefined;
  const load = () =>
    (promise ??= source().then(
      (data) => (loaded = data),
      (error) => {
        promise = undefined; // a later read tries again
        throw error;
      },
    ));
  const pending = runWithOwner(null, () => createMemo(() => load(), { name: `${definition.name ?? 'translations'}.${locale}` }))!;
  return { load, read: () => loaded ?? pending() };
}

/** Dev only: a signal per file that a hot update bumps, so rendered messages re-read. */
const versions = new WeakMap<TranslationsDefinition, [read: () => number, bump: () => void]>();
function track(definition: TranslationsDefinition): void {
  if (!DEV) return;
  let version = versions.get(definition);
  if (!version) {
    const [read, write] = runWithOwner(null, () => createSignal(0, { name: `${definition.name ?? 'translations'}.version` }))!;
    versions.set(definition, (version = [read, () => write((n) => n + 1)]));
  }
  version[0]();
}

const lookup = (data: LocaleData, path: readonly string[]): Part[] | undefined => {
  let node: Part[] | LocaleData | undefined = data;
  for (const key of path) {
    if (node === undefined || Array.isArray(node)) return undefined;
    node = Object.hasOwn(node, key) ? node[key] : undefined;
  }
  return Array.isArray(node) ? node : undefined;
};

const messages = new WeakMap<Part[], Map<string, Message>>();
const warned = new Set<string>();
const warnOnce = (key: string, text: string) => {
  if (DEV && !warned.has(key)) {
    warned.add(key);
    console.warn(`[@solid-slopkit/i18n] ${text}`);
  }
};

function message(definition: TranslationsDefinition, active: string, path: readonly string[]): Message {
  track(definition);
  const where = `${definition.name ?? 'translations'}.${path.join('.')}`;
  let source = active;
  if (!Object.hasOwn(definition.locales, active)) {
    warnOnce(
      `${where}|${active}|locale`,
      `"${active}" is not a locale of ${definition.name ?? 'a translation file'}; showing "${definition.defaultLocale}".`,
    );
    source = definition.defaultLocale;
  }
  let parts = lookup(entryFor(definition, source).read(), path);
  if (!parts && source !== definition.defaultLocale) {
    warnOnce(`${where}|${active}`, `${where} is missing in "${active}"; showing "${definition.defaultLocale}".`);
    parts = lookup(entryFor(definition, definition.defaultLocale).read(), path);
  }
  if (!parts) throw new Error(`@solid-slopkit/i18n: ${where} is not in the default locale "${definition.defaultLocale}"`);
  let byLocale = messages.get(parts);
  if (!byLocale) messages.set(parts, (byLocale = new Map()));
  let result = byLocale.get(active);
  if (result === undefined) byLocale.set(active, (result = fromParts(parts, active)));
  return result;
}

/** Builds the object users read: plain getters per key, so spread, `Object.keys` and tracking all work. */
function createView(definition: TranslationsDefinition, locale: (what: string) => string): object {
  const build = (shape: Shape, path: readonly string[]): object => {
    const view: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(shape)) {
      const at = [...path, key];
      if (child === 1) {
        Object.defineProperty(view, key, { enumerable: true, get: () => message(definition, locale(at.join('.')), at) });
      } else {
        Object.defineProperty(view, key, { enumerable: true, value: build(child, at) });
      }
    }
    return view;
  };
  const root = build(definition.shape, []);
  Object.defineProperty(root, DEFINITION, { value: definition });
  return root;
}

/**
 * What the compiler emits for a translation file; not for hand-written code. The result is the messages
 * of the active locale.
 */
export function defineTranslations<T extends object>(definition: TranslationsDefinition, previous?: object): T {
  if (previous) {
    // A hot update of the same file: when only the messages changed, they are replaced in place, so everything
    // that imported the old object keeps working. A changed set of keys needs a new object (the caller reloads).
    const old = definitionOf(previous);
    if (JSON.stringify(old.shape) === JSON.stringify(definition.shape)) {
      Object.assign(old, { defaultLocale: definition.defaultLocale, locales: definition.locales });
      entries.delete(old);
      versions.get(old)?.[1]();
      return previous as T;
    }
  }
  return createView(definition, resolveLocale) as T;
}

const definitionOf = (translations: object): TranslationsDefinition => {
  const definition = (translations as { [DEFINITION]?: TranslationsDefinition })[DEFINITION];
  if (!definition) throw new Error('@solid-slopkit/i18n: expected the default export of a translation file');
  return definition;
};

/**
 * The messages of a translation file, bound to the provider above the calling component. Reads then
 * give that provider's locale wherever they happen (event handlers, timers), also with several providers
 * on one page. Call it while the component is being set up.
 */
export function useTranslations<T extends object>(translations: T): T {
  const context = useContext(I18nContext);
  return createView(definitionOf(translations), () => context.locale()) as T;
}

/**
 * Loads a locale of translation files ahead of rendering, so the first render does not wait for them.
 * Call it before mounting, e.g. `await preloadTranslations(locale, common, users)`.
 */
export async function preloadTranslations(locale: string, ...translations: object[]): Promise<void> {
  await Promise.all(
    translations.map((view) => {
      const definition = definitionOf(view);
      return entryFor(definition, Object.hasOwn(definition.locales, locale) ? locale : definition.defaultLocale).load();
    }),
  );
}
