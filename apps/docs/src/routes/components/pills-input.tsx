import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/pills-input/basic';
import basicCode from '../../examples/components/pills-input/basic.tsx?raw';
import Variants from '../../examples/components/pills-input/variants';
import variantsCode from '../../examples/components/pills-input/variants.tsx?raw';

export default function PillsInputPage() {
  return (
    <article class="docs-page">
      <Title>PillsInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>PillsInput</h1>
      <p class="docs-lead">
        A field box that holds pills and a text field after them, in rows that wrap. It's the base of MultiSelect and TagsInput;
        use it directly for a field of values they don't cover.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Pill, PillsInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Put Pills and one <code>PillsInput.Field</code> in it. The pills take its size and disabled state, and wrap onto more rows
        as they fill it. The field takes the label, description, error and <code>required</code> state, and a press anywhere on
        the box focuses it. What a key does is yours: here Enter adds a tag, and Backspace in the empty field removes the last
        one.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Variants, sections and states</H2>
      <p>
        The box is an Input's box: <code>variant</code>, <code>size</code>, <code>leftSection</code> and <code>rightSection</code>{' '}
        work the same, and with one row it's exactly as tall as an Input of the same size. The sections stay on the first row.{' '}
        <code>error</code> marks it invalid; <code>disabled</code> disables the field and the pills' remove buttons.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>class</code> and <code>style</code> go to the root, with the label and texts; other props go to the box.{' '}
        <code>PillsInput.Field</code> takes an <code>input</code>'s props except <code>id</code>: it uses the PillsInput's.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'JSX.Element', description: 'The label, which names the field.' },
          {
            name: 'labelSection',
            type: 'JSX.Element',
            description: "Content at the end of the label's row, such as the current value or a link.",
          },
          { name: 'description', type: 'JSX.Element', description: 'A hint under the label.' },
          { name: 'error', type: 'JSX.Element | boolean', description: 'An error under the box, which marks it invalid.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'An asterisk, and required on the field.' },
          { name: 'withAsterisk', type: 'boolean', default: 'required', description: 'Shows the asterisk without required.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: 'The box, the field and the pills.',
          },
          { name: 'id', type: 'string', default: 'generated', description: "The field's id." },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the pills, usually an icon.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the field: an icon or a button.' },
          { name: 'invalid', type: 'boolean', default: 'error', description: 'Marks the box invalid.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field and the pills.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-pills-input</code> and <code>.slp-input-wrapper</code>, and the field{' '}
        <code>.slp-pills-input-field</code>. The box is <code>[data-slot="pills-input-box"]</code>, and also an{' '}
        <code>.slp-input</code> with Input's attributes; the pills and the field are in{' '}
        <code>[data-slot="pills-input-content"]</code>. The rules live in <code>@layer slopkit.components</code>, so unlayered CSS
        wins.
      </p>
    </article>
  );
}
