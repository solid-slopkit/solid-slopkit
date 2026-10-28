import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/semi-circle-progress/basic';
import basicCode from '../../examples/components/semi-circle-progress/basic.tsx?raw';
import Sizes from '../../examples/components/semi-circle-progress/sizes';
import sizesCode from '../../examples/components/semi-circle-progress/sizes.tsx?raw';
import { withBase } from '../../base';

export default function SemiCircleProgressPage() {
  return (
    <article class="docs-page">
      <Title>SemiCircleProgress · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>SemiCircleProgress</h1>
      <p class="docs-lead">
        Shows how far a task has come as a half ring, a gauge: a <code>div</code> with <code>role="progressbar"</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { SemiCircleProgress } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The arc runs from the left end over the top. Children sit centered along the bottom, inside the arc. It shares its main
        props with <a href={withBase('/components/progress')}>Progress</a> and{' '}
        <a href={withBase('/components/ring-progress')}>RingProgress</a>; here the gauge is named by the visible caption through{' '}
        <code>aria-labelledby</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="sizes">Sizes, colors and indeterminate</H2>
      <p>
        <code>size</code> sets the width, from 64 to 224px, and <code>color</code> takes a color role. Without <code>value</code>,
        a band sweeps along the arc, slowly when the user asks for reduced motion.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>aria-valuetext</code>, are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number', description: 'From 0 to max. Indeterminate if omitted.' },
          { name: 'max', type: 'number', default: '100', description: 'The value of a full arc.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color role of the arc.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Width of the gauge.' },
          {
            name: 'label',
            type: 'string',
            default: "'Progress'",
            description: 'The accessible name, unless aria-labelledby is set.',
          },
          { name: 'children', type: 'JSX.Element', description: 'Content centered along the bottom.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-semi-circle-progress</code>, with <code>data-color</code>, <code>data-size</code>,{' '}
        <code>data-indeterminate</code> and <code>data-empty</code>. Its slots are <code>semi-circle-progress-track</code> and{' '}
        <code>semi-circle-progress-arc</code>, the two SVG paths, and <code>semi-circle-progress-label</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-semi-circle-progress-color',
            default: 'var(--slp-color-<color>)',
            description: "Arc color. For a color that isn't a role.",
          },
        ]}
      />
    </article>
  );
}
