import type { Branches, DateStyle, NumberStyle, Part } from './ast';
import { inferParams } from './params';
import { parseMessage } from './parse';

const cache = new Map<string, unknown>();
const cached = <T>(key: string, create: () => T): T => {
  let value = cache.get(key) as T | undefined;
  if (value === undefined) cache.set(key, (value = create()));
  return value;
};

const numberFormat = (locale: string, style?: NumberStyle) =>
  cached(
    `n|${locale}|${style ?? ''}`,
    () =>
      new Intl.NumberFormat(
        locale,
        style === 'percent' ? { style: 'percent' } : style === 'integer' ? { maximumFractionDigits: 0 } : undefined,
      ),
  );
const dateFormat = (locale: string, style: DateStyle = 'medium') =>
  cached(`d|${locale}|${style}`, () => new Intl.DateTimeFormat(locale, { dateStyle: style }));
const pluralRules = (locale: string) => cached(`p|${locale}`, () => new Intl.PluralRules(locale));

const branch = (branches: Branches, selector: string): Part[] | undefined => branches.find(([key]) => key === selector)?.[1];

/** Renders parsed parts for a locale. An argument the caller did not pass is left visible as `{name}`. */
export function formatParts(parts: Part[], locale: string, params: Record<string, unknown> = {}, pound?: number): string {
  let out = '';
  for (const part of parts) {
    if (typeof part === 'string') {
      out += part;
    } else if (part.t === 'pound') {
      out += pound === undefined ? '#' : numberFormat(locale).format(pound);
    } else {
      const value = params[part.n];
      if (value === undefined || value === null) out += `{${part.n}}`;
      else if (part.t === 'arg') out += String(value);
      else if (part.t === 'num') out += numberFormat(locale, part.s).format(value as number);
      else if (part.t === 'date') out += dateFormat(locale, part.s).format(value as Date | number);
      else if (part.t === 'select') {
        out += formatParts(branch(part.o, String(value)) ?? branch(part.o, 'other')!, locale, params, pound);
      } else {
        const count = value as number;
        const chosen =
          branch(part.o, `=${count}`) ?? branch(part.o, pluralRules(locale).select(count)) ?? branch(part.o, 'other')!;
        out += formatParts(chosen, locale, params, count);
      }
    }
  }
  return out;
}

export type Message = string | ((params: Record<string, unknown>) => string);

/** A message without arguments is its string; one with arguments is a function of them. Throws on a syntax error. */
export function createMessage(text: string, locale: string): Message {
  return fromParts(parseMessage(text), locale);
}

export function fromParts(parts: Part[], locale: string): Message {
  return inferParams(parts).size === 0 ? formatParts(parts, locale) : (params) => formatParts(parts, locale, params);
}
