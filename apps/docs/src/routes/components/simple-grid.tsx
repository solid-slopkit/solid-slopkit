import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/simple-grid/basic';
import basicCode from '../../examples/components/simple-grid/basic.tsx?raw';
import Responsive from '../../examples/components/simple-grid/responsive';
import responsiveCode from '../../examples/components/simple-grid/responsive.tsx?raw';
import { withBase } from '../../base';

export default function SimpleGridPage() {
  return (
    <article class="docs-page">
      <Title>SimpleGrid · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>SimpleGrid</h1>
      <p class="docs-lead">
        A <code>div</code> grid of equal-width columns. Each child takes one cell, and rows are added as needed.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { SimpleGrid } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <Example component={Basic} code={basicCode} column />

      <H2 id="responsive">Responsive</H2>
      <p>
        <code>cols</code>, <code>spacing</code> and <code>verticalSpacing</code> take a value per breakpoint, like{' '}
        <a href={withBase('/components/box')}>Box</a>'s props. Resize the window to see the columns change.
      </p>
      <Example component={Responsive} code={responsiveCode} column />

      <H2 id="props">Props</H2>
      <p>
        Must be rendered inside <code>&lt;SlopkitUi&gt;</code>. Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'cols', type: 'ResponsiveValue<number>', default: '1', description: 'Number of equal-width columns.' },
          {
            name: 'spacing',
            type: 'ResponsiveValue<number>',
            default: '4',
            description: (
              <>
                Space between columns, in spacing units. Also between rows unless <code>verticalSpacing</code> is set.
              </>
            ),
          },
          {
            name: 'verticalSpacing',
            type: 'ResponsiveValue<number>',
            default: 'spacing',
            description: 'Space between rows, in spacing units.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-simple-grid</code>, and no data attributes. Its layout is generated into{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
