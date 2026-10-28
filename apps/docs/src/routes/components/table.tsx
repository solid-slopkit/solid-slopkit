import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/table/basic';
import basicCode from '../../examples/components/table/basic.tsx?raw';
import Variants from '../../examples/components/table/variants';
import variantsCode from '../../examples/components/table/variants.tsx?raw';
import Scroll from '../../examples/components/table/scroll';
import scrollCode from '../../examples/components/table/scroll.tsx?raw';

export default function TablePage() {
  return (
    <article class="docs-page">
      <Title>Table · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Table</h1>
      <p class="docs-lead">
        Rows and columns of data: a <code>table</code>, built from <code>Table.Thead</code>, <code>Table.Tbody</code>,{' '}
        <code>Table.Tr</code>, <code>Table.Th</code>, <code>Table.Td</code> and friends.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Table } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Each part renders its native element. Use <code>Table.Th</code> with <code>scope="col"</code> in the header row and{' '}
        <code>scope="row"</code> for a cell that names its row. <code>Table.Caption</code> names the table and shows below it.
        Numbers use tabular figures, so they line up; align a numeric column to the end with its cells' style.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Striped, hover and bordered</H2>
      <p>
        <code>striped</code> tints every other body row, <code>hover</code> highlights the row under the pointer, and{' '}
        <code>bordered</code> adds an outer border and lines between columns. <code>size</code> sets the padding and font size.
        Footer rows are bold.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="scroll">Wide tables and sticky headers</H2>
      <p>
        <code>Table.ScrollContainer</code> scrolls a wide table sideways instead of letting it overflow the page; give the table a{' '}
        <code>min-width</code>. The container takes a tab stop so the keyboard can scroll it: give it <code>role="region"</code>{' '}
        and a label. <code>stickyHeader</code> keeps the header at the top of the nearest scroller, here the container, which has
        a <code>max-height</code>.
      </p>
      <Example component={Scroll} code={scrollCode} />

      <H2 id="table-props">Table props</H2>
      <p>
        Other props are passed to the <code>table</code>. The parts have no props of their own; their attributes, such as{' '}
        <code>scope</code> and <code>colspan</code>, pass to their element.
      </p>
      <PropsTable
        rows={[
          { name: 'striped', type: 'boolean', default: 'false', description: 'Tints every other body row.' },
          { name: 'hover', type: 'boolean', default: 'false', description: 'Highlights the body row under the pointer.' },
          { name: 'bordered', type: 'boolean', default: 'false', description: 'Outer border and lines between columns.' },
          {
            name: 'stickyHeader',
            type: 'boolean',
            default: 'false',
            description: 'Keeps the header row in view while scrolling.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Cell padding and font size.' },
        ]}
      />

      <H2 id="scroll-container-props">Table.ScrollContainer props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[{ name: 'tabindex', type: 'number', default: '0', description: 'The tab stop that lets the keyboard scroll it.' }]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        Each part has its own root class: <code>.slp-table</code>, <code>.slp-table-thead</code>, <code>.slp-table-tbody</code>,{' '}
        <code>.slp-table-tfoot</code>, <code>.slp-table-tr</code>, <code>.slp-table-th</code>, <code>.slp-table-td</code>,{' '}
        <code>.slp-table-caption</code> and <code>.slp-table-scroll-container</code>. The table has <code>data-size</code>,{' '}
        <code>data-striped</code>, <code>data-hover</code>, <code>data-bordered</code> and <code>data-sticky-header</code>. Its
        rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
