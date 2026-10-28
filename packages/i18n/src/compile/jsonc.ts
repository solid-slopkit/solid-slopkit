/**
 * Parses JSON with comments and trailing commas. Comments and trailing commas are blanked out
 * (comments keep their newlines) before `JSON.parse`, so error positions still point at the source.
 */
export function parseJsonc(text: string): unknown {
  return JSON.parse(blank(text));
}

function blank(text: string): string {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j + 1;
    } else if (c === '/' && text[i + 1] === '/') {
      for (; i < text.length && text[i] !== '\n'; i++) out += ' ';
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      for (; i < stop; i++) out += text[i] === '\n' ? '\n' : ' ';
    } else if (c === ',' && closesNext(text, i + 1)) {
      out += ' ';
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** True when only whitespace and comments separate `from` and the next `}` or `]`. */
function closesNext(text: string, from: number): boolean {
  let i = from;
  while (i < text.length) {
    const c = text[i]!;
    if (c === '}' || c === ']') return true;
    if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      if (end === -1) return false;
      i = end + 2;
    } else if (/\s/.test(c)) {
      i++;
    } else {
      return false;
    }
  }
  return false;
}
