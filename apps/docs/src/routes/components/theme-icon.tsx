import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Variants from '../../examples/components/theme-icon/variants';
import variantsCode from '../../examples/components/theme-icon/variants.tsx?raw';
import Sizes from '../../examples/components/theme-icon/sizes';
import sizesCode from '../../examples/components/theme-icon/sizes.tsx?raw';
import Features from '../../examples/components/theme-icon/features';
import featuresCode from '../../examples/components/theme-icon/features.tsx?raw';
import { withBase } from '../../base';

export default function ThemeIconPage() {
  return (
    <article class="docs-page">
      <Title>ThemeIcon · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>ThemeIcon</h1>
      <p class="docs-lead">
        An icon in a colored box: a <code>span</code> that centers its child and sizes an SVG to fit.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { ThemeIcon } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Next to a label, the icon is decoration: mark the SVG <code>aria-hidden</code>. ThemeIcon isn't interactive; for a
        clickable icon, use a <a href={withBase('/components/button')}>Button</a> with <code>shape="square"</code>.
      </p>
      <Example component={Features} code={featuresCode} column />

      <H2 id="variants">Variants and colors</H2>
      <p>
        <code>solid</code> (the default), <code>soft</code> and <code>outline</code>, with any color role. Without{' '}
        <code>color</code>, the box uses the base colors.
      </p>
      <Example component={Variants} code={variantsCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>From 20 to 48px. An SVG child is 60% of the box, and the corners scale with it.</p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        The box has no role. When the icon alone carries meaning, with no text next to it, give the ThemeIcon{' '}
        <code>role="img"</code> and an <code>aria-label</code>.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outline'", default: "'solid'", description: 'Visual style.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role. Base colors when omitted.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-theme-icon</code>, with <code>data-variant</code>, <code>data-color</code> and{' '}
        <code>data-size</code>. It has no slots: the icon is your own child. A round box is one selector:{' '}
        <code>{'.slp-theme-icon { border-radius: 50% }'}</code>. Its rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-theme-icon-color',
            default: 'var(--slp-color-<color>)',
            description: 'Accent color. Background for solid, icon and tint or border otherwise.',
          },
          {
            name: '--slp-theme-icon-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Icon color on a solid background.',
          },
        ]}
      />
    </article>
  );
}
