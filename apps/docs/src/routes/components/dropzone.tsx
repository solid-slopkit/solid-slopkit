import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/dropzone/basic';
import basicCode from '../../examples/components/dropzone/basic.tsx?raw';
import Browse from '../../examples/components/dropzone/browse';
import browseCode from '../../examples/components/dropzone/browse.tsx?raw';
import { withBase } from '../../base';

export default function DropzonePage() {
  return (
    <article class="docs-page">
      <Title>Dropzone · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Dropzone</h1>
      <p class="docs-lead">
        An area that takes files dropped on it, and opens the file picker when clicked. It checks the files and shows, while
        they're dragged over, whether it would take them. For a field that keeps the files, use{' '}
        <a href={withBase('/components/file-input')}>FileInput</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Dropzone } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>onDrop</code> gets the files that pass <code>accept</code>, <code>maxSize</code>, <code>minSize</code>,{' '}
        <code>maxFiles</code> and your <code>validator</code>; <code>onReject</code> gets the others, each with its error codes.
        The zone keeps no files: upload them yourself, and set <code>loading</code> meanwhile. <code>Dropzone.Idle</code>,{' '}
        <code>Dropzone.Accept</code> and <code>Dropzone.Reject</code> show their children only while nothing is dragged, while the
        dragged files would be taken, or while they wouldn't. Try dragging a PDF over it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="keyboard">Keyboard and screen readers</H2>
      <p>
        By default the zone is a button named by its content: click, Enter and Space open the picker. A button can't hold other
        controls, so for a button of your own, set <code>openOnClick={'{false}'}</code>; the zone then only takes drops, and{' '}
        <code>openRef</code> gives you the function that opens the picker.
      </p>
      <Example component={Browse} code={browseCode} />

      <H2 id="checks">Checks</H2>
      <p>
        Before the drop a browser only tells how many files there are and their MIME types, so that's what the drag state goes by.
        With an extension in <code>accept</code>, any type shows as accepted, and the drop decides. A file gets every error code
        that applies: <code>invalid-type</code>, <code>too-large</code>, <code>too-small</code>, <code>too-many-files</code> (a
        drop over <code>maxFiles</code>, or of several without <code>multiple</code>, is rejected whole), and whatever your{' '}
        <code>validator</code> returns.
      </p>

      <H2 id="props">Props</H2>
      <p>Other props are passed to the root div.</p>
      <PropsTable
        rows={[
          { name: 'onDrop', type: '(files: File[]) => void', description: 'Required. The files that pass every check.' },
          {
            name: 'onReject',
            type: '(rejections: { file: File; errors: string[] }[]) => void',
            description: 'The files that fail a check, and why.',
          },
          { name: 'accept', type: 'string', description: 'File types it takes: extensions or MIME types.' },
          {
            name: 'multiple',
            type: 'boolean',
            default: 'true',
            description: 'Several files at once; without it, several are rejected.',
          },
          { name: 'maxFiles', type: 'number', description: 'At most this many in one drop.' },
          { name: 'maxSize', type: 'number', description: 'Largest file, in bytes.' },
          { name: 'minSize', type: 'number', description: 'Smallest file, in bytes.' },
          {
            name: 'validator',
            type: '(file: File) => string | string[] | null | undefined',
            description: 'Your own check; return error codes to reject.',
          },
          {
            name: 'openOnClick',
            type: 'boolean',
            default: 'true',
            description: 'Click, Enter and Space open the picker, and the zone is a button. Read once.',
          },
          { name: 'openRef', type: '(open: () => void) => void', description: 'Gets the function that opens the picker.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Takes no files.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'A loader over the zone; takes no files.' },
          { name: 'loadingLabel', type: 'string', default: "'Loading'", description: "The loader's accessible name." },
          { name: 'color', type: 'SlopColor', default: 'primary', description: 'Color role while it would take the files.' },
          { name: 'inputRef', type: 'Ref<HTMLInputElement>', description: 'The hidden file input.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-dropzone</code>, with <code>data-color</code>, <code>data-accept</code> or{' '}
        <code>data-reject</code> while files are dragged over, <code>data-disabled</code> and <code>data-loading</code>. The
        hidden input is <code>dropzone-input</code>, the loading overlay <code>dropzone-loader</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-dropzone-color',
            default: 'var(--slp-color-<color>)',
            description: 'Edge, tint and focus ring while it would take the files.',
          },
          {
            name: '--slp-dropzone-reject-color',
            default: 'var(--slp-color-error)',
            description: "Edge and tint while it wouldn't.",
          },
        ]}
      />
    </article>
  );
}
