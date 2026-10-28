import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/pagination/basic';
import basicCode from '../../examples/components/pagination/basic.tsx?raw';
import Links from '../../examples/components/pagination/links';
import linksCode from '../../examples/components/pagination/links.tsx?raw';
import Options from '../../examples/components/pagination/options';
import optionsCode from '../../examples/components/pagination/options.tsx?raw';

export default function PaginationPage() {
  return (
    <article class="docs-page">
      <Title>Pagination · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Pagination</h1>
      <p class="docs-lead">A row of buttons, or links, to move between pages of content.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Pagination } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>total</code> pages, numbered from 1. It shows the first and last pages, the pages around the current one, and a gap
        where pages are left out; while there are more pages than fit, the row keeps the same number of items on every page, so it
        doesn't jump. Previous and next are disabled at the ends. The current page has <code>aria-current="page"</code>, and the
        page you press keeps focus.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="options">Edges, siblings and sizes</H2>
      <p>
        <code>withEdges</code> adds first and last, and <code>withControls={'{false}'}</code> drops previous and next.{' '}
        <code>siblings</code> sets how many pages show on each side of the current one, and <code>boundaries</code> how many at
        each end. <code>size</code> goes from <code>xs</code> to <code>xl</code>, as tall as a Button, and <code>color</code>{' '}
        fills the current page. <code>disabled</code> disables every item.
      </p>
      <Example component={Options} code={optionsCode} />

      <H2 id="links">Links</H2>
      <p>
        <code>getPageHref</code> makes the items links, for pages a router or the server renders; a click still calls{' '}
        <code>onChange</code>. A link that goes nowhere has no address and is marked disabled. Rename the <code>nav</code> with{' '}
        <code>aria-label</code> when the page has more than one.
      </p>
      <Example component={Links} code={linksCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>nav</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'total', type: 'number', description: 'How many pages there are. Required.' },
          { name: 'value', type: 'number', description: 'The current page, when controlled.' },
          { name: 'defaultValue', type: 'number', default: '1', description: 'The page it starts on.' },
          { name: 'onChange', type: '(page: number) => void', description: 'Called when another page is chosen.' },
          { name: 'siblings', type: 'number', default: '1', description: 'Pages on each side of the current one.' },
          { name: 'boundaries', type: 'number', default: '1', description: 'Pages always shown at each end.' },
          { name: 'withControls', type: 'boolean', default: 'true', description: 'Shows previous and next.' },
          { name: 'withEdges', type: 'boolean', default: 'false', description: 'Shows first and last.' },
          { name: 'getPageHref', type: '(page: number) => string', description: 'Makes the items links.' },
          { name: 'hideWithOnePage', type: 'boolean', default: 'false', description: 'Hides it with one page or none.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every item.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The current page's color role." },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "The items' size." },
          { name: 'previousLabel', type: 'string', default: "'Previous page'", description: "The previous button's name." },
          { name: 'nextLabel', type: 'string', default: "'Next page'", description: "The next button's name." },
          { name: 'firstLabel', type: 'string', default: "'First page'", description: "The first page button's name." },
          { name: 'lastLabel', type: 'string', default: "'Last page'", description: "The last page button's name." },
          { name: 'pageLabel', type: '(page: number) => string', default: "'Page 3'", description: "A page's name." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-pagination</code>, with <code>data-size</code>, <code>data-color</code> and{' '}
        <code>data-disabled</code>. The list is <code>[data-slot="pagination-list"]</code>. Items are{' '}
        <code>[data-slot="pagination-page"]</code>, <code>pagination-previous</code>, <code>pagination-next</code>,{' '}
        <code>pagination-first</code> and <code>pagination-last</code>, with <code>data-current</code> on the current page and{' '}
        <code>data-disabled</code> on one that goes nowhere; the gap is <code>pagination-dots</code>.{' '}
        <code>--slp-pagination-color</code>, <code>--slp-pagination-content</code> and <code>--slp-pagination-radius</code> set
        the current page's colors and the corners. The rules live in <code>@layer slopkit.components</code>, so unlayered CSS
        wins.
      </p>
    </article>
  );
}
