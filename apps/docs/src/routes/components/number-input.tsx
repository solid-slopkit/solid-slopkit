import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/number-input/basic';
import basicCode from '../../examples/components/number-input/basic.tsx?raw';
import Format from '../../examples/components/number-input/format';
import formatCode from '../../examples/components/number-input/format.tsx?raw';
import Step from '../../examples/components/number-input/step';
import stepCode from '../../examples/components/number-input/step.tsx?raw';

export default function NumberInputPage() {
  return (
    <article class="docs-page">
      <Title>NumberInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>NumberInput</h1>
      <p class="docs-lead">
        A labelled number field: a text input with the <code>spinbutton</code> role, formatted for the locale. Arrow keys and the
        controls step it; leaving the field clamps and rounds it.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { NumberInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is a <code>number</code>, or <code>undefined</code> when the field is empty. Passing <code>value</code> at all
        makes it controlled. Only digits, one decimal separator and a leading minus can be typed. Try typing 150 and leaving the
        field: it clamps to 99.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="format">Locale and decimals</H2>
      <p>
        The provider's <code>locale</code>, or <code>locale</code> for one field, sets the separators. While the field isn't
        focused the number is grouped; while editing it isn't, so the caret doesn't jump. <code>decimalScale</code> limits the
        decimals and <code>fixedDecimalScale</code> pads them.
      </p>
      <Example component={Format} code={formatCode} />

      <H2 id="step">Stepping</H2>
      <p>
        Arrow Up and Down step by <code>step</code>, Page Up and Down by ten steps. The controls do the same, and holding one
        keeps stepping; they're out of the tab order and keep the focus in the field. <code>hideControls</code> hides them.
      </p>
      <Example component={Step} code={stepCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>input</code>; the wrapper's are TextInput's.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number | undefined', description: 'The number, controlled.' },
          { name: 'defaultValue', type: 'number', description: 'The starting number, uncontrolled.' },
          { name: 'onChange', type: '(value: number | undefined) => void', description: 'Called with the new number.' },
          { name: 'min', type: 'number', description: 'The smallest number.' },
          { name: 'max', type: 'number', description: 'The largest number.' },
          { name: 'step', type: 'number', default: '1', description: 'The amount one step changes it.' },
          { name: 'decimalScale', type: 'number', description: 'Most digits after the decimal separator.' },
          {
            name: 'fixedDecimalScale',
            type: 'boolean',
            default: 'false',
            description: 'Pads the shown number to decimalScale digits.',
          },
          {
            name: 'allowNegative',
            type: 'boolean',
            default: 'min below 0 or unset',
            description: 'Whether a minus can be typed.',
          },
          { name: 'grouping', type: 'boolean', default: 'true', description: 'Group separators while not focused.' },
          { name: 'locale', type: 'string', default: "the provider's", description: 'A locale for this field.' },
          { name: 'hideControls', type: 'boolean', default: 'false', description: 'Hides the buttons. Read once.' },
          { name: 'incrementLabel', type: 'string', default: "'Increase'", description: 'Accessible name of the up button.' },
          { name: 'decrementLabel', type: 'string', default: "'Decrease'", description: 'Accessible name of the down button.' },
          {
            name: 'variant',
            type: "'outline' | 'soft' | 'ghost'",
            default: "'outline'",
            description: 'Visual style of the box.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the input.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the input, before the controls.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and the controls.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'No typing or stepping.' },
          { name: 'ref', type: 'Ref<HTMLElement>', description: 'The input.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-number-input</code> and <code>.slp-input-wrapper</code>. The controls have the slots{' '}
        <code>number-input-controls</code>, <code>number-input-increment</code> and <code>number-input-decrement</code>. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
