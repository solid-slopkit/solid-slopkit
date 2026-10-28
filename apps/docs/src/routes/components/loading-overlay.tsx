import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/loading-overlay/basic';
import basicCode from '../../examples/components/loading-overlay/basic.tsx?raw';

export default function LoadingOverlayPage() {
  return (
    <article class="docs-page">
      <Title>LoadingOverlay · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>LoadingOverlay</h1>
      <p class="docs-lead">Covers its parent while something in it loads: an Overlay with a Loader centered on it.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { LoadingOverlay } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Give the parent <code>position: relative</code> and render the overlay last in it. It fades in and out with{' '}
        <code>visible</code>, over <code>transitionDuration</code>, 150ms by default. It catches clicks, but Tab still reaches
        what's under it, so make the covered content <code>inert</code> while it's shown, as here, or disable its controls.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="loader">Loader and layer</H2>
      <p>
        The loader is a <code>primary</code> spinner, named by <code>label</code> (<code>'Loading'</code> by default), which is
        announced when it appears. <code>loaderVariant</code>, <code>loaderSize</code> and <code>loaderColor</code> change it, and{' '}
        <code>loader</code> replaces it with anything, such as a message. The layer is the base surface color at{' '}
        <code>backgroundOpacity</code>, 0.7, so the content shows through faintly in both color schemes, with a 2px{' '}
        <code>blur</code>; <code>--slp-overlay-color</code> sets another color.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props go to the Overlay's <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'visible', type: 'boolean', description: "Whether it's shown." },
          { name: 'label', type: 'string', default: "'Loading'", description: "The loader's accessible name." },
          { name: 'loaderVariant', type: 'LoaderVariant', default: "'spinner'", description: 'Shape of the loader.' },
          { name: 'loaderSize', type: 'SlopSize', default: "'md'", description: 'Size of the loader.' },
          { name: 'loaderColor', type: 'SlopColor', default: "'primary'", description: 'Color role of the loader.' },
          { name: 'loader', type: 'JSX.Element', description: 'Replaces the loader.' },
          { name: 'backgroundOpacity', type: 'number', default: '0.7', description: "Opacity of the layer's color." },
          { name: 'blur', type: 'number', default: '2', description: "Blurs what's behind it, in px." },
          { name: 'transitionDuration', type: 'number', default: '150', description: 'Duration of the fade, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-loading-overlay</code> and <code>.slp-overlay</code>, with Overlay's attributes, and{' '}
        <code>data-status</code> and <code>data-transition</code> while it fades. The default loader is{' '}
        <code>[data-slot="loading-overlay-loader"]</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered
        CSS wins.
      </p>
    </article>
  );
}
