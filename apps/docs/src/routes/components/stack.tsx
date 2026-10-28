import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/stack/basic';
import basicCode from '../../examples/components/stack/basic.tsx?raw';
import { withBase } from '../../base';

export default function StackPage() {
  return (
    <article class="docs-page">
      <Title>Stack · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Stack</h1>
      <p class="docs-lead">
        Stacks children vertically: a column <a href={withBase('/components/flex')}>Flex</a> with a gap. Its props are not
        responsive; for a layout that changes per breakpoint, use Flex.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Stack } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <Example component={Basic} code={basicCode} column />

      <H2 id="props">Props</H2>
      <p>
        Must be rendered inside <code>&lt;SlopkitUi&gt;</code>. Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'gap', type: 'number', default: '4', description: 'Space between children, in spacing units.' },
          {
            name: 'align',
            type: "'normal' | 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'baseline' | string",
            default: "'stretch'",
            description: <code>align-items</code>,
          },
          {
            name: 'justify',
            type: "'normal' | 'start' | 'end' | 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | string",
            default: "'flex-start'",
            description: <code>justify-content</code>,
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-stack</code> and <code>.slp-flex</code>, and no data attributes. Its layout is
        generated into <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
