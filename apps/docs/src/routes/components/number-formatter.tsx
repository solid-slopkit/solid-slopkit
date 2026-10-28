import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/number-formatter/basic';
import basicCode from '../../examples/components/number-formatter/basic.tsx?raw';
import Locales from '../../examples/components/number-formatter/locales';
import localesCode from '../../examples/components/number-formatter/locales.tsx?raw';

export default function NumberFormatterPage() {
  return (
    <article class="docs-page">
      <Title>NumberFormatter · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>NumberFormatter</h1>
      <p class="docs-lead">
        A number formatted for the reader's locale with <code>Intl.NumberFormat</code>: a <code>span</code> with the text.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { NumberFormatter } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>options</code> goes to <code>Intl.NumberFormat</code> as it is: currencies, percentages, units, compact notation,
        signs. <code>prefix</code> and <code>suffix</code> add plain text around the result. <code>null</code> or{' '}
        <code>undefined</code> shows nothing.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="locale">Locale</H2>
      <p>
        The formatter uses the locale of the nearest <code>&lt;SlopkitUi&gt;</code>, <code>en-US</code> by default, and follows it
        when it changes; a nested provider sets it for a part of the page. <code>locale</code> overrides it for one number. It
        comes from the provider, never the runtime, so the server and the browser format alike.
      </p>
      <Example component={Locales} code={localesCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number | bigint | null | undefined', description: 'The number to show. Required.' },
          { name: 'options', type: 'Intl.NumberFormatOptions', description: 'Options for Intl.NumberFormat.' },
          { name: 'locale', type: 'string', default: "the provider's", description: 'A locale for this number only.' },
          { name: 'prefix', type: 'string', description: 'Text before the formatted number.' },
          { name: 'suffix', type: 'string', description: 'Text after the formatted number.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-number-formatter</code>, and no slots or styles of its own: put it in a Text, a Title or
        a table cell.
      </p>
    </article>
  );
}
