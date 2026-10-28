import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/json-input/basic';
import basicCode from '../../examples/components/json-input/basic.tsx?raw';
import { withBase } from '../../base';

export default function JsonInputPage() {
  return (
    <article class="docs-page">
      <Title>JsonInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>JsonInput</h1>
      <p class="docs-lead">
        A labelled field for JSON: a <a href={withBase('/components/textarea')}>Textarea</a> in a monospace font that checks the
        text when the field loses focus, shows an error while it's invalid, and can format it.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { JsonInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is the text. Leaving the field checks it: invalid text shows “Invalid JSON”, which goes away as soon as the text
        is valid again. <code>formatOnBlur</code> formats valid text. Break the JSON below and leave the field.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="props">Props</H2>
      <p>Other props are Textarea's, or go to the textarea.</p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'The text, controlled.' },
          { name: 'defaultValue', type: 'string', default: "''", description: 'The starting text, uncontrolled.' },
          {
            name: 'onChange',
            type: '(value: string) => void',
            description: 'Called with the text, and with the formatted text.',
          },
          {
            name: 'formatOnBlur',
            type: 'boolean',
            default: 'false',
            description: 'Formats valid JSON when the field loses focus.',
          },
          { name: 'indent', type: 'number', default: '2', description: 'Spaces per level when formatting.' },
          {
            name: 'validationError',
            type: 'JSX.Element',
            default: "'Invalid JSON'",
            description: 'The message for invalid text.',
          },
          { name: 'error', type: 'JSX.Element', description: 'Your error, shown instead.' },
          {
            name: 'deserialize',
            type: '(text: string) => unknown',
            default: 'JSON.parse',
            description: 'Parses the text; throws when invalid.',
          },
          {
            name: 'serialize',
            type: '(value: unknown, indent: number) => string',
            default: 'JSON.stringify',
            description: 'Turns the value back into text.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-json-input</code>, <code>.slp-textarea</code> and <code>.slp-input-wrapper</code>; the
        textarea has <code>data-invalid-json</code> while the text is invalid. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
