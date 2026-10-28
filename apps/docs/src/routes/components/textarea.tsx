import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/textarea/basic';
import basicCode from '../../examples/components/textarea/basic.tsx?raw';
import Autosize from '../../examples/components/textarea/autosize';
import autosizeCode from '../../examples/components/textarea/autosize.tsx?raw';
import { withBase } from '../../base';

export default function TextareaPage() {
  return (
    <article class="docs-page">
      <Title>Textarea · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Textarea</h1>
      <p class="docs-lead">
        A labelled multi-line text field: an <a href={withBase('/components/input')}>Input</a> with a <code>textarea</code>, in an{' '}
        <a href={withBase('/components/input-wrapper')}>InputWrapper</a>. With <code>autosize</code>, it grows and shrinks with
        its text.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Textarea } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Props are split like <a href={withBase('/components/text-input')}>TextInput</a>'s: the wrapper's go to the root, every
        other prop to the <code>textarea</code>. Without <code>autosize</code>, <code>rows</code> sets the height and the user can
        drag it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="autosize">Autosize</H2>
      <p>
        <code>autosize</code> fits the height to the text after each keystroke, a new <code>value</code>, or a change of width. It
        never goes below <code>minRows</code> and, with <code>maxRows</code>, scrolls once it's that tall. It measures on a hidden
        copy, so the page doesn't jump.
      </p>
      <Example component={Autosize} code={autosizeCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>textarea</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'autosize', type: 'boolean', default: 'false', description: 'Fits the height to the text. Read once.' },
          { name: 'minRows', type: 'number', default: '1', description: 'With autosize, the fewest rows.' },
          { name: 'maxRows', type: 'number', description: 'With autosize, the most rows; then it scrolls.' },
          { name: 'rows', type: 'number', description: 'Without autosize, the height in rows.' },
          { name: 'label', type: 'JSX.Element', description: "The field's label." },
          {
            name: 'labelSection',
            type: 'JSX.Element',
            description: "Content at the end of the label's row, such as the current value or a link.",
          },
          { name: 'description', type: 'JSX.Element', description: 'Help text between the label and the field.' },
          { name: 'error', type: 'JSX.Element', description: 'Error message; marks the field invalid.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'Asterisk, and a required textarea.' },
          { name: 'withAsterisk', type: 'boolean', default: 'required', description: 'Shows the asterisk.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: 'Size of the label, texts and box.',
          },
          { name: 'id', type: 'string', default: 'generated', description: "The textarea's id. Read once." },
          {
            name: 'variant',
            type: "'outline' | 'soft' | 'ghost'",
            default: "'outline'",
            description: 'Visual style of the box.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the textarea, on the first line.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the textarea, on the first line.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the textarea.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the textarea read-only.' },
          { name: 'class', type: 'ClassValue', description: 'Classes for the root.' },
          { name: 'style', type: 'JSX.CSSProperties', description: 'Styles for the root.' },
          { name: 'ref', type: 'Ref<HTMLElement>', description: 'The textarea.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-textarea</code> and <code>.slp-input-wrapper</code>. The box inside is an Input, and
        the textarea is its <code>input-control</code> slot, with <code>data-autosize</code> when autosized. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
