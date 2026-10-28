import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/file-button/basic';
import basicCode from '../../examples/components/file-button/basic.tsx?raw';
import Multiple from '../../examples/components/file-button/multiple';
import multipleCode from '../../examples/components/file-button/multiple.tsx?raw';
import Icon from '../../examples/components/file-button/icon';
import iconCode from '../../examples/components/file-button/icon.tsx?raw';
import { withBase } from '../../base';

export default function FileButtonPage() {
  return (
    <article class="docs-page">
      <Title>FileButton · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>FileButton</h1>
      <p class="docs-lead">
        A <a href={withBase('/components/button')}>Button</a> that opens the browser's file picker and hands the chosen files to{' '}
        <code>onChange</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { FileButton } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A press opens the picker, and <code>onChange</code> gets the chosen <code>File</code>. It isn't called when the picker is
        cancelled. <code>accept</code> filters what the picker offers, by extension or MIME type; it doesn't check the files, so
        check them yourself. Every Button prop works.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several files</H2>
      <p>
        With <code>multiple</code>, <code>onChange</code> gets a <code>File[]</code>; the type follows the prop. The input is
        cleared after each choice, so picking the same file again calls <code>onChange</code> again; keep what you need.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="icon">Icon only</H2>
      <p>
        <code>shape="square"</code> and an <code>aria-label</code>, as on Button.
      </p>
      <Example component={Icon} code={iconCode} />

      <H2 id="forms">Forms</H2>
      <p>
        The input has no <code>name</code> and is cleared after each choice, so it sends nothing with a form. Upload the files
        yourself, or append them to a <code>FormData</code>.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>button</code>, including Button's <code>variant</code>, <code>color</code>,{' '}
        <code>size</code>, <code>shape</code>, <code>loading</code> and sections. <code>onClick</code> runs before the picker
        opens, and <code>event.preventDefault()</code> in it keeps the picker closed.
      </p>
      <PropsTable
        rows={[
          {
            name: 'onChange',
            type: '(file: File) => void, or (files: File[]) => void with multiple',
            default: 'required',
            description: 'Called with what was chosen. Not called on cancel.',
          },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Lets the user pick several files.' },
          { name: 'accept', type: 'string', description: 'File types to offer: extensions or MIME types.' },
          { name: 'capture', type: "'user' | 'environment'", description: 'On phones, opens the front or back camera.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The button has the classes <code>.slp-file-button</code> and <code>.slp-button</code>, with Button's attributes and CSS
        variables. The hidden input, its next sibling, has the slot <code>file-button-input</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
