import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/pin-input/basic';
import basicCode from '../../examples/components/pin-input/basic.tsx?raw';
import Options from '../../examples/components/pin-input/options';
import optionsCode from '../../examples/components/pin-input/options.tsx?raw';

export default function PinInputPage() {
  return (
    <article class="docs-page">
      <Title>PinInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>PinInput</h1>
      <p class="docs-lead">
        A code split into one field per character, such as a one-time code or a PIN: typing moves to the next field, Backspace
        goes back, and a pasted or autofilled code spreads over the fields.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { PinInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is one string. <code>onComplete</code> runs when the last empty field is filled, e.g. to send the code. The
        first field asks the browser to fill in a code from a text message.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="options">Options</H2>
      <p>
        <code>length</code> sets the number of fields, <code>type="alphanumeric"</code> takes letters too, and <code>mask</code>{' '}
        hides the characters. With <code>name</code>, a hidden input submits the whole code.
      </p>
      <Example component={Options} code={optionsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the InputWrapper root. Plus InputWrapper's <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>required</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'length', type: 'number', default: '4', description: 'How many characters.' },
          { name: 'type', type: "'number' | 'alphanumeric'", default: "'number'", description: 'Which characters it takes.' },
          { name: 'value', type: 'string', description: 'The code, controlled.' },
          { name: 'defaultValue', type: 'string', description: 'The starting code, uncontrolled.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called after every change.' },
          { name: 'onComplete', type: '(value: string) => void', description: 'Called when every field is filled.' },
          { name: 'mask', type: 'boolean', default: 'false', description: 'Hides the characters.' },
          {
            name: 'oneTimeCode',
            type: 'boolean',
            default: 'true',
            description: 'Lets the browser fill a code from a text message.',
          },
          { name: 'name', type: 'string', description: 'Submits the code with a form.' },
          {
            name: 'fieldLabel',
            type: '(index, length) => string',
            default: 'Character {n} of {length}',
            description: "Each field's accessible name.",
          },
          {
            name: 'variant',
            type: "'outline' | 'soft' | 'ghost'",
            default: "'outline'",
            description: 'Visual style of the fields.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every field.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes every field read-only.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-pin-input</code> and <code>.slp-input-wrapper</code>. The row is the{' '}
        <code>pin-input-fields</code> slot and each field <code>pin-input-field</code>, with <code>data-filled</code>. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
