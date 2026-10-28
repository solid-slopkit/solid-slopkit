import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Variants from '../../examples/components/loader/variants';
import variantsCode from '../../examples/components/loader/variants.tsx?raw';
import Sizes from '../../examples/components/loader/sizes';
import sizesCode from '../../examples/components/loader/sizes.tsx?raw';
import Inline from '../../examples/components/loader/inline';
import inlineCode from '../../examples/components/loader/inline.tsx?raw';

export default function LoaderPage() {
  return (
    <article class="docs-page">
      <Title>Loader · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Loader</h1>
      <p class="docs-lead">
        Shows that something is loading: a <code>span</code> with <code>role="status"</code>, animated as a spinner, dots or bars.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Loader } from '@solid-slopkit/components';`} />

      <H2 id="variants">Variants</H2>
      <p>
        <code>spinner</code> (the default), <code>dots</code> and <code>bars</code>. When the user asks for reduced motion, the
        spinner turns slowly and dots and bars pulse in place, so the loader still shows activity.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="inline">With text</H2>
      <p>
        Without <code>size</code>, a Loader is 1em and takes the current text color, so it matches the text around it. Give it a{' '}
        <code>label</code> that says what's loading.
      </p>
      <Example component={Inline} code={inlineCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>
        <code>size</code> fixes it at 16 to 48px.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        A Loader is a <code>status</code>, announced by its <code>label</code>, <code>Loading</code> by default. Inside something
        that already says it's busy, such as a region with <code>aria-busy="true"</code>, pass <code>aria-hidden="true"</code> so
        it isn't announced twice.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'variant', type: "'spinner' | 'dots' | 'bars'", default: "'spinner'", description: 'Shape of the animation.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            description: 'Fixed size. 1em, following the text, if omitted.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role. The current text color if omitted.',
          },
          { name: 'label', type: 'string', default: "'Loading'", description: 'The accessible name.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-loader</code>, with <code>data-variant</code>, <code>data-size</code> and{' '}
        <code>data-color</code>. Dots and bars are the <code>loader-part</code> slot; the spinner is the root's border. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-loader-color',
            default: 'var(--slp-color-<color>), or the text color',
            description: "Loader color. For a color that isn't a role.",
          },
        ]}
      />
    </article>
  );
}
