import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/color-input/basic';
import basicCode from '../../examples/components/color-input/basic.tsx?raw';
import Formats from '../../examples/components/color-input/formats';
import formatsCode from '../../examples/components/color-input/formats.tsx?raw';
import States from '../../examples/components/color-input/states';
import statesCode from '../../examples/components/color-input/states.tsx?raw';

export default function ColorInputPage() {
  return (
    <article class="docs-page">
      <Title>ColorInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>ColorInput</h1>
      <p class="docs-lead">A labelled text field for a color, with a swatch of it in front and a ColorPicker in a dropdown.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { ColorInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is the color as text. A click on the field, or ArrowDown, opens the picker under it; Tab moves from the field
        into the picker, and Escape, a press outside, or focus leaving both closes it. Typing a color sets it as soon as it reads
        as one, and leaving the field shows it in the field's format. Where the browser has an eye dropper, a button at the end
        picks a color from the screen.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="formats">Formats and swatches</H2>
      <p>
        The field reads hex, <code>rgb()</code> and <code>hsl()</code>, and <code>format</code> sets what the value is in:{' '}
        <code>hex</code> (the default), <code>hexa</code>, <code>rgb</code>, <code>rgba</code>, <code>hsl</code> or{' '}
        <code>hsla</code>. The formats with alpha add an alpha slider; the others drop the alpha. <code>swatches</code> adds
        colors to pick with one click. <code>onChange</code> runs on every change, a drag's every step included;{' '}
        <code>onChangeEnd</code> when one is done.
      </p>
      <Example component={Formats} code={formatsCode} />

      <H2 id="states">Without a picker, and states</H2>
      <p>
        <code>withPicker={'{false}'}</code> leaves just the field, the swatch and the eye dropper. The box is an Input's:{' '}
        <code>variant</code>, <code>size</code>, and <code>leftSection</code> and <code>rightSection</code>, which replace the
        swatch and the eye dropper. The label, description and error work as on TextInput. <code>readOnly</code> and{' '}
        <code>disabled</code> keep the picker closed.
      </p>
      <Example component={States} code={statesCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>class</code> and <code>style</code> go to the root, with the label and texts; other props, such as <code>name</code>
        , <code>placeholder</code> or <code>onBlur</code>, go to the field. Plus <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>required</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>, as on TextInput.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: "The color, when controlled; '' for none." },
          { name: 'defaultValue', type: 'string', default: "''", description: 'The color it starts with.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called on every change, in format.' },
          { name: 'onChangeEnd', type: '(value: string) => void', description: 'Called when a change is done.' },
          {
            name: 'format',
            type: "'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla'",
            default: "'hex'",
            description: 'The format of the value.',
          },
          { name: 'swatches', type: 'string[]', description: 'Colors to pick with one click.' },
          { name: 'swatchesPerRow', type: 'number', default: '7', description: 'Swatches per row.' },
          { name: 'withPicker', type: 'boolean', default: 'true', description: 'Shows the picker in a dropdown.' },
          {
            name: 'withEyeDropper',
            type: 'boolean',
            default: 'true',
            description: 'Shows the eye dropper button, where the browser has one.',
          },
          {
            name: 'eyeDropperLabel',
            type: 'string',
            default: "'Pick a color from the screen'",
            description: "The eye dropper button's name.",
          },
          { name: 'hideSwatch', type: 'boolean', default: 'false', description: 'Hides the swatch in front of the text.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the color without letting it change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', default: 'the swatch', description: 'Content before the text.' },
          { name: 'rightSection', type: 'JSX.Element', default: 'the eye dropper', description: 'Content after the text.' },
          { name: 'position', type: 'FloatingPlacement', default: "'bottom-start'", description: 'Where the dropdown goes.' },
          { name: 'offset', type: 'number', default: '4', description: 'Gap between the field and the dropdown, in px.' },
          { name: 'transition', type: 'TransitionName', default: "'fade'", description: "The dropdown's animation." },
          { name: 'transitionDuration', type: 'number', default: '150', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-color-input</code> and the field box is an <code>.slp-input</code>. Inside are{' '}
        <code>[data-slot="color-input-swatch"]</code> (a ColorSwatch) and <code>[data-slot="color-input-eye-dropper"]</code>. The
        dropdown is <code>.slp-color-input-dropdown</code> (<code>[data-slot="color-input-dropdown"]</code>, with{' '}
        <code>data-placement</code> and <code>data-status</code>), and holds a <code>.slp-color-picker</code>. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
