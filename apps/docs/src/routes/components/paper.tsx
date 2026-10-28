import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/paper/basic';
import basicCode from '../../examples/components/paper/basic.tsx?raw';
import Padding from '../../examples/components/paper/padding';
import paddingCode from '../../examples/components/paper/padding.tsx?raw';
import Shadows from '../../examples/components/paper/shadows';
import shadowsCode from '../../examples/components/paper/shadows.tsx?raw';
import Surfaces from '../../examples/components/paper/surfaces';
import surfacesCode from '../../examples/components/paper/surfaces.tsx?raw';

export default function PaperPage() {
  return (
    <article class="docs-page">
      <Title>Paper · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Paper</h1>
      <p class="docs-lead">
        A surface that groups content: a <code>div</code> with a background, padding and radius, and optionally a border and a
        shadow.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Paper } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Paper is always a <code>div</code>. Give it <code>role="region"</code> and an <code>aria-label</code> when it's a
        landmark.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="padding">Padding</H2>
      <p>
        <code>none</code>, or <code>xs</code> to <code>xl</code> (0.5 to 2rem). The default is <code>md</code>, 1rem. Paper
        doesn't take style props; a one-off padding goes through a selector or <code>style</code>.
      </p>
      <Example component={Padding} code={paddingCode} />

      <H2 id="shadow-and-border">Shadow and border</H2>
      <p>
        <code>shadow</code> takes <code>xs</code> to <code>xl</code> from the <code>--slp-shadow-*</code> tokens.{' '}
        <code>withBorder</code> adds a thin border in a muted text color.
      </p>
      <Example component={Shadows} code={shadowsCode} />

      <H2 id="surface-and-radius">Surface and radius</H2>
      <p>
        <code>surface</code> picks the background from the base colors; nest a lighter Paper on a darker one to layer them.{' '}
        <code>radius</code> is <code>default</code> (1rem) or <code>none</code>; any other radius goes through a selector or{' '}
        <code>style</code>.
      </p>
      <Example component={Surfaces} code={surfacesCode} column />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'padding', type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Inner padding.' },
          { name: 'shadow', type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'none'", description: 'Drop shadow.' },
          { name: 'withBorder', type: 'boolean', default: 'false', description: 'A thin border around the surface.' },
          {
            name: 'surface',
            type: "'base-100' | 'base-200' | 'base-300'",
            default: "'base-100'",
            description: 'Background color.',
          },
          { name: 'radius', type: "'default' | 'none'", default: "'default'", description: 'Corner radius.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-paper</code>, and no slots. State and variant are attributes on it:{' '}
        <code>data-padding</code>, <code>data-shadow</code>, <code>data-surface</code>, <code>data-radius</code> and{' '}
        <code>data-with-border</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins. The shadow
        tokens are set on <code>:root</code> in <code>slopkit.css</code>:
      </p>
      <CssVarsTable
        rows={[
          { name: '--slp-shadow-xs', default: '0 1px 2px oklch(0% 0 0 / 0.08)', description: 'The faintest shadow.' },
          { name: '--slp-shadow-sm', default: '0 1px 3px …, 0 1px 2px …', description: 'A small lift.' },
          { name: '--slp-shadow-md', default: '0 4px 6px -1px …, 0 2px 4px -2px …', description: 'Raised content.' },
          { name: '--slp-shadow-lg', default: '0 10px 15px -3px …, 0 4px 6px -4px …', description: 'Floating content.' },
          { name: '--slp-shadow-xl', default: '0 20px 25px -5px …, 0 8px 10px -6px …', description: 'The strongest shadow.' },
        ]}
      />
    </article>
  );
}
