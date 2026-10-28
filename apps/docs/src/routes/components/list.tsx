import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/list/basic';
import basicCode from '../../examples/components/list/basic.tsx?raw';
import Ordered from '../../examples/components/list/ordered';
import orderedCode from '../../examples/components/list/ordered.tsx?raw';
import Icons from '../../examples/components/list/icons';
import iconsCode from '../../examples/components/list/icons.tsx?raw';
import Nested from '../../examples/components/list/nested';
import nestedCode from '../../examples/components/list/nested.tsx?raw';
import { withBase } from '../../base';

const sizes = "'xs' | 'sm' | 'md' | 'lg' | 'xl'";

export default function ListPage() {
  return (
    <article class="docs-page">
      <Title>List · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>List</h1>
      <p class="docs-lead">
        A list of items: a <code>ul</code>, or an <code>ol</code> with <code>ordered</code>. Its children are{' '}
        <code>List.Item</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { List } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Items keep the browser's markers. Without <code>size</code>, a list inherits the font size and line height around it;{' '}
        <code>spacing</code> adds a gap between items. List has no margin; space it with a{' '}
        <a href={withBase('/components/stack')}>Stack</a>.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="ordered">Ordered</H2>
      <p>
        <code>ordered</code> renders an <code>ol</code>. The native attributes pass through: <code>start</code>,{' '}
        <code>reversed</code>, and <code>type</code> for the numbering style.
      </p>
      <Example component={Ordered} code={orderedCode} column />

      <H2 id="icons">Icons</H2>
      <p>
        <code>icon</code> on the List replaces every item's marker; an item's own <code>icon</code> wins, and{' '}
        <code>{'icon={null}'}</code> gives it its marker back. Icons are centered on the item's first line, and a list whose items
        all have icons drops the indent. Mark decorative icons <code>aria-hidden</code>.
      </p>
      <Example component={Icons} code={iconsCode} column />

      <H2 id="nested">Nested</H2>
      <p>Put a List inside a List.Item, after the item's text.</p>
      <Example component={Nested} code={nestedCode} column />

      <H2 id="list-props">List props</H2>
      <p>
        Other props are passed to the <code>ul</code> or <code>ol</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'ordered', type: 'boolean', default: 'false', description: 'Renders a numbered ol.' },
          { name: 'size', type: sizes, description: 'Font size and line height. Inherited if omitted.' },
          { name: 'spacing', type: sizes, description: 'Gap between items. None if omitted.' },
          { name: 'icon', type: 'JSX.Element', description: "Replaces every item's marker." },
          { name: 'start', type: 'number', description: 'ol only. The first number.' },
          { name: 'reversed', type: 'boolean', default: 'false', description: 'ol only. Counts down.' },
          { name: 'type', type: "'1' | 'a' | 'A' | 'i' | 'I'", default: "'1'", description: 'ol only. Numbering style.' },
        ]}
      />

      <H2 id="list-item-props">List.Item props</H2>
      <p>
        Other props are passed to the <code>li</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'icon',
            type: 'JSX.Element',
            description: "Replaces this item's marker. Overrides the List's; null removes it.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The list has the class <code>.slp-list</code>, with <code>data-size</code> and <code>data-spacing</code>; each item has{' '}
        <code>.slp-list-item</code>. An item with an icon has <code>data-with-icon</code> and two slots,{' '}
        <code>list-item-icon</code> and <code>list-item-content</code>. Markers are the native <code>::marker</code>. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
