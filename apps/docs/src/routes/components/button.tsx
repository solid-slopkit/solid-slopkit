import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Variants from '../../examples/components/button/variants';
import variantsCode from '../../examples/components/button/variants.tsx?raw';
import Colors from '../../examples/components/button/colors';
import colorsCode from '../../examples/components/button/colors.tsx?raw';
import ColorVariants from '../../examples/components/button/color-variants';
import colorVariantsCode from '../../examples/components/button/color-variants.tsx?raw';
import Sizes from '../../examples/components/button/sizes';
import sizesCode from '../../examples/components/button/sizes.tsx?raw';
import Shapes from '../../examples/components/button/shapes';
import shapesCode from '../../examples/components/button/shapes.tsx?raw';
import FullWidth from '../../examples/components/button/full-width';
import fullWidthCode from '../../examples/components/button/full-width.tsx?raw';
import Sections from '../../examples/components/button/sections';
import sectionsCode from '../../examples/components/button/sections.tsx?raw';
import Loading from '../../examples/components/button/loading';
import loadingCode from '../../examples/components/button/loading.tsx?raw';
import Disabled from '../../examples/components/button/disabled';
import disabledCode from '../../examples/components/button/disabled.tsx?raw';
import Active from '../../examples/components/button/active';
import activeCode from '../../examples/components/button/active.tsx?raw';
import Polymorphic from '../../examples/components/button/polymorphic';
import polymorphicCode from '../../examples/components/button/polymorphic.tsx?raw';
import CustomProperties from '../../examples/components/button/custom-properties';
import customPropertiesCode from '../../examples/components/button/custom-properties.tsx?raw';

export default function ButtonPage() {
  return (
    <article class="docs-page">
      <Title>Button · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Button</h1>
      <p class="docs-lead">Triggers an action. Its look comes entirely from theme CSS variables.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Button } from '@solid-slopkit/components';`} />

      <H2 id="variants">Variants</H2>
      <p>
        <code>solid</code> is the default. <code>soft</code>, <code>outline</code> and <code>dash</code> switch to the solid look
        on hover and focus; <code>ghost</code> only gets a light tint. The <code>outline</code> and <code>dash</code> borders are
        a faded text color: half the accent with a <code>color</code>, a fifth of the text color without one.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="colors">Colors</H2>
      <p>
        Any color role. Without <code>color</code> the button uses the base surface colors.
      </p>
      <Example component={Colors} code={colorsCode} />
      <p>Every variant works with every color.</p>
      <Example component={ColorVariants} code={colorVariantsCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>
        Height is a multiple of <code>--slp-size-field</code>, so a theme can make every control denser or roomier at once.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="shapes">Shapes</H2>
      <p>
        <code>square</code> and <code>circle</code> are for a single icon. Give them an <code>aria-label</code>.
      </p>
      <Example component={Shapes} code={shapesCode} />
      <Example component={FullWidth} code={fullWidthCode} />

      <H2 id="sections">Sections</H2>
      <p>
        <code>leftSection</code> and <code>rightSection</code> place content, usually icons, around the label. Icons are sized to
        match the button.
      </p>
      <Example component={Sections} code={sectionsCode} column />

      <H2 id="loading">Loading</H2>
      <p>
        Shows a spinner over the content and blocks interaction, but keeps the button's colors. Sets <code>aria-busy</code>.
      </p>
      <Example component={Loading} code={loadingCode} />

      <H2 id="disabled">Disabled</H2>
      <Example component={Disabled} code={disabledCode} />

      <H2 id="active">Active</H2>
      <p>
        <code>active</code> forces the pressed look, for toggle buttons. Pair it with <code>aria-pressed</code>.
      </p>
      <Example component={Active} code={activeCode} />

      <H2 id="polymorphic">Polymorphic</H2>
      <p>
        <code>as</code> renders another element. A link with <code>href</code> stays a link; other elements get{' '}
        <code>role="button"</code>, a tab stop, and a button's keys: Enter presses on key down, Space on key up.{' '}
        <code>disabled</code> becomes <code>aria-disabled</code> on non-button elements, which then ignore clicks and keys.
      </p>
      <Example component={Polymorphic} code={polymorphicCode} />

      <H2 id="css-variables">CSS variables</H2>
      <p>
        Set these on the button or any ancestor to customize without a new theme color. For a value that maps to one declaration,
        such as the corner radius, write CSS against <code>.slp-button</code> or use <code>style</code>.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-button-color',
            default: 'var(--slp-color-<color>)',
            description: 'Accent color. Background for solid, text and border for the other variants.',
          },
          {
            name: '--slp-button-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Text color on a solid accent background.',
          },
        ]}
      />
      <Example component={CustomProperties} code={customPropertiesCode} />

      <H2 id="props">Props</H2>
      <p>Other props, including event handlers, are passed to the rendered element.</p>
      <PropsTable
        rows={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outline' | 'dash' | 'ghost' | 'link'",
            default: "'solid'",
            description: 'Visual style.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Theme color. Base colors when omitted.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          {
            name: 'shape',
            type: "'default' | 'square' | 'circle'",
            default: "'default'",
            description: 'Square and circle are fixed-width, for icon-only buttons.',
          },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Fills the container width.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Forces the pressed look.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner and blocks interaction.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the label.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the label.' },
          { name: 'as', type: 'ValidComponent', default: "'button'", description: 'Element or component to render.' },
          {
            name: 'type',
            type: 'string',
            default: "'button'",
            description: 'Native type. Only applied to buttons and inputs.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-button</code>. State and variant are attributes on it: <code>data-variant</code>,{' '}
        <code>data-color</code>, <code>data-size</code>, <code>data-shape</code>, <code>data-disabled</code>,{' '}
        <code>data-loading</code>, <code>data-pressed</code>, <code>data-full-width</code>, <code>data-with-left-section</code>{' '}
        and <code>data-with-right-section</code>. Button renders no inner elements of its own, so it has no slots: sections and
        the label are direct children. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
