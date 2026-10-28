import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Inline from '../../examples/components/code/inline';
import inlineCode from '../../examples/components/code/inline.tsx?raw';
import Block from '../../examples/components/code/block';
import blockCode from '../../examples/components/code/block.tsx?raw';
import Scrolling from '../../examples/components/code/scrolling';
import scrollingCode from '../../examples/components/code/scrolling.tsx?raw';
import { withBase } from '../../base';

export default function CodePage() {
  return (
    <article class="docs-page">
      <Title>Code · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Code</h1>
      <p class="docs-lead">
        Code in a monospace font: inline <code>code</code>, or a <code>pre</code> block with <code>block</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Code } from '@solid-slopkit/components';`} />

      <H2 id="inline">Inline</H2>
      <p>Inline code is sized in em, so it fits text of any size.</p>
      <Example component={Inline} code={inlineCode} />

      <H2 id="block">Block</H2>
      <p>
        <code>block</code> renders a <code>pre</code> that keeps line breaks and indentation. Pass the source as a string: JSX
        collapses whitespace in plain text children. HTML doesn't allow a <code>pre</code> inside a <code>p</code>, so put a block
        in a <a href={withBase('/components/stack')}>Stack</a> or a <code>div</code>.
      </p>
      <Example component={Block} code={blockCode} />

      <H2 id="scrolling">Long lines</H2>
      <p>
        A long line scrolls sideways instead of wrapping. A block has <code>tabindex={'{0}'}</code>, so keyboard users can focus
        it and scroll with the arrow keys; pass <code>tabindex={'{-1}'}</code> to drop the tab stop when the block can't scroll.
      </p>
      <Example component={Scrolling} code={scrollingCode} />
      <p>
        Code doesn't highlight syntax. Its children can be any elements, so markup from a highlighter goes inside a block as it
        is.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>code</code> (inline) or the <code>pre</code> (block).
      </p>
      <PropsTable
        rows={[
          {
            name: 'block',
            type: 'boolean',
            default: 'false',
            description: 'A pre block that keeps line breaks and scrolls sideways.',
          },
          {
            name: 'tabindex',
            type: 'number',
            default: '0',
            description: 'Block only. The tab stop that lets the keyboard scroll it.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-code</code>: the <code>code</code> when inline, the <code>pre</code> as a block, which
        also has <code>data-block</code>. Inside a block, the <code>code-content</code> slot is the <code>code</code> element; it
        inherits the font from the <code>pre</code>. The font is <code>--slp-font-family-monospace</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
