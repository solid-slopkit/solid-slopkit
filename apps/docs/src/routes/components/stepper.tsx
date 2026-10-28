import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/stepper/basic';
import basicCode from '../../examples/components/stepper/basic.tsx?raw';
import Icons from '../../examples/components/stepper/icons';
import iconsCode from '../../examples/components/stepper/icons.tsx?raw';
import Vertical from '../../examples/components/stepper/vertical';
import verticalCode from '../../examples/components/stepper/vertical.tsx?raw';

export default function StepperPage() {
  return (
    <article class="docs-page">
      <Title>Stepper · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Stepper</h1>
      <p class="docs-lead">
        Progress through steps, such as a form split into parts: the steps in order with the current one marked, and the current
        step's content under them.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Stepper } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>active</code> is the current step's index, and it's yours to change: here from the buttons, and from the steps
        themselves through <code>onStepClick</code>, which makes them buttons. The steps before the current one are completed and
        get a check mark; the line after a completed step takes the color. Only the current step's content is rendered. Past the
        last step, <code>Stepper.Completed</code> shows.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="icons">Icons, loading and color</H2>
      <p>
        <code>icon</code> replaces a step's number and <code>completedIcon</code> its check mark; <code>loading</code> shows a
        loader in the circle. <code>color</code> sets the role of the current and completed steps, on the Stepper or on one step,
        and <code>size</code> goes from <code>xs</code> to <code>xl</code>.
      </p>
      <Example component={Icons} code={iconsCode} />

      <H2 id="vertical">Vertical</H2>
      <p>
        <code>orientation="vertical"</code> stacks the steps with the lines running down. With{' '}
        <code>allowNextStepsSelect={'{false}'}</code>, only the completed steps and the current one can be clicked; a step's{' '}
        <code>allowStepSelect</code> overrides that for it.
      </p>
      <Example component={Vertical} code={verticalCode} />

      <H2 id="props">Props</H2>
      <p>
        Stepper passes other props to its <code>div</code>. <code>Stepper.Step</code> takes <code>label</code>,{' '}
        <code>description</code>, <code>icon</code>, <code>completedIcon</code>, <code>loading</code>, <code>color</code>,{' '}
        <code>allowStepSelect</code>, and its content as children; <code>Stepper.Completed</code> takes children.
      </p>
      <PropsTable
        rows={[
          { name: 'active', type: 'number', description: "The current step's index, from 0. Required." },
          { name: 'onStepClick', type: '(index: number) => void', description: 'Makes the steps buttons.' },
          {
            name: 'allowNextStepsSelect',
            type: 'boolean',
            default: 'true',
            description: 'Lets the steps after the current one be clicked.',
          },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The current and completed steps' color." },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'The circles and the text.' },
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: 'Steps in a row, or a column.',
          },
          {
            name: 'completedLabel',
            type: 'string',
            default: "'Completed'",
            description: "Read out after a completed step's label.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-stepper</code>, with <code>data-orientation</code>, <code>data-color</code>, <code>data-size</code>{' '}
        and <code>data-completed</code>. The steps' list is <code>[data-slot="stepper-steps"]</code>. Each step is{' '}
        <code>.slp-stepper-step</code> (<code>[data-slot="stepper-step"]</code>) with <code>data-state</code> (
        <code>completed</code>, <code>current</code> or <code>upcoming</code>), <code>data-color</code> and <code>data-last</code>
        , holding <code>[data-slot="stepper-step-control"]</code> (the button, or a <code>div</code>) with{' '}
        <code>[data-slot="stepper-step-icon"]</code> (and its <code>stepper-step-number</code>),{' '}
        <code>[data-slot="stepper-step-body"]</code> with <code>stepper-step-label</code> and{' '}
        <code>stepper-step-description</code>, then <code>[data-slot="stepper-separator"]</code>; the content is{' '}
        <code>[data-slot="stepper-content"]</code>. <code>--slp-stepper-color</code> and <code>--slp-stepper-content</code> set
        the colors. The rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
