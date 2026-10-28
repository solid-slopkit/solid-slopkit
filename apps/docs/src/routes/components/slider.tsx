import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/slider/basic';
import basicCode from '../../examples/components/slider/basic.tsx?raw';
import Marks from '../../examples/components/slider/marks';
import marksCode from '../../examples/components/slider/marks.tsx?raw';
import { withBase } from '../../base';

export default function SliderPage() {
  return (
    <article class="docs-page">
      <Title>Slider · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Slider</h1>
      <p class="docs-lead">
        A value picked on a track: a thumb with <code>role="slider"</code> that the pointer drags and the keyboard steps. For two
        values, use <a href={withBase('/components/range-slider')}>RangeSlider</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Slider } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A press anywhere on the track jumps there and starts a drag. The arrow keys step, Page Up and Down take ten steps, Home
        and End go to the ends. <code>onChange</code> runs on every step; <code>onChangeEnd</code> when the user lets go, for work
        like saving.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="marks">Marks and steps</H2>
      <p>
        <code>marks</code> puts a dot on the track for each value, with an optional label. <code>step</code> sets the grid; steps
        keep its decimals. <code>valueText</code> says the value to screen readers in words.
      </p>
      <Example component={Marks} code={marksCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the InputWrapper root. Plus InputWrapper's <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>required</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number', description: 'The value, controlled.' },
          { name: 'defaultValue', type: 'number', default: 'min', description: 'The starting value, uncontrolled.' },
          { name: 'onChange', type: '(value: number) => void', description: 'Called on every step.' },
          { name: 'onChangeEnd', type: '(value: number) => void', description: 'Called when the user lets go.' },
          { name: 'min', type: 'number', default: '0', description: 'The smallest value.' },
          { name: 'max', type: 'number', default: '100', description: 'The largest value.' },
          { name: 'step', type: 'number', default: '1', description: 'The step, and the grid values snap to.' },
          { name: 'largeStep', type: 'number', default: 'ten steps', description: 'Page Up and Page Down.' },
          {
            name: 'marks',
            type: '{ value: number; label?: JSX.Element }[]',
            description: 'Dots on the track, with optional labels.',
          },
          {
            name: 'valueLabel',
            type: '((value: number) => JSX.Element) | null',
            default: 'the value',
            description: 'The bubble over the thumb; null hides it.',
          },
          { name: 'valueLabelAlwaysOn', type: 'boolean', default: 'false', description: 'Shows the bubble all the time.' },
          {
            name: 'valueText',
            type: '(value: number) => string',
            default: 'the number',
            description: 'The value as screen readers say it.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color of the bar and thumb.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          { name: 'name', type: 'string', description: 'Submits the value with a form.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-slider</code> and <code>.slp-input-wrapper</code>. Its slots are{' '}
        <code>slider-root</code>, <code>slider-track</code>, <code>slider-bar</code>, <code>slider-mark</code>,{' '}
        <code>slider-mark-label</code>, <code>slider-thumb</code>, <code>slider-value-label</code> and <code>slider-input</code>.
        Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-slider-color',
            default: 'var(--slp-color-<color>)',
            description: "The bar, the thumb's border, the focus ring.",
          },
        ]}
      />
    </article>
  );
}
