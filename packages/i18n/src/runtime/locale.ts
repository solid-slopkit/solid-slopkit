const normalize = (tag: string) => tag.trim().replace(/_/g, '-').toLowerCase();

/**
 * The best of `supported` for what the user asked for, or `undefined` when none fits. `requested` is one
 * tag or a preference list (`navigator.languages`, in order). For each requested tag, in order: an exact
 * match, then the same tag with trailing subtags dropped (`de-AT` → `de`), then a supported regional
 * variant of the language (`de` → `de-DE`). Matching ignores case; the result is spelled as in `supported`.
 */
export function matchLocale(requested: string | readonly string[], supported: readonly string[]): string | undefined {
  const table = supported.map((tag) => [normalize(tag), tag] as const);
  for (const tag of typeof requested === 'string' ? [requested] : requested) {
    const wanted = normalize(tag);
    if (!wanted || wanted === '*') continue;
    const parts = wanted.split('-');
    for (let length = parts.length; length > 0; length--) {
      const candidate = parts.slice(0, length).join('-');
      const exact = table.find(([key]) => key === candidate);
      if (exact) return exact[1];
    }
    const regional = table.find(([key]) => key.startsWith(`${parts[0]}-`));
    if (regional) return regional[1];
  }
  return undefined;
}
