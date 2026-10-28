import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/box/basic';
import basicCode from '../../examples/components/box/basic.tsx?raw';
import Padding from '../../examples/components/box/padding';
import paddingCode from '../../examples/components/box/padding.tsx?raw';
import Margin from '../../examples/components/box/margin';
import marginCode from '../../examples/components/box/margin.tsx?raw';
import Size from '../../examples/components/box/size';
import sizeCode from '../../examples/components/box/size.tsx?raw';
import Display from '../../examples/components/box/display';
import displayCode from '../../examples/components/box/display.tsx?raw';
import ResponsivePadding from '../../examples/components/box/responsive-padding';
import responsivePaddingCode from '../../examples/components/box/responsive-padding.tsx?raw';
import Style from '../../examples/components/box/style';
import styleCode from '../../examples/components/box/style.tsx?raw';
import { withBase } from '../../base';

export default function BoxPage() {
  return (
    <article class="docs-page">
      <Title>Box · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Box</h1>
      <p class="docs-lead">
        A <code>div</code> with padding, margin, size and display style props. The base of the layout components. Must be rendered
        inside <code>&lt;SlopkitUi&gt;</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Box } from '@solid-slopkit/components';`} />

      <H2 id="basic">Basic</H2>
      <Example component={Basic} code={basicCode} />

      <H2 id="padding">Padding</H2>
      <p>
        <code>p</code>, <code>px</code>, <code>py</code>, <code>pt</code>, <code>pr</code>, <code>pb</code> and <code>pl</code>.
        Values are multiples of <code>--slp-spacing</code> (0.25rem), so <code>4</code> is 1rem. The more specific prop wins: a
        side over its axis, the axis over <code>p</code>. Boxes with the same values share one generated class, whose CSS{' '}
        <code>&lt;SlopkitUi&gt;</code> adds once.
      </p>
      <Example component={Padding} code={paddingCode} />

      <H2 id="margin">Margin</H2>
      <p>
        <code>m</code>, <code>mx</code>, <code>my</code>, <code>mt</code>, <code>mr</code>, <code>mb</code> and <code>ml</code>,
        in the same units. Negative values pull the box outward, and <code>auto</code> centers it.
      </p>
      <Example component={Margin} code={marginCode} column />

      <H2 id="size">Size</H2>
      <p>
        <code>w</code>, <code>h</code>, <code>miw</code>, <code>maw</code>, <code>mih</code> and <code>mah</code>. A number is in
        spacing units like padding, so{' '}
        <code>
          w={'{'}24{'}'}
        </code>{' '}
        is 6rem. A string is any CSS value, such as <code>'100%'</code> or <code>'auto'</code>.
      </p>
      <Example component={Size} code={sizeCode} column />

      <H2 id="display">Display</H2>
      <p>
        <code>display</code> takes <code>'none'</code>, <code>'block'</code>, <code>'inline'</code>, <code>'inline-block'</code>,{' '}
        <code>'grid'</code>, <code>'inline-grid'</code> or <code>'contents'</code>, per breakpoint. There is no{' '}
        <code>'flex'</code>: for flex layouts, use <a href={withBase('/components/flex')}>Flex</a>.
      </p>
      <Example component={Display} code={displayCode} column />

      <H2 id="responsive">Responsive</H2>
      <p>
        Every prop takes a value or an object of breakpoints. Mobile-first: <code>base</code> applies at every width, and each
        breakpoint from its min-width up (xs 36em, sm 48em, md 62em, lg 75em, xl 88em). Each prop carries its value up the
        breakpoints before the more specific prop wins, so{' '}
        <code>
          p={'{{'} md: 8 {'}}'} pl={'{'}2{'}'}
        </code>{' '}
        keeps the left padding at 2 at every width.
      </p>
      <Example component={ResponsivePadding} code={responsivePaddingCode} />

      <H2 id="class-and-style">Class and style</H2>
      <p>
        <code>class</code> works as on a plain <code>div</code>. <code>style</code> takes an object with kebab-case keys, not a
        CSS string, like every component's. Other props, such as <code>id</code>, <code>role</code> and <code>aria-*</code>, are
        passed to the <code>div</code>.
      </p>
      <Example component={Style} code={styleCode} />

      <H2 id="props">Props</H2>
      <p>
        Numbers are spacing units (multiples of <code>--slp-spacing</code>). Every prop is responsive. Other props are passed to
        the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'p, px, py, pt, pr, pb, pl',
            type: 'ResponsiveValue<number>',
            description: 'Padding: all sides, an axis, or one side.',
          },
          {
            name: 'm, mx, my, mt, mr, mb, ml',
            type: "ResponsiveValue<number | 'auto'>",
            description: (
              <>
                Margin. Negative values pull, <code>'auto'</code> centers.
              </>
            ),
          },
          {
            name: 'w, h, miw, maw, mih, mah',
            type: 'ResponsiveValue<number | string>',
            description: 'Width, height and their min/max. A string is any CSS length.',
          },
          {
            name: 'display',
            type: "ResponsiveValue<'none' | 'block' | 'inline' | 'inline-block' | 'grid' | 'inline-grid' | 'contents'>",
            description: (
              <>
                CSS <code>display</code>.
              </>
            ),
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-box</code>, and no data attributes. Style props are generated into{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
