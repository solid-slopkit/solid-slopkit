import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/ring-progress/basic';
import basicCode from '../../examples/components/ring-progress/basic.tsx?raw';
import Colors from '../../examples/components/ring-progress/colors';
import colorsCode from '../../examples/components/ring-progress/colors.tsx?raw';
import Sizes from '../../examples/components/ring-progress/sizes';
import sizesCode from '../../examples/components/ring-progress/sizes.tsx?raw';
import Stroke from '../../examples/components/ring-progress/stroke';
import strokeCode from '../../examples/components/ring-progress/stroke.tsx?raw';
import { withBase } from '../../base';

export default function RingProgressPage() {
  return (
    <article class="docs-page">
      <Title>RingProgress · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>RingProgress</h1>
      <p class="docs-lead">
        Shows how far a task has come as a ring: a <code>div</code> with <code>role="progressbar"</code>, with content in its
        center.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { RingProgress } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The arc starts at the top and runs clockwise. Children are centered in the ring. It shares its main props with{' '}
        <a href={withBase('/components/progress')}>Progress</a>: <code>value</code> from 0 to <code>max</code>, a{' '}
        <code>label</code> or <code>aria-labelledby</code> for its name.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role and defaults to <code>primary</code>.
      </p>
      <Example component={Colors} code={colorsCode} />

      <H2 id="sizes">Sizes and indeterminate</H2>
      <p>
        <code>size</code> sets the diameter, from 40 to 144px; the stroke scales with it. Without <code>value</code>, a quarter
        arc turns around the track, slowly when the user asks for reduced motion.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="stroke">Custom size, stroke and center</H2>
      <p>
        <code>size</code> also takes a CSS length, such as <code>"12rem"</code>. <code>thickness</code> sets the stroke width in
        hundredths of the diameter (10 by default), and <code>roundCaps={'{false}'}</code> cuts the arc's ends flat. Several
        children in the center stack in a column.
      </p>
      <Example component={Stroke} code={strokeCode} column />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>aria-valuetext</code>, are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number', description: 'From 0 to max. Indeterminate if omitted.' },
          { name: 'max', type: 'number', default: '100', description: 'The value of a full ring.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color role of the arc.',
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | string",
            default: "'md'",
            description: 'Diameter of the ring: a named size or a CSS length.',
          },
          { name: 'thickness', type: 'number', default: '10', description: 'Stroke width, in hundredths of the diameter.' },
          { name: 'roundCaps', type: 'boolean', default: 'true', description: "Rounds the arc's ends; false cuts them flat." },
          {
            name: 'label',
            type: 'string',
            default: "'Progress'",
            description: 'The accessible name, unless aria-labelledby is set.',
          },
          {
            name: 'children',
            type: 'JSX.Element',
            description: 'Content centered in the ring. Several children stack in a column.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-ring-progress</code>, with <code>data-color</code>, <code>data-size</code> (a named size
        only), <code>data-round-caps</code>, <code>data-indeterminate</code> and <code>data-empty</code>. Its slots are{' '}
        <code>ring-progress-track</code> and <code>ring-progress-arc</code>, the two SVG circles, and{' '}
        <code>ring-progress-label</code>, the center. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS
        wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-ring-progress-color',
            default: 'var(--slp-color-<color>)',
            description: "Arc color. For a color that isn't a role.",
          },
        ]}
      />
    </article>
  );
}
