import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/flex/basic';
import basicCode from '../../examples/components/flex/basic.tsx?raw';
import Display from '../../examples/components/flex/display';
import displayCode from '../../examples/components/flex/display.tsx?raw';
import { withBase } from '../../base';

export default function FlexPage() {
  return (
    <article class="docs-page">
      <Title>Flex · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Flex</h1>
      <p class="docs-lead">
        A <code>div</code> that is a flex container. It only takes flex props and <code>display</code>; for spacing and size, use
        a <a href={withBase('/components/box')}>Box</a>. Must be rendered inside <code>&lt;SlopkitUi&gt;</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Flex } from '@solid-slopkit/components';`} />

      <H2 id="flex-props">Flex props</H2>
      <p>
        <code>direction</code>, <code>wrap</code>, <code>align</code> (<code>align-items</code>), <code>justify</code> (
        <code>justify-content</code>), <code>gap</code>, <code>rowGap</code> and <code>columnGap</code>, all responsive. Gaps are
        in spacing units, and <code>rowGap</code> / <code>columnGap</code> win over <code>gap</code>.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="display">Display</H2>
      <p>
        Flex is <code>display: flex</code> unless <code>display</code> says otherwise, for example <code>inline-flex</code> or
        hidden at some breakpoints.
      </p>
      <Example component={Display} code={displayCode} column />

      <H2 id="props">Props</H2>
      <p>
        Gaps are in spacing units (multiples of <code>--slp-spacing</code>). Every prop is responsive. Other props are passed to
        the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'direction',
            type: "ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>",
            description: <code>flex-direction</code>,
          },
          { name: 'wrap', type: "ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>", description: <code>flex-wrap</code> },
          {
            name: 'align',
            type: "ResponsiveValue<'normal' | 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'baseline' | string>",
            description: <code>align-items</code>,
          },
          {
            name: 'justify',
            type: "ResponsiveValue<'normal' | 'start' | 'end' | 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | string>",
            description: <code>justify-content</code>,
          },
          {
            name: 'gap',
            type: 'ResponsiveValue<number>',
            description: (
              <>
                <code>row-gap</code> and <code>column-gap</code>.
              </>
            ),
          },
          {
            name: 'rowGap',
            type: 'ResponsiveValue<number>',
            description: (
              <>
                <code>row-gap</code>. Wins over <code>gap</code>.
              </>
            ),
          },
          {
            name: 'columnGap',
            type: 'ResponsiveValue<number>',
            description: (
              <>
                <code>column-gap</code>. Wins over <code>gap</code>.
              </>
            ),
          },
          {
            name: 'display',
            type: "ResponsiveValue<'flex' | 'inline-flex' | 'none'>",
            default: "'flex'",
            description: (
              <>
                Overrides <code>display: flex</code>.
              </>
            ),
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-flex</code>, and no data attributes. Stack, Group and Center render a Flex, so they
        carry it too. Style props are generated into <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
