export interface HighlightSegment {
  text: string;
  match: boolean;
}

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Splits `text` into the parts that match one of `terms` and the parts between them. Longer terms win. */
export function splitHighlight(text: string, terms: string | readonly string[], caseSensitive = false): HighlightSegment[] {
  const list = (typeof terms === 'string' ? [terms] : terms).filter((term) => term.trim() !== '');
  if (list.length === 0 || text === '') return [{ text, match: false }];

  const pattern = [...list]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');
  // The capturing group keeps the matches in the result of split, at the odd indexes.
  const parts = text.split(new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi'));
  return parts.map((part, index) => ({ text: part, match: index % 2 === 1 })).filter((segment) => segment.text !== '');
}
