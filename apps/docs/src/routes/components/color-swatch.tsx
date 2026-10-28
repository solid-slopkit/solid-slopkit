import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/color-swatch/basic';
import basicCode from '../../examples/components/color-swatch/basic.tsx?raw';
import Tokens from '../../examples/components/color-swatch/tokens';
import tokensCode from '../../examples/components/color-swatch/tokens.tsx?raw';
import Picker from '../../examples/components/color-swatch/picker';
import pickerCode from '../../examples/components/color-swatch/picker.tsx?raw';

export default function ColorSwatchPage() {
  return (
    <article class="docs-page">
      <Title>ColorSwatch · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>ColorSwatch</h1>
      <p class="docs-lead">
        A sample of a color: a round <code>span</code> filled with it, over a checkerboard that shows transparency.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { ColorSwatch } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>value</code> takes any CSS color. A translucent color shows the checkerboard through it, and a faint ring keeps a
        color close to the surface visible.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="tokens">Theme tokens</H2>
      <p>
        A custom property works too, so a swatch can show a theme's color roles or a palette shade. The prop is <code>value</code>
        , not <code>color</code>: on other components <code>color</code> takes a color role, and here the color is the data being
        shown. A swatch on its own gets <code>role="img"</code> and a name.
      </p>
      <Example component={Tokens} code={tokensCode} />

      <H2 id="picker">In a picker</H2>
      <p>
        Children are drawn on top of the color, such as a check mark on the selected swatch. ColorSwatch isn't interactive: for a
        picker, put each swatch in a button with a name and <code>aria-pressed</code>.
      </p>
      <Example component={Picker} code={pickerCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'Any CSS color. Required.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size, from 16 to 44px.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-color-swatch</code> and <code>data-size</code>, and no slots. The color is a{' '}
        <code>::before</code> layer over the root's checkerboard; its ring is that layer's inset <code>box-shadow</code>. A square
        swatch is one selector: <code>{'.slp-color-swatch { border-radius: 4px }'}</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
