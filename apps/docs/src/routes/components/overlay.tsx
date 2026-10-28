import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/overlay/basic';
import basicCode from '../../examples/components/overlay/basic.tsx?raw';
import Content from '../../examples/components/overlay/content';
import contentCode from '../../examples/components/overlay/content.tsx?raw';

export default function OverlayPage() {
  return (
    <article class="docs-page">
      <Title>Overlay · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Overlay</h1>
      <p class="docs-lead">A layer over its parent, such as behind a loader or a message.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Overlay } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The overlay fills the nearest positioned parent inside its border, and takes its rounded corners, so give the parent{' '}
        <code>position: relative</code>; <code>fixed</code> covers the viewport instead. It has no <code>z-index</code>, so render
        it last in the parent. It catches the pointer, so nothing under it can be clicked, but Tab still reaches what's under it:
        make that content <code>inert</code> to take it out of use.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="content">Color, blur and content</H2>
      <p>
        By default it's black at <code>backgroundOpacity</code>, 0.6. <code>color</code> takes a color role instead, and{' '}
        <code>--slp-overlay-color</code> any color. The opacity is the color's only, so its children stay opaque, and{' '}
        <code>center</code> centers them. <code>blur</code> blurs what's behind it, in px.
      </p>
      <Example component={Content} code={contentCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'color', type: 'SlopColor', description: "Color role of the layer. Without one it's black." },
          {
            name: 'backgroundOpacity',
            type: 'number',
            default: '0.6',
            description: "Opacity of the layer's color, from 0 to 1.",
          },
          { name: 'blur', type: 'number', default: '0', description: "Blurs what's behind it, in px." },
          { name: 'fixed', type: 'boolean', default: 'false', description: 'Covers the viewport instead of its parent.' },
          { name: 'center', type: 'boolean', default: 'false', description: 'Centers its children on it.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-overlay</code>, with <code>data-color</code>, <code>data-blur</code>,{' '}
        <code>data-fixed</code> and <code>data-center</code>. <code>--slp-overlay-color</code> sets its color before the opacity.
        Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
