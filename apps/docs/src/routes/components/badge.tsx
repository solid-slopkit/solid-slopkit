import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Variants from '../../examples/components/badge/variants';
import variantsCode from '../../examples/components/badge/variants.tsx?raw';
import Colors from '../../examples/components/badge/colors';
import colorsCode from '../../examples/components/badge/colors.tsx?raw';
import Sizes from '../../examples/components/badge/sizes';
import sizesCode from '../../examples/components/badge/sizes.tsx?raw';
import Circle from '../../examples/components/badge/circle';
import circleCode from '../../examples/components/badge/circle.tsx?raw';
import Sections from '../../examples/components/badge/sections';
import sectionsCode from '../../examples/components/badge/sections.tsx?raw';
import CustomProperties from '../../examples/components/badge/custom-properties';
import customPropertiesCode from '../../examples/components/badge/custom-properties.tsx?raw';
import { withBase } from '../../base';

export default function BadgePage() {
  return (
    <article class="docs-page">
      <Title>Badge · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Badge</h1>
      <p class="docs-lead">
        A short label for a status, a category or a count: a <code>span</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Badge } from '@solid-slopkit/components';`} />

      <H2 id="variants">Variants</H2>
      <p>
        <code>solid</code> is the default. <code>soft</code> is a light tint of the color, <code>outline</code> and{' '}
        <code>dash</code> only draw the border.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="colors">Colors</H2>
      <p>
        Any color role, with every variant. Without <code>color</code> the badge uses the base colors.
      </p>
      <Example component={Colors} code={colorsCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>
        16 to 28px tall. Heights are multiples of <code>--slp-size-selector</code>, so a theme can scale every badge at once.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="circle">Circle</H2>
      <p>
        <code>circle</code> makes a badge for a single digit round; a longer count grows into a pill. Badge has no role, so it is
        read as its text: give a count context, like the label next to it.
      </p>
      <Example component={Circle} code={circleCode} />

      <H2 id="sections">Sections</H2>
      <p>
        <code>leftSection</code> and <code>rightSection</code> place content, usually icons, around the label. Icons are sized to
        match the badge. Badge is not interactive; for something clickable, use a{' '}
        <a href={withBase('/components/button')}>Button</a>.
      </p>
      <Example component={Sections} code={sectionsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outline' | 'dash'", default: "'solid'", description: 'Visual style.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role. Base colors when omitted.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          {
            name: 'circle',
            type: 'boolean',
            default: 'false',
            description: 'Round for a single character; a longer count grows.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the label.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the label.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-badge</code>. State and variant are attributes on it: <code>data-variant</code>,{' '}
        <code>data-color</code>, <code>data-size</code> and <code>data-circle</code>. The children are wrapped in the{' '}
        <code>badge-label</code> slot, which truncates a long label; sections are direct children of the root. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-badge-color',
            default: 'var(--slp-color-<color>)',
            description: 'Accent color. Background for solid, text and border or tint for the other variants.',
          },
          {
            name: '--slp-badge-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Text color on a solid accent background.',
          },
        ]}
      />
      <Example component={CustomProperties} code={customPropertiesCode} />
    </article>
  );
}
