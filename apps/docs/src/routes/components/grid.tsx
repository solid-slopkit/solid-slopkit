import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/grid/basic';
import basicCode from '../../examples/components/grid/basic.tsx?raw';
import Responsive from '../../examples/components/grid/responsive';
import responsiveCode from '../../examples/components/grid/responsive.tsx?raw';
import Auto from '../../examples/components/grid/auto';
import autoCode from '../../examples/components/grid/auto.tsx?raw';
import Offset from '../../examples/components/grid/offset';
import offsetCode from '../../examples/components/grid/offset.tsx?raw';
import Grow from '../../examples/components/grid/grow';
import growCode from '../../examples/components/grid/grow.tsx?raw';
import { withBase } from '../../base';

export default function GridPage() {
  return (
    <article class="docs-page">
      <Title>Grid · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Grid</h1>
      <p class="docs-lead">
        A flex grid of 12 columns. Each <code>Grid.Col</code> spans some of them, and columns wrap to a new row when a row is
        full. For a grid where every cell is the same width, use <a href={withBase('/components/simple-grid')}>SimpleGrid</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Grid } from '@solid-slopkit/components';`} />
      <p>
        <code>Grid.Col</code> is also exported as <code>GridCol</code>.
      </p>

      <H2 id="usage">Usage</H2>
      <Example component={Basic} code={basicCode} column />

      <H2 id="responsive">Responsive</H2>
      <p>
        <code>span</code>, <code>offset</code>, <code>order</code> and the grid's <code>gutter</code> take a value per breakpoint,
        like <a href={withBase('/components/box')}>Box</a>'s props. <code>columns</code>, <code>justify</code> and{' '}
        <code>align</code> are not responsive.
      </p>
      <Example component={Responsive} code={responsiveCode} column />

      <H2 id="auto-and-content">Auto and content</H2>
      <p>
        <code>span="auto"</code> columns share the space the others leave. <code>span="content"</code> is as wide as its content.
      </p>
      <Example component={Auto} code={autoCode} column />

      <H2 id="offset">Offset</H2>
      <p>
        <code>offset</code> leaves that many columns empty before the column.
      </p>
      <Example component={Offset} code={offsetCode} column />

      <H2 id="grow">Grow</H2>
      <p>
        With <code>grow</code>, columns in a row that is not full grow to fill it.
      </p>
      <Example component={Grow} code={growCode} column />

      <H2 id="grid-props">Grid props</H2>
      <p>
        Must be rendered inside <code>&lt;SlopkitUi&gt;</code>. Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'gutter',
            type: 'ResponsiveValue<number>',
            default: '4',
            description: 'Space between columns and rows, in spacing units.',
          },
          { name: 'columns', type: 'number', default: '12', description: 'Number of columns a row is divided into.' },
          { name: 'grow', type: 'boolean', default: 'false', description: 'Columns in a row that is not full grow to fill it.' },
          {
            name: 'justify',
            type: "'normal' | 'start' | 'end' | 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | string",
            description: <code>justify-content</code>,
          },
          {
            name: 'align',
            type: "'normal' | 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'baseline' | string",
            description: <code>align-items</code>,
          },
        ]}
      />

      <H2 id="grid-col-props">Grid.Col props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'span',
            type: "ResponsiveValue<number | 'auto' | 'content'>",
            default: 'the full row',
            description: 'Width in columns.',
          },
          { name: 'offset', type: 'ResponsiveValue<number>', description: 'Columns left empty before this one.' },
          { name: 'order', type: 'ResponsiveValue<number>', description: <code>order</code> },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        Grid's root has the class <code>.slp-grid</code>, with <code>data-grow</code> when <code>grow</code> is set.{' '}
        <code>Grid.Col</code> has its own root class, <code>.slp-grid-col</code>. Their rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
