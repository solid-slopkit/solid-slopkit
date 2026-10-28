import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/progress/basic';
import basicCode from '../../examples/components/progress/basic.tsx?raw';
import Colors from '../../examples/components/progress/colors';
import colorsCode from '../../examples/components/progress/colors.tsx?raw';
import Variants from '../../examples/components/progress/variants';
import variantsCode from '../../examples/components/progress/variants.tsx?raw';

export default function ProgressPage() {
  return (
    <article class="docs-page">
      <Title>Progress · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Progress</h1>
      <p class="docs-lead">
        Shows how far a task has come: a <code>div</code> with <code>role="progressbar"</code>, a track and a bar.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Progress } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>value</code> runs from 0 to <code>max</code>, 100 by default, and is clamped to that range. Progress has no visible
        text: put the label and the percentage next to it, and point <code>aria-labelledby</code> at the label. Without one,{' '}
        <code>label</code> names it, <code>Progress</code> by default.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role and defaults to <code>primary</code>.
      </p>
      <Example component={Colors} code={colorsCode} />

      <H2 id="sizes">Sizes, stripes and indeterminate</H2>
      <p>
        <code>size</code> sets the height, from 4 to 16px. <code>striped</code> draws stripes and <code>animated</code> moves
        them. Without <code>value</code>, a band slides across the track. With reduced motion, the stripes stay still and an
        indeterminate bar pulses instead.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>aria-valuetext</code>, are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number', description: 'From 0 to max. Indeterminate if omitted.' },
          { name: 'max', type: 'number', default: '100', description: 'The value of a full bar.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color role of the bar.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Height of the track.' },
          { name: 'striped', type: 'boolean', default: 'false', description: 'Diagonal stripes on the bar.' },
          { name: 'animated', type: 'boolean', default: 'false', description: 'Moves the stripes. Implies striped.' },
          {
            name: 'label',
            type: 'string',
            default: "'Progress'",
            description: 'The accessible name, unless aria-labelledby is set.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is the track, with the class <code>.slp-progress</code> and <code>data-color</code>, <code>data-size</code>,{' '}
        <code>data-indeterminate</code>, <code>data-striped</code> and <code>data-animated</code>. The filled part is the{' '}
        <code>progress-bar</code> slot. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-progress-color',
            default: 'var(--slp-color-<color>)',
            description: "Bar color. For a color that isn't a role.",
          },
        ]}
      />
    </article>
  );
}
