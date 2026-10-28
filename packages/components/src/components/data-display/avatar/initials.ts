/** Up to two initials from a name: the first letters of its first and last words, uppercased. */
export function initials(name: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  // Array.from keeps a letter outside the basic plane, such as an emoji, in one piece.
  const first = (word: string) => Array.from(word)[0] ?? '';
  const letters = words.length === 1 ? first(words[0]) : first(words[0]) + first(words[words.length - 1]);
  return letters.toLocaleUpperCase();
}
