import { MessageSyntaxError, type Part } from './ast';

/** What a message needs for one argument. */
export type ParamKind =
  | { kind: 'any' } // {name}: a string or a number
  | { kind: 'number' } // {n, number} and every plural
  | { kind: 'date' } // {d, date}
  | { kind: 'select'; keys: string[]; open: boolean }; // `open`: has an `other` branch

export type Params = Map<string, ParamKind>;

/** The arguments a message takes, with the type each one needs. Throws when one name is used incompatibly. */
export function inferParams(parts: Part[]): Params {
  const params: Params = new Map();
  const add = (name: string, kind: ParamKind) => {
    const existing = params.get(name);
    const merged = existing ? merge(existing, kind) : kind;
    if (!merged)
      throw new MessageSyntaxError(`"${name}" is used as both ${describeKind(existing!)} and ${describeKind(kind)}`, 0);
    params.set(name, merged);
  };
  const walk = (list: Part[]) => {
    for (const part of list) {
      if (typeof part === 'string' || part.t === 'pound') continue;
      if (part.t === 'arg') add(part.n, { kind: 'any' });
      else if (part.t === 'num' || part.t === 'plural') add(part.n, { kind: 'number' });
      else if (part.t === 'date') add(part.n, { kind: 'date' });
      else add(part.n, { kind: 'select', keys: part.o.map(([key]) => key).filter((key) => key !== 'other'), open: true });
      if (part.t === 'plural' || part.t === 'select') for (const [, branch] of part.o) walk(branch);
    }
  };
  walk(parts);
  return params;
}

function merge(a: ParamKind, b: ParamKind): ParamKind | undefined {
  if (a.kind === 'any') return b.kind === 'date' ? undefined : b;
  if (b.kind === 'any') return a.kind === 'date' ? undefined : a;
  if (a.kind === 'select' && b.kind === 'select')
    return { kind: 'select', keys: [...new Set([...a.keys, ...b.keys])], open: a.open || b.open };
  return a.kind === b.kind && a.kind !== 'select' ? a : undefined;
}

export function describeKind(kind: ParamKind): string {
  return kind.kind === 'any' ? 'plain text' : kind.kind === 'select' ? 'a select' : `a ${kind.kind}`;
}

/** The TypeScript type of an argument. A select suggests its listed branches and takes any string: `other` handles the rest. */
export function renderParamType(kind: ParamKind): string {
  switch (kind.kind) {
    case 'any':
      return 'string | number';
    case 'number':
      return 'number';
    case 'date':
      return 'Date | number';
    case 'select':
      return kind.keys.length === 0 ? 'string' : `${kind.keys.map((key) => JSON.stringify(key)).join(' | ')} | (string & {})`;
  }
}

/**
 * Whether a translation can render every value the default locale's message accepts for this
 * argument. The default's type is what callers see, so another locale may not need more than it.
 */
export function handles(translation: ParamKind, base: ParamKind): boolean {
  switch (base.kind) {
    case 'any':
      return translation.kind === 'any';
    case 'number':
      return translation.kind === 'any' || translation.kind === 'number';
    case 'date':
      return translation.kind === 'date';
    case 'select':
      if (translation.kind === 'any') return true;
      return translation.kind === 'select' && (translation.open || base.keys.every((key) => translation.keys.includes(key)));
  }
}
