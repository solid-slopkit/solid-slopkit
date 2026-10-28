import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/nav-tabs/basic';
import basicCode from '../../examples/components/nav-tabs/basic.tsx?raw';
import Variants from '../../examples/components/nav-tabs/variants';
import variantsCode from '../../examples/components/nav-tabs/variants.tsx?raw';

export default function NavTabsPage() {
  return (
    <article class="docs-page">
      <Title>NavTabs · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>NavTabs</h1>
      <p class="docs-lead">Navigation drawn as tabs, with the current page's link marked as the selected tab.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { NavTabs } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Use NavTabs when each tab goes to its own page, and <a href="/components/tabs">Tabs</a> when tabs switch panels on the
        same page; the two look the same. NavTabs is a <code>nav</code> of <code>NavTabs.Link</code>s, ordinary links that Tab
        moves between. The router marks the current page: <code>@solidjs/router</code> sets <code>data-active</code> on a link to
        the current page or to a parent of it, and <code>aria-current="page"</code> on a link to exactly the current page, and
        NavTabs draws a link with <code>data-active</code> as the selected tab. Since a link to a parent path is marked on its
        child pages too, give each tab its own path. Without the router, set <code>data-active</code> and{' '}
        <code>aria-current="page"</code> on the current link yourself. <code>as</code> renders another link component instead of
        an <code>a</code>. Links take a <code>leftSection</code> and a <code>rightSection</code>, and a <code>disabled</code> link
        has no address, so the router never marks it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Variants</H2>
      <p>
        The variants are the same as Tabs': <code>underline</code> (the default), <code>outline</code>, <code>pills</code> and{' '}
        <code>soft</code>. <code>color</code>, <code>size</code>, <code>orientation</code> and <code>grow</code> work as they do
        on Tabs.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        NavTabs passes other props to its <code>nav</code>. <code>NavTabs.Link</code> takes <code>leftSection</code>,{' '}
        <code>rightSection</code>, <code>disabled</code> and <code>as</code>, and passes the rest to its link.
      </p>
      <PropsTable
        rows={[
          {
            name: 'variant',
            type: "'underline' | 'outline' | 'pills' | 'soft'",
            default: "'underline'",
            description: 'How the current link is marked.',
          },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The current link's color role." },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "The links' height and text." },
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: 'A row of links, or a column.',
          },
          { name: 'grow', type: 'boolean', default: 'false', description: "Shares the row's width between the links." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-nav-tabs</code>, with <code>data-variant</code>, <code>data-color</code>, <code>data-size</code>{' '}
        and <code>data-orientation</code>, holding <code>[data-slot="nav-tabs-list"]</code> (with <code>data-grow</code>). Each
        link is <code>.slp-nav-tabs-link</code>, with <code>data-active</code> on the link the router marks as current and{' '}
        <code>data-disabled</code>; it holds <code>[data-slot="nav-tabs-link-label"]</code> and{' '}
        <code>[data-slot="nav-tabs-link-section"]</code> with <code>data-position="left"</code> or <code>"right"</code>. The
        custom properties are Tabs': <code>--slp-tabs-color</code> sets the current link's color and{' '}
        <code>--slp-tabs-content</code> the text on a current pill. The rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
    </article>
  );
}
