import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/group/basic';
import basicCode from '../../examples/components/group/basic.tsx?raw';
import Grow from '../../examples/components/group/grow';
import growCode from '../../examples/components/group/grow.tsx?raw';
import { withBase } from '../../base';

export default function GroupPage() {
  return (
    <article class="docs-page">
      <Title>Group · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Group</h1>
      <p class="docs-lead">
        Lays children out in a row: a <a href={withBase('/components/flex')}>Flex</a> with a gap that wraps and centers its
        children vertically. Its props are not responsive; for a layout that changes per breakpoint, use Flex.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Group } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <Example component={Basic} code={basicCode} column />

      <H2 id="grow">Grow</H2>
      <p>
        <code>grow</code> makes children fill the row. By default they share it equally and their content cannot widen them; set{' '}
        <code>preventGrowOverflow={'{false}'}</code> to let wider content take more.
      </p>
      <Example component={Grow} code={growCode} column />

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
            default: "'center'",
            description: <code>align-items</code>,
          },
          {
            name: 'justify',
            type: "'normal' | 'start' | 'end' | 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | string",
            default: "'flex-start'",
            description: <code>justify-content</code>,
          },
          { name: 'wrap', type: "'nowrap' | 'wrap' | 'wrap-reverse'", default: "'wrap'", description: <code>flex-wrap</code> },
          { name: 'grow', type: 'boolean', default: 'false', description: 'Children grow to fill the row.' },
          {
            name: 'preventGrowOverflow',
            type: 'boolean',
            default: 'true',
            description: (
              <>
                With <code>grow</code>, children share the row equally and their content cannot widen them.
              </>
            ),
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-group</code> and <code>.slp-flex</code>, with <code>data-grow</code> when{' '}
        <code>grow</code> is set and <code>data-prevent-grow-overflow</code> unless <code>preventGrowOverflow</code> is{' '}
        <code>false</code>. Its rules live in <code>@layer slopkit.components</code>, and the grow rules on children have zero
        specificity, so unlayered CSS and a child's own classes win.
      </p>
    </article>
  );
}
