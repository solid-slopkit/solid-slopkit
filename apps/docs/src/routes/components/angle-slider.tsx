import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/angle-slider/basic';
import basicCode from '../../examples/components/angle-slider/basic.tsx?raw';
import Compass from '../../examples/components/angle-slider/compass';
import compassCode from '../../examples/components/angle-slider/compass.tsx?raw';

export default function AngleSliderPage() {
  return (
    <article class="docs-page">
      <Title>AngleSlider · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>AngleSlider</h1>
      <p class="docs-lead">
        An angle picked on a dial: a circle with <code>role="slider"</code>, 0° at the top and clockwise. The pointer drags the
        thumb around the center, and the keyboard steps it. It wraps around.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { AngleSlider } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is degrees in <code>[0, 360)</code>. A press on the dial points the angle at it; arrows step, Page Up and Down
        turn 15°, Home goes to 0.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="steps">Steps and names</H2>
      <p>
        <code>step</code> sets the grid, <code>marks</code> puts dots on the ring, and <code>valueText</code> and{' '}
        <code>valueLabel</code> say and show the angle your way.
      </p>
      <Example component={Compass} code={compassCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the InputWrapper root. Plus InputWrapper's <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>withAsterisk</code>, <code>size</code> and <code>id</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number', description: 'The angle, controlled.' },
          { name: 'defaultValue', type: 'number', default: '0', description: 'The starting angle, uncontrolled.' },
          { name: 'onChange', type: '(value: number) => void', description: 'Called on every step.' },
          { name: 'onChangeEnd', type: '(value: number) => void', description: 'Called when the user lets go.' },
          { name: 'step', type: 'number', default: '1', description: 'The step, and the grid angles snap to.' },
          { name: 'largeStep', type: 'number', default: '15', description: 'Page Up and Page Down.' },
          { name: 'marks', type: 'number[]', description: 'Angles to mark with a dot.' },
          {
            name: 'valueLabel',
            type: '((value: number) => JSX.Element) | null',
            default: '90°',
            description: 'The text in the middle.',
          },
          {
            name: 'valueText',
            type: '(value: number) => string',
            default: '90 degrees',
            description: 'The angle as screen readers say it.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color of the arc and thumb.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          { name: 'name', type: 'string', description: 'Submits the angle with a form.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-angle-slider</code> and <code>.slp-input-wrapper</code>. Its slots are{' '}
        <code>angle-slider-dial</code> (with <code>data-dragging</code>), <code>angle-slider-thumb</code>,{' '}
        <code>angle-slider-mark</code>, <code>angle-slider-label</code> and <code>angle-slider-input</code>; the root has{' '}
        <code>data-color</code> and <code>data-disabled</code>. Its rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[{ name: '--slp-angle-slider-color', default: 'var(--slp-color-<color>)', description: 'The arc and the thumb.' }]}
      />
    </article>
  );
}
