// SSR scenarios for table-of-contents.test.tsx.
import { TableOfContents } from '.';

export const tablesOfContents = () => (
  <div>
    <TableOfContents
      class="mine"
      color="secondary"
      variant="soft"
      headings={[
        { id: 'usage', label: 'Usage', depth: 2 },
        { id: 'options', label: 'Options', depth: 3 },
        { id: 'props', label: 'Props', depth: 2 },
      ]}
    />
    <TableOfContents selector="article h2" aria-label="On this page" />
    <article>
      <h2 id="first">First</h2>
      <h2 id="second">Second</h2>
    </article>
  </div>
);
