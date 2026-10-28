import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/text-input/basic';
import basicCode from '../../examples/components/text-input/basic.tsx?raw';
import Validation from '../../examples/components/text-input/validation';
import validationCode from '../../examples/components/text-input/validation.tsx?raw';
import Variants from '../../examples/components/text-input/variants';
import variantsCode from '../../examples/components/text-input/variants.tsx?raw';
import { withBase } from '../../base';

export default function TextInputPage() {
  return (
    <article class="docs-page">
      <Title>TextInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>TextInput</h1>
      <p class="docs-lead">
        A labelled one-line text field: an <a href={withBase('/components/input')}>Input</a> in an{' '}
        <a href={withBase('/components/input-wrapper')}>InputWrapper</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { TextInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>label</code>, <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>required</code>,{' '}
        <code>withAsterisk</code>, <code>size</code>, <code>id</code>, <code>class</code> and <code>style</code> go to the
        wrapper, the root of the field. Every other prop goes to the <code>input</code>. Controlled with <code>value</code> and{' '}
        <code>onInput</code>, which fires on every keystroke, or uncontrolled.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="validation">Validation</H2>
      <p>
        <code>error</code> shows a message under the field, marks it invalid and adds the message to its description. Show it once
        the field has been left, rather than while the user is still typing.
      </p>
      <Example component={Validation} code={validationCode} />

      <H2 id="variants">Variants</H2>
      <p>
        Input's <code>outline</code>, <code>soft</code> and <code>ghost</code>, with <code>leftSection</code> and{' '}
        <code>rightSection</code>.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>input</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'JSX.Element', description: "The field's label." },
          {
            name: 'labelSection',
            type: 'JSX.Element',
            description: "Content at the end of the label's row, such as the current value or a link.",
          },
          { name: 'description', type: 'JSX.Element', description: 'Help text between the label and the field.' },
          { name: 'error', type: 'JSX.Element', description: 'Error message; marks the field invalid.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'Asterisk, and a required input.' },
          { name: 'withAsterisk', type: 'boolean', default: 'required', description: 'Shows the asterisk.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: 'Size of the label, texts and box.',
          },
          { name: 'id', type: 'string', default: 'generated', description: "The input's id. Read once." },
          {
            name: 'variant',
            type: "'outline' | 'soft' | 'ghost'",
            default: "'outline'",
            description: 'Visual style of the box.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the input.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the input.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the input read-only.' },
          { name: 'class', type: 'ClassValue', description: 'Classes for the root.' },
          { name: 'style', type: 'JSX.CSSProperties', description: 'Styles for the root.' },
          { name: 'ref', type: 'Ref<HTMLElement>', description: 'The input.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-text-input</code> and <code>.slp-input-wrapper</code>, with InputWrapper's slots and
        attributes. The box inside is an Input: <code>.slp-text-input .slp-input</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
