// The pages a Pagination shows. Internal; not exported from the package.

/** A page number, or the gap on either side of the pages around the current one. */
export type PaginationItem = number | 'dots-start' | 'dots-end';

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);

/**
 * The pages to show for `total` pages with `active` current: the first and last `boundaries` pages, `siblings` pages
 * on each side of the current one, and a gap where pages are left out. Once there are more pages than fit, the count
 * of items stays the same whichever page is current (2 × boundaries + 2 × siblings + 3), so the row doesn't jump.
 */
export function paginationRange(total: number, active: number, siblings: number, boundaries: number): PaginationItem[] {
  const slots = boundaries * 2 + siblings * 2 + 3;
  if (total <= slots) return range(1, total);

  // Near the start: no gap before the current page's siblings, so the start fills out to the same count.
  if (active - siblings <= boundaries + 2) {
    return [...range(1, boundaries + siblings * 2 + 2), 'dots-end', ...range(total - boundaries + 1, total)];
  }
  // Near the end: the same, mirrored.
  if (active + siblings >= total - boundaries - 1) {
    return [...range(1, boundaries), 'dots-start', ...range(total - boundaries - siblings * 2 - 1, total)];
  }
  return [
    ...range(1, boundaries),
    'dots-start',
    ...range(active - siblings, active + siblings),
    'dots-end',
    ...range(total - boundaries + 1, total),
  ];
}
