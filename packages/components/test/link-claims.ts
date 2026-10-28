import { registerElementClaim } from '@solidjs/web';
import { onTestFinished } from 'vitest';

/**
 * Claims every link the runtime creates the way a router that marks links to the current page does,
 * in the worst case, where every link points at the current page: it sets `data-active` on each, and
 * `aria-current="page"` on each that has none of its own. Call it before rendering; it stops when the test ends.
 */
export function claimLinksAsCurrent() {
  const stop = registerElementClaim((node: Element) => {
    if (node.nodeName !== 'A') return;
    node.setAttribute('data-active', '');
    if (!node.hasAttribute('aria-current')) node.setAttribute('aria-current', 'page');
  });
  onTestFinished(stop);
}
