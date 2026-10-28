import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/image/basic';
import basicCode from '../../examples/components/image/basic.tsx?raw';
import Fit from '../../examples/components/image/fit';
import fitCode from '../../examples/components/image/fit.tsx?raw';
import Fallback from '../../examples/components/image/fallback';
import fallbackCode from '../../examples/components/image/fallback.tsx?raw';

export default function ImagePage() {
  return (
    <article class="docs-page">
      <Title>Image · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Image</h1>
      <p class="docs-lead">
        An image: an <code>img</code> that fills its box and can fall back to another source when it fails to load.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Image } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>alt</code> is required: describe the picture, or pass <code>alt=""</code> for a decorative one. An Image is a block
        that never gets wider than its container, and keeps its aspect ratio unless you give it both a width and a height. The
        native attributes, such as <code>loading</code> and <code>srcset</code>, pass through.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="fit">Fit</H2>
      <p>
        When a width and a height give the box another aspect ratio, <code>fit</code> decides how the picture fills it.{' '}
        <code>cover</code>, the default, fills the box and crops.
      </p>
      <Example component={Fit} code={fitCode} />

      <H2 id="fallback">Fallback</H2>
      <p>
        When <code>src</code> fails to load, <code>fallbackSrc</code> is shown instead. A failing fallback isn't retried, and a
        new <code>src</code> gets its own try. This also works for an image that failed before the page hydrated.
      </p>
      <Example component={Fallback} code={fallbackCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>img</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'src', type: 'string', description: 'The image URL.' },
          { name: 'alt', type: 'string', description: 'Text alternative. Required; "" for a decorative image.' },
          {
            name: 'fit',
            type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'",
            default: "'cover'",
            description: 'How the picture fills a box of another aspect ratio (object-fit).',
          },
          { name: 'fallbackSrc', type: 'string', description: 'Shown instead of src when it fails to load.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-image</code>, with <code>data-fit</code>, and <code>data-fallback</code> while the
        fallback is shown. There are no slots. Round the corners with a selector, such as{' '}
        <code>{'.slp-image { border-radius: 8px }'}</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered
        CSS wins.
      </p>
    </article>
  );
}
