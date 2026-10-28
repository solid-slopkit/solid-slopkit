import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/divider/basic';
import basicCode from '../../examples/components/divider/basic.tsx?raw';
import Vertical from '../../examples/components/divider/vertical';
import verticalCode from '../../examples/components/divider/vertical.tsx?raw';
import WithText from '../../examples/components/divider/with-text';
import withTextCode from '../../examples/components/divider/with-text.tsx?raw';
import { withBase } from '../../base';

export default function DividerPage() {
  return (
    <article class="docs-page">
      <Title>Divider · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Divider</h1>
      <p class="docs-lead">
        A thin line between content: an <code>hr</code>, horizontal or vertical.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Divider } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A horizontal divider fills the width of its container. It has no margin, so space it with the gap of a{' '}
        <a href={withBase('/components/stack')}>Stack</a>. <code>variant</code> takes <code>solid</code>, <code>dashed</code> or{' '}
        <code>dotted</code>, and <code>color</code> a color role; without one, the line is a muted text color.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="vertical">Vertical</H2>
      <p>
        A vertical divider is as tall as its row in a <a href={withBase('/components/group')}>Group</a> or Flex. HTML doesn't
        allow an <code>hr</code> inside a <code>p</code>, so put it in a row or a <code>div</code>.
      </p>
      <Example component={Vertical} code={verticalCode} />

      <H2 id="with-text">With text</H2>
      <p>
        Divider has no label. For a line with text in it, put two Dividers and a Text in a Group, and keep the text from
        shrinking: the Dividers share the space it leaves.
      </p>
      <Example component={WithText} code={withTextCode} column />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>hr</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: 'Direction of the line.',
          },
          { name: 'variant', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Line style.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role. Muted text color when omitted.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-divider</code>, and no slots. State and variant are attributes on it:{' '}
        <code>data-orientation</code>, <code>data-variant</code> and <code>data-color</code>. The line is a border (
        <code>border-top</code>, or <code>border-inline-start</code> when vertical), 1px wide. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
