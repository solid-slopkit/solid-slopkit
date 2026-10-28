import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/text/basic';
import basicCode from '../../examples/components/text/basic.tsx?raw';
import Sizes from '../../examples/components/text/sizes';
import sizesCode from '../../examples/components/text/sizes.tsx?raw';
import Colors from '../../examples/components/text/colors';
import colorsCode from '../../examples/components/text/colors.tsx?raw';
import Weights from '../../examples/components/text/weights';
import weightsCode from '../../examples/components/text/weights.tsx?raw';
import Figures from '../../examples/components/text/figures';
import figuresCode from '../../examples/components/text/figures.tsx?raw';
import Truncation from '../../examples/components/text/truncation';
import truncationCode from '../../examples/components/text/truncation.tsx?raw';
import Polymorphic from '../../examples/components/text/polymorphic';
import polymorphicCode from '../../examples/components/text/polymorphic.tsx?raw';
import { withBase } from '../../base';

export default function TextPage() {
  return (
    <article class="docs-page">
      <Title>Text · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Text</h1>
      <p class="docs-lead">
        Body text: a paragraph by default, or any element with <code>as</code>. Sizes come from the type scale tokens.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Text } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The margin is reset to <code>0</code>, so space paragraphs with a <a href={withBase('/components/stack')}>Stack</a>. Text
        doesn't take style props.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>
        <code>xs</code> to <code>xl</code> for copy and <code>2xl</code> to <code>5xl</code> for display figures, from{' '}
        <code>--slp-font-size-*</code> and <code>--slp-line-height-*</code>. Display sizes track slightly tighter. The default is{' '}
        <code>md</code>.
      </p>
      <Example component={Sizes} code={sizesCode} column />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role. Without it, Text inherits its parent's color, so it works on colored surfaces too.{' '}
        <code>dimmed</code> mutes the text: without <code>color</code> it takes the theme's <code>--slp-color-muted-content</code>
        , with one it fades the role's color.
      </p>
      <Example component={Colors} code={colorsCode} column />

      <H2 id="weights">Weights</H2>
      <p>Without a weight, Text inherits its parent's.</p>
      <Example component={Weights} code={weightsCode} column />

      <H2 id="figures">Figures and labels</H2>
      <p>
        <code>tabularNums</code> gives every digit the same width, so amounts line up in a column and don't shift as they change.{' '}
        <code>align</code> sets the alignment. <code>transform="uppercase"</code> uppercases a label and spaces its letters
        slightly; <code>lowercase</code> and <code>capitalize</code> only change the case.
      </p>
      <Example component={Figures} code={figuresCode} column />

      <H2 id="truncation">Truncate and line clamp</H2>
      <p>
        <code>truncate</code> keeps one line with an ellipsis; <code>lineClamp</code> keeps that many lines. Both need a block
        element and a width.
      </p>
      <Example component={Truncation} code={truncationCode} column />

      <H2 id="polymorphic">Polymorphic and inherit</H2>
      <p>
        <code>as</code> renders another element, with that element's attributes. <code>inherit</code> takes font size and line
        height from the parent, for Text inside other text.
      </p>
      <Example component={Polymorphic} code={polymorphicCode} column />

      <H2 id="props">Props</H2>
      <p>Other props are passed to the rendered element.</p>
      <PropsTable
        rows={[
          { name: 'as', type: 'ValidComponent', default: "'p'", description: 'Element or component to render.' },
          { name: 'dynamicAs', type: 'boolean', default: 'false', description: 'Set when as changes after the first render.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'",
            default: "'md'",
            description: (
              <>
                Font size and line height. Ignored with <code>inherit</code>.
              </>
            ),
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: "Color role. Inherits the parent's color when omitted.",
          },
          {
            name: 'dimmed',
            type: 'boolean',
            default: 'false',
            description: (
              <>
                Mutes the text (<code>--slp-color-muted-content</code>).
              </>
            ),
          },
          {
            name: 'weight',
            type: "'normal' | 'medium' | 'semibold' | 'bold'",
            description: 'Font weight. Inherited when omitted.',
          },
          {
            name: 'align',
            type: "'start' | 'center' | 'end' | 'justify'",
            description: 'Text alignment. Inherited when omitted.',
          },
          { name: 'tabularNums', type: 'boolean', default: 'false', description: 'Digits of equal width.' },
          {
            name: 'transform',
            type: "'uppercase' | 'lowercase' | 'capitalize'",
            description: (
              <>
                Changes the case; <code>uppercase</code> also spaces the letters.
              </>
            ),
          },
          { name: 'truncate', type: 'boolean', default: 'false', description: 'One line, with an ellipsis.' },
          { name: 'lineClamp', type: 'number', description: 'Cuts the text after this many lines.' },
          {
            name: 'inherit',
            type: 'boolean',
            default: 'false',
            description: 'Takes font size and line height from the parent.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-text</code>, and no slots. State and variant are attributes on it:{' '}
        <code>data-size</code> (absent with <code>inherit</code>), <code>data-color</code>, <code>data-dimmed</code>,{' '}
        <code>data-weight</code>, <code>data-align</code>, <code>data-tabular-nums</code>, <code>data-transform</code>,{' '}
        <code>data-truncate</code>, <code>data-line-clamp</code> and <code>data-inherit</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins. The type scale tokens are set on <code>:root</code> in{' '}
        <code>slopkit.css</code>.
      </p>
    </article>
  );
}
