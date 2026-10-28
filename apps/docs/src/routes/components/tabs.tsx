import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/tabs/basic';
import basicCode from '../../examples/components/tabs/basic.tsx?raw';
import Variants from '../../examples/components/tabs/variants';
import variantsCode from '../../examples/components/tabs/variants.tsx?raw';
import Vertical from '../../examples/components/tabs/vertical';
import verticalCode from '../../examples/components/tabs/vertical.tsx?raw';

export default function TabsPage() {
  return (
    <article class="docs-page">
      <Title>Tabs · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Tabs</h1>
      <p class="docs-lead">Tabs that switch between panels of content.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Tabs } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>Tabs.List</code> holds the <code>Tabs.Tab</code>s, and each <code>Tabs.Panel</code> belongs to the tab with the same{' '}
        <code>value</code>. Only the selected tab's panel is rendered; <code>keepMounted</code> keeps the others in the page,
        hidden, so their state survives switching. The selected tab is the list's one tab stop: the arrows move between the tabs
        and select them, Home and End go to the ends, and Tab moves on to the panel. Tabs take a <code>leftSection</code> and a{' '}
        <code>rightSection</code>, and a disabled tab is skipped.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Variants</H2>
      <p>
        <code>underline</code> (the default) draws a bar under the selected tab, <code>outline</code> lifts it into a bordered tab
        joined to the content, <code>pills</code> fills it, and <code>soft</code> tints it with the color. <code>color</code> is
        the selected tab's color role, <code>primary</code> by default, and <code>size</code> goes from <code>xs</code> to{' '}
        <code>xl</code>, as tall as a Button of the same size. <code>Tabs.List</code>'s <code>grow</code> shares its width between
        the tabs.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="vertical">Vertical, and manual activation</H2>
      <p>
        <code>orientation="vertical"</code> puts the list in a column beside the panels, and Up and Down move between the tabs.
        With <code>activation="manual"</code> the arrows only move focus, and Enter, Space or a click selects: for panels that
        take a while to show.
      </p>
      <Example component={Vertical} code={verticalCode} />

      <H2 id="props">Props</H2>
      <p>
        Tabs passes other props to its <code>div</code>. <code>Tabs.List</code> takes <code>grow</code>; <code>Tabs.Tab</code>{' '}
        takes <code>value</code>, <code>leftSection</code>, <code>rightSection</code> and <code>disabled</code>;{' '}
        <code>Tabs.Panel</code> takes <code>value</code> and <code>keepMounted</code>. Each passes the rest to its element.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string | null', description: 'The selected tab, when controlled.' },
          { name: 'defaultValue', type: 'string | null', default: 'null', description: 'The tab selected at first.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called when a tab is selected.' },
          {
            name: 'variant',
            type: "'underline' | 'outline' | 'pills' | 'soft'",
            default: "'underline'",
            description: 'How the selected tab is marked.',
          },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The selected tab's color role." },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "The tabs' height and text." },
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: 'The list above the panels, or beside them.',
          },
          {
            name: 'activation',
            type: "'automatic' | 'manual'",
            default: "'automatic'",
            description: 'Whether the arrows select, or only move focus.',
          },
          { name: 'loop', type: 'boolean', default: 'true', description: 'Whether the arrows wrap around.' },
          { name: 'keepMounted', type: 'boolean', default: 'false', description: 'Keeps the other panels in the DOM, hidden.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-tabs</code>, with <code>data-variant</code>, <code>data-color</code>, <code>data-size</code> and{' '}
        <code>data-orientation</code>. Inside are <code>.slp-tabs-list</code> (with <code>data-grow</code>),{' '}
        <code>.slp-tabs-tab</code> (with <code>data-active</code> on the selected one, <code>data-disabled</code> and{' '}
        <code>data-value</code>) and <code>.slp-tabs-panel</code> (with <code>data-value</code>); a tab holds{' '}
        <code>[data-slot="tabs-tab-label"]</code> and <code>[data-slot="tabs-tab-section"]</code> with{' '}
        <code>data-position="left"</code> or <code>"right"</code>. <code>--slp-tabs-color</code> sets the selected tab's color and{' '}
        <code>--slp-tabs-content</code> the text on a selected pill. The rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
    </article>
  );
}
