import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/breadcrumbs/basic';
import basicCode from '../../examples/components/breadcrumbs/basic.tsx?raw';
import Separator from '../../examples/components/breadcrumbs/separator';
import separatorCode from '../../examples/components/breadcrumbs/separator.tsx?raw';

export default function BreadcrumbsPage() {
  return (
    <article class="docs-page">
      <Title>Breadcrumbs · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Breadcrumbs</h1>
      <p class="docs-lead">
        Where the current page sits in the site's hierarchy: links to the pages above it, in order, then the page itself.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Breadcrumbs } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Each child becomes an item of an ordered list inside a <code>nav</code> named "Breadcrumb", with a separator between them
        that screen readers skip. Use Anchors for the pages above. Breadcrumbs can't tell which child is the current page, so mark
        it with <code>aria-current="page"</code> yourself.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="separator">Separator and dynamic paths</H2>
      <p>
        <code>separator</code> takes any element, such as an icon; each gap gets its own. Children from a <code>For</code> work,
        and the list follows them as the path changes. An icon-only link needs an <code>aria-label</code>.
      </p>
      <Example component={Separator} code={separatorCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>nav</code>; <code>aria-label</code> renames it.
      </p>
      <PropsTable rows={[{ name: 'separator', type: 'JSX.Element', default: "'/'", description: 'Shown between the items.' }]} />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-breadcrumbs</code>, holding <code>[data-slot="breadcrumbs-list"]</code>, its{' '}
        <code>[data-slot="breadcrumbs-item"]</code>s, and a <code>[data-slot="breadcrumbs-separator"]</code> in each but the
        first. <code>--slp-breadcrumbs-gap</code> sets the space around a separator. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
