import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/center/basic';
import basicCode from '../../examples/components/center/basic.tsx?raw';
import Inline from '../../examples/components/center/inline';
import inlineCode from '../../examples/components/center/inline.tsx?raw';
import { withBase } from '../../base';

export default function CenterPage() {
  return (
    <article class="docs-page">
      <Title>Center · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Center</h1>
      <p class="docs-lead">
        Centers its content horizontally and vertically: a <a href={withBase('/components/flex')}>Flex</a> with <code>align</code>{' '}
        and <code>justify</code> set to <code>center</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Center } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <Example component={Basic} code={basicCode} column />

      <H2 id="inline">Inline</H2>
      <p>
        <code>inline</code> makes it <code>inline-flex</code>, for centering an icon or a badge inside a line of text.
      </p>
      <Example component={Inline} code={inlineCode} column />

      <H2 id="props">Props</H2>
      <p>
        Must be rendered inside <code>&lt;SlopkitUi&gt;</code>. Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'inline',
            type: 'boolean',
            default: 'false',
            description: (
              <>
                Uses <code>inline-flex</code> instead of <code>flex</code>.
              </>
            ),
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-center</code> and <code>.slp-flex</code>, and no data attributes. Its layout is
        generated into <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
