import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/range-slider/basic';
import basicCode from '../../examples/components/range-slider/basic.tsx?raw';
import Hours from '../../examples/components/range-slider/hours';
import hoursCode from '../../examples/components/range-slider/hours.tsx?raw';
import { withBase } from '../../base';

export default function RangeSliderPage() {
  return (
    <article class="docs-page">
      <Title>RangeSlider · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>RangeSlider</h1>
      <p class="docs-lead">
        A range picked on a track: two thumbs with <code>role="slider"</code>, and the bar between them. Everything else works
        like <a href={withBase('/components/slider')}>Slider</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { RangeSlider } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is <code>[low, high]</code>. A press on the track moves the nearest thumb; the thumbs meet but never cross.
        Screen readers hear them as “Minimum” and “Maximum” in a group named by the label.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="min-range">A minimum gap</H2>
      <p>
        <code>minRange</code> keeps the thumbs at least that far apart. <code>thumbLabels</code> renames them.
      </p>
      <Example component={Hours} code={hoursCode} />

      <H2 id="props">Props</H2>
      <p>Other props are Slider's, or go to the InputWrapper root.</p>
      <PropsTable
        rows={[
          { name: 'value', type: '[number, number]', description: 'The range, controlled.' },
          {
            name: 'defaultValue',
            type: '[number, number]',
            default: '[min, max]',
            description: 'The starting range, uncontrolled.',
          },
          { name: 'onChange', type: '(value: [number, number]) => void', description: 'Called on every step.' },
          { name: 'onChangeEnd', type: '(value: [number, number]) => void', description: 'Called when the user lets go.' },
          { name: 'minRange', type: 'number', default: '0', description: 'The smallest gap between the thumbs.' },
          {
            name: 'thumbLabels',
            type: '[string, string]',
            default: "['Minimum', 'Maximum']",
            description: "The thumbs' accessible names.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-range-slider</code> and <code>.slp-input-wrapper</code>; the slots and{' '}
        <code>--slp-slider-color</code> are Slider's, and each thumb has <code>data-index</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
