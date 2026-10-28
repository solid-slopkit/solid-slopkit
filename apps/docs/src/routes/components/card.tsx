import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/card/basic';
import basicCode from '../../examples/components/card/basic.tsx?raw';
import Variants from '../../examples/components/card/variants';
import variantsCode from '../../examples/components/card/variants.tsx?raw';
import Sizes from '../../examples/components/card/sizes';
import sizesCode from '../../examples/components/card/sizes.tsx?raw';
import Horizontal from '../../examples/components/card/horizontal';
import horizontalCode from '../../examples/components/card/horizontal.tsx?raw';

export default function CardPage() {
  return (
    <article class="docs-page">
      <Title>Card · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Card</h1>
      <p class="docs-lead">
        Content grouped on a surface, built from fixed parts: <code>Card.Header</code>, <code>Card.Image</code>,{' '}
        <code>Card.Body</code> and <code>Card.Footer</code>, with <code>Card.Title</code> and <code>Card.Description</code> for
        the heading.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Card } from '@solid-slopkit/components';`} />
      <p>
        The parts are also exported as <code>CardHeader</code>, <code>CardTitle</code>, <code>CardDescription</code>,{' '}
        <code>CardImage</code>, <code>CardBody</code> and <code>CardFooter</code>.
      </p>

      <H2 id="parts">Parts</H2>
      <p>
        Each part is optional. The header is a row that puts anything after the title at the end. <code>Card.Title</code> is a
        level-3 heading that looks like an <code>h5</code>, and <code>Card.Description</code> is a small, dimmed line under it;
        with them in the header, the two stack at the start and each other child takes a column at the end, aligned to the top.
        They take Title's and Text's props to change the level, size or color. The image is flush with the card's edges and
        cropped to fit; <code>alt</code> is required. The footer is a row of actions on a muted strip below a divider, flush with
        the card's sides and bottom. One spacing value, 1rem, sets the gap between the parts and the padding around them; set{' '}
        <code>--slp-card-spacing</code> to change it.
      </p>
      <Example component={Basic} code={basicCode} column />

      <H2 id="variants">Variants</H2>
      <p>
        <code>outline</code> is the default. <code>soft</code> is a quieter surface with no border, and <code>elevated</code> adds
        a shadow.
      </p>
      <Example component={Variants} code={variantsCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>
        <code>size="sm"</code> tightens the spacing to 0.75rem and makes <code>Card.Title</code> look like an <code>h6</code>.
      </p>
      <Example component={Sizes} code={sizesCode} column />

      <H2 id="horizontal">Horizontal</H2>
      <p>
        <code>orientation="horizontal"</code> puts the image in a column on the start side and stacks the other parts beside it;
        they set the card's height. Use one of each part.
      </p>
      <Example component={Horizontal} code={horizontalCode} column />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>div</code>. The parts take the attributes of a <code>div</code>, and{' '}
        <code>Card.Image</code> those of an <code>img</code>. <code>Card.Title</code> takes Title's props (<code>order</code>{' '}
        defaults to <code>3</code>, <code>size</code> to <code>'h5'</code>) and <code>Card.Description</code> takes Text's (
        <code>size</code> defaults to <code>'sm'</code>, <code>dimmed</code> to <code>true</code>).
      </p>
      <PropsTable
        rows={[
          { name: 'variant', type: "'outline' | 'soft' | 'elevated'", default: "'outline'", description: 'Surface style.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Spacing and title size.' },
          {
            name: 'orientation',
            type: "'vertical' | 'horizontal'",
            default: "'vertical'",
            description: (
              <>
                <code>horizontal</code> puts the image on the start side.
              </>
            ),
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-card</code>, with <code>data-variant</code>, <code>data-orientation</code> and{' '}
        <code>data-size</code>, and reads <code>--slp-card-spacing</code> for the spacing between and around the parts. Each part
        is a component with its own root class: <code>.slp-card-header</code>, <code>.slp-card-title</code>,{' '}
        <code>.slp-card-description</code>, <code>.slp-card-image</code>, <code>.slp-card-body</code> and{' '}
        <code>.slp-card-footer</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CodeBlock
        code={`.slp-card { --slp-card-spacing: 1.5rem; }
.slp-card-image { aspect-ratio: 16 / 9; }
.slp-card[data-orientation='horizontal'] { grid-template-columns: 8rem 1fr; }`}
      />
    </article>
  );
}
