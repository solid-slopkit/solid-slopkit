import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/color-picker/basic';
import basicCode from '../../examples/components/color-picker/basic.tsx?raw';
import Alpha from '../../examples/components/color-picker/alpha';
import alphaCode from '../../examples/components/color-picker/alpha.tsx?raw';

export default function ColorPickerPage() {
  return (
    <article class="docs-page">
      <Title>ColorPicker · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>ColorPicker</h1>
      <p class="docs-lead">
        A color picked on a panel: a saturation and brightness area, a hue slider, an alpha slider for formats with alpha, a
        preview, and optional swatches.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { ColorPicker } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is a color string, reported in <code>format</code> (<code>hex</code> by default). Each part is a tab stop with
        the <code>slider</code> role: the arrows move it, Shift moves it by 10. The picker keeps the hue while the color is grey
        or black.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="alpha">Alpha</H2>
      <p>
        The formats with alpha (<code>hexa</code>, <code>rgba</code>, <code>hsla</code>) add an alpha slider over a checkerboard.
      </p>
      <Example component={Alpha} code={alphaCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the InputWrapper root. Plus InputWrapper's <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>withAsterisk</code>, <code>size</code> and <code>id</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'The color, controlled.' },
          { name: 'defaultValue', type: 'string', default: "'#000000'", description: 'The starting color, uncontrolled.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called on every step, in format.' },
          { name: 'onChangeEnd', type: '(value: string) => void', description: 'Called when the user lets go.' },
          {
            name: 'format',
            type: "'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla'",
            default: "'hex'",
            description: 'The format reported.',
          },
          { name: 'swatches', type: 'string[]', description: 'Colors to pick with one click.' },
          { name: 'swatchesPerRow', type: 'number', default: '7', description: 'Swatches per row.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches the panel.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          {
            name: 'saturationLabel',
            type: 'string',
            default: "'Saturation and brightness'",
            description: "The area's accessible name.",
          },
          { name: 'hueLabel', type: 'string', default: "'Hue'", description: "The hue slider's accessible name." },
          { name: 'alphaLabel', type: 'string', default: "'Alpha'", description: "The alpha slider's accessible name." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-color-picker</code> and <code>.slp-input-wrapper</code>. Its slots are{' '}
        <code>color-picker-body</code>, <code>color-picker-saturation</code>, <code>color-picker-hue</code>,{' '}
        <code>color-picker-alpha</code>, <code>color-picker-thumb</code>, <code>color-picker-preview</code>,{' '}
        <code>color-picker-swatches</code> and <code>color-picker-swatch</code>; the root has <code>data-full-width</code> and{' '}
        <code>data-disabled</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
