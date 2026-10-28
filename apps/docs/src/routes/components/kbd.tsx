import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/kbd/basic';
import basicCode from '../../examples/components/kbd/basic.tsx?raw';
import Scaling from '../../examples/components/kbd/scaling';
import scalingCode from '../../examples/components/kbd/scaling.tsx?raw';
import Sizes from '../../examples/components/kbd/sizes';
import sizesCode from '../../examples/components/kbd/sizes.tsx?raw';
import { withBase } from '../../base';

export default function KbdPage() {
  return (
    <article class="docs-page">
      <Title>Kbd · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Kbd</h1>
      <p class="docs-lead">
        A keyboard key: a <code>kbd</code>, drawn as a keycap.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Kbd } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        One Kbd is one key. For a shortcut, put the keys next to each other with a separator such as <code>+</code> between them.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="scaling">Scaling with text</H2>
      <p>
        Without <code>size</code>, a Kbd scales with the text around it, so it fits a{' '}
        <a href={withBase('/components/text')}>Text</a> or <a href={withBase('/components/title')}>Title</a> of any size.
      </p>
      <Example component={Scaling} code={scalingCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>
        <code>size</code> sets a fixed font size from the type scale, for a key on its own.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>kbd</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            description: 'Fixed font size. Scales with the surrounding text if omitted.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-kbd</code>, and no slots. <code>data-size</code> is set when <code>size</code> is. The
        font is <code>--slp-font-family-monospace</code>, set on <code>:root</code> in <code>slopkit.css</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
