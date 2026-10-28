import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/file-input/basic';
import basicCode from '../../examples/components/file-input/basic.tsx?raw';
import Multiple from '../../examples/components/file-input/multiple';
import multipleCode from '../../examples/components/file-input/multiple.tsx?raw';
import { withBase } from '../../base';

export default function FileInputPage() {
  return (
    <article class="docs-page">
      <Title>FileInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>FileInput</h1>
      <p class="docs-lead">
        A labelled field for files: it looks like a text field, and its control is a button that opens the file picker and shows
        the chosen names. For a plain button, use <a href={withBase('/components/file-button')}>FileButton</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { FileInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is a <code>File</code> or <code>null</code>. <code>clearable</code> adds a clear button. Screen readers hear the
        label, then the chosen names. A hidden file input holds the files, so a form submits them under <code>name</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several files</H2>
      <p>
        With <code>multiple</code>, the value is a <code>File[]</code>; the types follow the prop. <code>valueFormat</code> shows
        the files your way.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="props">Props</H2>
      <p>Other props are passed to the button; the wrapper's are TextInput's.</p>
      <PropsTable
        rows={[
          {
            name: 'multiple',
            type: 'boolean',
            default: 'false',
            description: 'Several files; the value is an array. Read once.',
          },
          { name: 'value', type: 'File | null, or File[] with multiple', description: 'The files, controlled.' },
          {
            name: 'defaultValue',
            type: 'File | null, or File[] with multiple',
            description: 'The files at first, uncontrolled.',
          },
          {
            name: 'onChange',
            type: '(value: File | null), or (value: File[])',
            description: 'Called with the chosen or cleared files.',
          },
          { name: 'accept', type: 'string', description: 'File types to offer.' },
          { name: 'capture', type: "'user' | 'environment'", description: "Opens a phone's camera." },
          { name: 'name', type: 'string', description: 'Submits the files with a form.' },
          { name: 'placeholder', type: 'string', default: 'Choose a file / Choose files', description: 'Shown while empty.' },
          {
            name: 'valueFormat',
            type: '(files: File[]) => JSX.Element',
            default: 'the names',
            description: 'How the files show.',
          },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'A button that clears the files. Read once.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's accessible name." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-file-input</code> and <code>.slp-input-wrapper</code>. The button is the Input's{' '}
        <code>input-control</code>, with <code>data-empty</code>; the names are in <code>file-input-value</code>, and the hidden
        file input is <code>file-input-input</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS
        wins.
      </p>
    </article>
  );
}
