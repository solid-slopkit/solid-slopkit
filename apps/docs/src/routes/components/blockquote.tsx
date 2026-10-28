import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/blockquote/basic';
import basicCode from '../../examples/components/blockquote/basic.tsx?raw';
import Colors from '../../examples/components/blockquote/colors';
import colorsCode from '../../examples/components/blockquote/colors.tsx?raw';
import Paragraphs from '../../examples/components/blockquote/paragraphs';
import paragraphsCode from '../../examples/components/blockquote/paragraphs.tsx?raw';
import { withBase } from '../../base';

export default function BlockquotePage() {
  return (
    <article class="docs-page">
      <Title>Blockquote · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Blockquote</h1>
      <p class="docs-lead">
        A quotation set off from the text: a <code>figure</code> with the <code>blockquote</code> and its attribution.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Blockquote } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>attribution</code> goes in a <code>figcaption</code> below the quote, outside the <code>blockquote</code>, so it
        isn't read as part of the quote. <code>cite</code> is the source's URL, set on the <code>blockquote</code>; browsers don't
        show it, so link the source in the attribution too.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role for the bar. Without it, the bar is a muted text color.
      </p>
      <Example component={Colors} code={colorsCode} column />

      <H2 id="paragraphs">Several paragraphs</H2>
      <p>
        The quote takes block content. Space paragraphs with a <a href={withBase('/components/stack')}>Stack</a>; the outer
        margins of the first and last child are removed, so a plain <code>p</code> sits flush too.
      </p>
      <Example component={Paragraphs} code={paragraphsCode} column />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>figure</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'attribution', type: 'JSX.Element', description: 'Who said it, shown below the quote.' },
          { name: 'cite', type: 'string', description: 'URL of the source, on the blockquote.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role of the bar. Muted text color if omitted.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is the <code>figure</code>, with the class <code>.slp-blockquote</code> and <code>data-color</code>. Its slots
        are <code>blockquote-quote</code> (the <code>blockquote</code>) and <code>blockquote-attribution</code> (the{' '}
        <code>figcaption</code>). The bar is the root's <code>border-inline-start</code>, 4px wide. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
