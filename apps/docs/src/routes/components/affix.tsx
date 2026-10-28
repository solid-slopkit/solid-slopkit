import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/affix/basic';
import basicCode from '../../examples/components/affix/basic.tsx?raw';

export default function AffixPage() {
  return (
    <article class="docs-page">
      <Title>Affix · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Affix</h1>
      <p class="docs-lead">Pins its content to a spot in the viewport, such as a button back to the top.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Affix } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The Affix is in the browser's top layer as soon as it's mounted, so it stays fixed to the viewport whatever its parents'
        transforms or overflow, and sits above the page without a <code>z-index</code>. It's as big as its content, and Tab
        reaches that content where the Affix is in the document. It's always shown while mounted: put a Transition inside it to
        animate its content in and out, as here.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="position">Position</H2>
      <p>
        <code>position</code> is a corner or the middle of the top or bottom edge, <code>bottom-right</code> by default, and{' '}
        <code>offset</code> the gap to the edges, 20px by default. It renders in place on the server, hidden, and is shown once
        hydrated.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'position', type: 'AffixPosition', default: "'bottom-right'", description: "Where it's pinned." },
          { name: 'offset', type: 'number', default: '20', description: "Gap to the viewport's edges, in px." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-affix</code>, with <code>data-position</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
