import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/tree/basic';
import basicCode from '../../examples/components/tree/basic.tsx?raw';
import RenderNode from '../../examples/components/tree/render-node';
import renderNodeCode from '../../examples/components/tree/render-node.tsx?raw';
import Controlled from '../../examples/components/tree/controlled';
import controlledCode from '../../examples/components/tree/controlled.tsx?raw';

export default function TreePage() {
  return (
    <article class="docs-page">
      <Title>Tree · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Tree</h1>
      <p class="docs-lead">A hierarchy of nodes, such as files in folders, that expand, collapse and can be selected.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Tree, type TreeNodeData } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Pass the nodes as <code>data</code>: each has a <code>value</code>, unique in the whole tree, a <code>label</code> and
        optional <code>children</code>. A click, Enter or Space selects a node and expands or collapses one with children. Give
        the tree a name with <code>aria-label</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="keyboard">Keyboard</H2>
      <p>
        The tree is one tab stop. Up and Down move through the visible nodes, Home and End to the first and last. Right expands a
        node, then moves to its first child; Left collapses it, or moves to its parent. <code>*</code> expands every sibling, and
        typing jumps to the next node whose label starts with what was typed.
      </p>

      <H2 id="render-node">Custom nodes</H2>
      <p>
        <code>renderNode</code> replaces each label. It gets the node, its <code>level</code>, whether it <code>hasChildren</code>
        , and its <code>expanded</code> and <code>selected</code> state, which stay current.
      </p>
      <Example component={RenderNode} code={renderNodeCode} />

      <H2 id="controlled">Controlled and multiple</H2>
      <p>
        <code>expanded</code> with <code>onExpandedChange</code>, and <code>selected</code> with <code>onSelectedChange</code>,
        put the state in your hands, e.g. to expand everything at once. With <code>multiple</code>, selecting a node adds it to
        the selection or takes it out.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>ul</code> with <code>role="tree"</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'data', type: 'TreeNodeData[]', description: 'The nodes at the top level. Required.' },
          { name: 'expanded', type: 'string[]', description: 'The expanded nodes, when controlled.' },
          { name: 'defaultExpanded', type: 'string[]', default: '[]', description: 'The nodes expanded at first.' },
          {
            name: 'onExpandedChange',
            type: '(expanded: string[]) => void',
            description: 'Called when a node expands or collapses.',
          },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Lets several nodes be selected.' },
          { name: 'selected', type: 'string | null (string[] with multiple)', description: 'The selection, when controlled.' },
          { name: 'defaultSelected', type: 'string | null (string[] with multiple)', description: 'The selection at first.' },
          {
            name: 'onSelectedChange',
            type: '(selected: string | null) => void (string[] with multiple)',
            description: 'Called when the selection changes.',
          },
          { name: 'renderNode', type: '(payload: TreeRenderNodePayload) => JSX.Element', description: 'Replaces each label.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The selected nodes' color role." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-tree</code>, with <code>data-color</code>. Each node is a <code>[data-slot="tree-item"]</code>{' '}
        (with <code>data-value</code>, <code>data-expanded</code> and <code>data-selected</code>) holding its row,{' '}
        <code>tree-node</code>, with <code>tree-chevron</code> and <code>tree-label</code>, and, when expanded, a{' '}
        <code>tree-group</code> of its children. <code>--slp-tree-color</code> sets the selected color and{' '}
        <code>--slp-tree-level-offset</code> the indent per level. The rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
    </article>
  );
}
