import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/table-of-contents/basic';
import basicCode from '../../examples/components/table-of-contents/basic.tsx?raw';
import Headings from '../../examples/components/table-of-contents/headings';
import headingsCode from '../../examples/components/table-of-contents/headings.tsx?raw';

export default function TableOfContentsPage() {
  return (
    <article class="docs-page">
      <Title>TableOfContents · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>TableOfContents</h1>
      <p class="docs-lead">Links to the sections of the page, with the one being read marked as it scrolls.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { TableOfContents } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        By default it finds the headings on the page, in the browser: those matching <code>selector</code> that have an id. It
        follows them as the page changes, and indents each by how much deeper it is than the shallowest. Since it can only look
        once the page is in the browser, the server renders it empty and hidden.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="headings">Given headings</H2>
      <p>
        Pass <code>headings</code>, each with an <code>id</code>, a <code>label</code> and a <code>depth</code>, to list them as
        they are; they render on the server too. The active link is drawn along a line beside the list (<code>line</code>) or
        tinted (<code>soft</code>).
      </p>
      <Example component={Headings} code={headingsCode} />

      <H2 id="active">The active heading</H2>
      <p>
        The active link is the last heading scrolled up to its line, with <code>aria-current="location"</code> (the others say{' '}
        <code>"false"</code>); none is active before the first. A heading's line is its <code>scroll-margin-top</code>, where
        following its link puts it, or <code>offset</code> pixels from the top when set. At the bottom of the page, the last
        heading is active even if it can't reach its line. <code>onActiveChange</code> reports each change.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>nav</code>, named "Table of contents"; <code>aria-label</code> renames it.
      </p>
      <PropsTable
        rows={[
          { name: 'headings', type: 'TableOfContentsHeading[]', description: 'The headings to list, instead of finding them.' },
          { name: 'selector', type: 'string', default: "'h1, h2, h3, h4, h5, h6'", description: 'Which elements are headings.' },
          {
            name: 'offset',
            type: 'number',
            default: 'each scroll-margin-top',
            description: 'Where a heading counts as reached, in pixels from the top.',
          },
          { name: 'onActiveChange', type: '(id: string | null) => void', description: 'Called when the active heading changes.' },
          { name: 'variant', type: "'line' | 'soft'", default: "'line'", description: 'How the active link is drawn.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The active link's color role." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-table-of-contents</code>, with <code>data-variant</code> and <code>data-color</code>, holding{' '}
        <code>[data-slot="table-of-contents-list"]</code>, its <code>table-of-contents-item</code>s, and in each a{' '}
        <code>table-of-contents-link</code> with <code>data-depth</code> and <code>data-current</code>.{' '}
        <code>--slp-table-of-contents-color</code> sets the active color. The rules live in <code>@layer slopkit.components</code>
        , so unlayered CSS wins.
      </p>
    </article>
  );
}
