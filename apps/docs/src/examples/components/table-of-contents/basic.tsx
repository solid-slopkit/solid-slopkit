import { TableOfContents } from '@solid-slopkit/components';

export default function Basic() {
  // Lists this page's sections. Scroll the page to see the active one move.
  return <TableOfContents selector=".docs-page h2" aria-label="On this page" />;
}
