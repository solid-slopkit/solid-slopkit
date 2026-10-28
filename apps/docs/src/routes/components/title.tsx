import { Title as PageTitle } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Levels from '../../examples/components/title/levels';
import levelsCode from '../../examples/components/title/levels.tsx?raw';
import Size from '../../examples/components/title/size';
import sizeCode from '../../examples/components/title/size.tsx?raw';
import Colors from '../../examples/components/title/colors';
import colorsCode from '../../examples/components/title/colors.tsx?raw';
import { withBase } from '../../base';

export default function TitlePage() {
  return (
    <article class="docs-page">
      <PageTitle>Title · slopkit</PageTitle>
      <p class="docs-eyebrow">Components</p>
      <h1>Title</h1>
      <p class="docs-lead">
        A heading, <code>h1</code> to <code>h6</code>, sized from the heading scale tokens.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Title } from '@solid-slopkit/components';`} />

      <H2 id="order">Order</H2>
      <p>
        <code>order</code> renders <code>h1</code> to <code>h6</code> and gives it that level's look. The default is{' '}
        <code>1</code>. Pick it for the document outline. The margin is reset to <code>0</code>, so a{' '}
        <a href={withBase('/components/stack')}>Stack</a> spaces headings.
      </p>
      <Example component={Levels} code={levelsCode} column />

      <H2 id="size">Size</H2>
      <p>
        <code>size</code> changes only the look, so the outline stays correct.
      </p>
      <Example component={Size} code={sizeCode} column />

      <H2 id="color-and-weight">Color and weight</H2>
      <p>
        <code>color</code> takes a color role; without it, Title inherits its parent's color. <code>dimmed</code> mutes it. The
        weight is <code>--slp-heading-weight</code> unless <code>weight</code> overrides it. For part of a heading in another
        style, nest a <a href={withBase('/components/text')}>Text</a> with <code>as="span"</code> and <code>inherit</code>.
      </p>
      <Example component={Colors} code={colorsCode} column />

      <H2 id="props">Props</H2>
      <p>Other props are passed to the heading element.</p>
      <PropsTable
        rows={[
          {
            name: 'order',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            default: '1',
            description: 'Heading level: the element, and its look by default.',
          },
          {
            name: 'size',
            type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
            default: "the order's",
            description: 'The look of another level.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: "Color role. Inherits the parent's color when omitted.",
          },
          {
            name: 'dimmed',
            type: 'boolean',
            default: 'false',
            description: (
              <>
                Mutes the heading (<code>--slp-color-muted-content</code>).
              </>
            ),
          },
          {
            name: 'weight',
            type: "'normal' | 'medium' | 'semibold' | 'bold'",
            default: 'heading weight',
            description: 'Font weight.',
          },
          {
            name: 'align',
            type: "'start' | 'center' | 'end' | 'justify'",
            description: 'Text alignment. Inherited when omitted.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-title</code>, and no slots. State and variant are attributes on it:{' '}
        <code>data-order</code>, <code>data-size</code> (the order's level unless <code>size</code> is set),{' '}
        <code>data-color</code>, <code>data-dimmed</code>, <code>data-weight</code> and <code>data-align</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins. The heading tokens are set on <code>:root</code> in{' '}
        <code>slopkit.css</code>.
      </p>
    </article>
  );
}
