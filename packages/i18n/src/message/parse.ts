import { MessageSyntaxError, type Branches, type DateStyle, type NumberStyle, type Part } from './ast';

const NUMBER_STYLES: readonly string[] = ['integer', 'percent'];
const DATE_STYLES: readonly string[] = ['short', 'medium', 'long', 'full'];
const PLURAL_CATEGORIES: readonly string[] = ['zero', 'one', 'two', 'few', 'many', 'other'];

/**
 * Parses the message subset: `{name}`, `{n, number[, integer|percent]}`, `{d, date[, short|medium|long|full]}`,
 * `{n, plural, =0 {…} one {…} other {…}}` (with `#` for the number), `{x, select, a {…} other {…}}`.
 * Apostrophes quote braces: `'{'` is a literal `{`, and `''` is a literal `'`; any other `'` is itself.
 */
export function parseMessage(text: string): Part[] {
  let i = 0;

  const fail = (message: string, at = i): never => {
    throw new MessageSyntaxError(message, at);
  };
  const skipSpace = () => {
    while (i < text.length && /\s/.test(text[i]!)) i++;
  };
  const word = (pattern: RegExp, what: string): string => {
    const start = i;
    while (i < text.length && pattern.test(text[i]!)) i++;
    return i === start ? fail(`expected ${what}`) : text.slice(start, i);
  };
  const expect = (char: string) => {
    skipSpace();
    if (text[i] !== char) fail(`expected "${char}"${i >= text.length ? ', but the message ends' : ''}`);
    i++;
  };

  /** Parses until the end of the text (top level) or the `}` closing a branch (left unconsumed). */
  const parseParts = (branch: boolean, inPlural: boolean): Part[] => {
    const parts: Part[] = [];
    let literal = '';
    const flush = () => {
      if (literal) parts.push(literal);
      literal = '';
    };
    while (i < text.length) {
      const c = text[i]!;
      if (c === "'") {
        if (text[i + 1] === "'") {
          literal += "'";
          i += 2;
        } else if (text[i + 1] === '{' || text[i + 1] === '}') {
          // A quoted run: up to the next single apostrophe, with '' inside it meaning '.
          i++;
          while (i < text.length && !(text[i] === "'" && text[i + 1] !== "'")) {
            if (text[i] === "'") i++;
            literal += text[i++];
          }
          if (i >= text.length) fail('unterminated quote');
          i++;
        } else {
          literal += c;
          i++;
        }
      } else if (c === '{') {
        flush();
        parts.push(parseArgument(inPlural));
      } else if (c === '}') {
        if (branch) break;
        fail('unmatched "}" (quote it as \'}\' for a literal brace)');
      } else if (c === '#' && inPlural) {
        flush();
        parts.push({ t: 'pound' });
        i++;
      } else {
        literal += c;
        i++;
      }
    }
    flush();
    return parts;
  };

  const parseArgument = (inPlural: boolean): Part => {
    i++; // {
    skipSpace();
    const n = word(/[A-Za-z0-9_]/, 'an argument name');
    skipSpace();
    if (text[i] === '}') {
      i++;
      return { t: 'arg', n };
    }
    if (text[i] !== ',') fail('expected "," or "}"');
    i++;
    skipSpace();
    const typeAt = i;
    const type = word(/[a-z]/, 'an argument type (number, date, plural or select)');

    if (type === 'number' || type === 'date') {
      let style: string | undefined;
      skipSpace();
      if (text[i] === ',') {
        i++;
        skipSpace();
        const styleAt = i;
        style = word(/[a-z]/, 'a style');
        const allowed = type === 'number' ? NUMBER_STYLES : DATE_STYLES;
        if (!allowed.includes(style)) fail(`unknown ${type} style "${style}" (use ${allowed.join(', ')})`, styleAt);
      }
      expect('}');
      return type === 'number'
        ? style
          ? { t: 'num', n, s: style as NumberStyle }
          : { t: 'num', n }
        : style
          ? { t: 'date', n, s: style as DateStyle }
          : { t: 'date', n };
    }

    if (type === 'plural' || type === 'select') {
      expect(',');
      const branches: Branches = [];
      for (;;) {
        skipSpace();
        if (text[i] === '}') break;
        if (i >= text.length) fail('expected a branch or "}", but the message ends');
        const selectorAt = i;
        const selector = type === 'plural' ? pluralSelector() : word(/[^\s{},]/, 'a branch name');
        if (type === 'plural' && selector.startsWith('offset:')) fail('plural offset is not supported', selectorAt);
        if (branches.some(([existing]) => existing === selector)) fail(`duplicate branch "${selector}"`, selectorAt);
        skipSpace();
        if (text[i] !== '{') fail(`expected "{" after "${selector}"`);
        i++;
        const parts = parseParts(true, type === 'plural' ? true : inPlural);
        if (text[i] !== '}') fail(`the branch "${selector}" is not closed`);
        i++;
        branches.push([selector, parts]);
      }
      i++; // }
      if (!branches.some(([selector]) => selector === 'other')) fail(`a ${type} needs an "other" branch`, typeAt);
      return { t: type, n, o: branches };
    }

    return fail(`unknown argument type "${type}" (use number, date, plural or select)`, typeAt);
  };

  const pluralSelector = (): string => {
    const start = i;
    const selector = word(/[^\s{},]/, 'a plural branch');
    if (selector.startsWith('=')) {
      if (!/^=\d+$/.test(selector)) fail(`"${selector}" is not an exact match like =0`, start);
    } else if (!PLURAL_CATEGORIES.includes(selector) && !selector.startsWith('offset:')) {
      fail(`unknown plural category "${selector}" (use ${PLURAL_CATEGORIES.join(', ')} or =N)`, start);
    }
    return selector;
  };

  return parseParts(false, false);
}
