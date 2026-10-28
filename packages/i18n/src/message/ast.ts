export type NumberStyle = 'integer' | 'percent';
export type DateStyle = 'short' | 'medium' | 'long' | 'full';

/** Branches of a plural or select, in source order: `[selector, parts]`. */
export type Branches = [selector: string, parts: Part[]][];

/**
 * One piece of a parsed message. Plain objects and strings only, so a parsed message can be
 * emitted as JSON.
 */
export type Part =
  | string
  | { t: 'arg'; n: string }
  | { t: 'num'; n: string; s?: NumberStyle }
  | { t: 'date'; n: string; s?: DateStyle }
  | { t: 'plural'; n: string; o: Branches }
  | { t: 'select'; n: string; o: Branches }
  | { t: 'pound' };

export class MessageSyntaxError extends Error {
  readonly offset: number;
  constructor(message: string, offset: number) {
    super(`${message} (at character ${offset + 1})`);
    this.name = 'MessageSyntaxError';
    this.offset = offset;
  }
}

/** Messages of one locale as the compiler emits them: groups are objects, messages are parsed parts. */
export interface LocaleData {
  [key: string]: Part[] | LocaleData;
}

/** The keys of the default locale: `1` is a message, an object is a group. */
export interface Shape {
  [key: string]: 1 | Shape;
}
