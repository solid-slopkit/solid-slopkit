import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/background-image/basic';
import basicCode from '../../examples/components/background-image/basic.tsx?raw';
import Sizing from '../../examples/components/background-image/sizing';
import sizingCode from '../../examples/components/background-image/sizing.tsx?raw';
import { withBase } from '../../base';

export default function BackgroundImagePage() {
  return (
    <article class="docs-page">
      <Title>BackgroundImage · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>BackgroundImage</h1>
      <p class="docs-lead">
        A box with an image behind its content: a <code>div</code> whose background covers it.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { BackgroundImage } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The children sit on top of the image. The box has no size of its own, so give it content, a <code>min-height</code> or a
        place in a layout. The image can be light or dark anywhere: put text on a surface or a gradient of its own.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="sizing">Sizing</H2>
      <p>
        The image covers the box and stays centered, so its edges are cropped. Your <code>background-*</code> styles win, from the
        style prop or a selector. The <code>background</code> shorthand resets the image too, so set a fallback color with{' '}
        <code>background-color</code>.
      </p>
      <Example component={Sizing} code={sizingCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        A background image has no text alternative, so it should be decorative. When the picture carries meaning, use an{' '}
        <a href={withBase('/components/image')}>Image</a>, or give the box <code>role="img"</code> and an <code>aria-label</code>{' '}
        when it holds no content.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable rows={[{ name: 'src', type: 'string', description: 'The image URL. Required.' }]} />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-background-image</code>, and no slots. The image is its <code>background-image</code>,
        with <code>background-size: cover</code>, <code>background-position: center</code> and{' '}
        <code>background-repeat: no-repeat</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS
        wins.
      </p>
    </article>
  );
}
