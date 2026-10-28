import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Variants from '../../examples/components/input/variants';
import variantsCode from '../../examples/components/input/variants.tsx?raw';
import Sections from '../../examples/components/input/sections';
import sectionsCode from '../../examples/components/input/sections.tsx?raw';
import Sizes from '../../examples/components/input/sizes';
import sizesCode from '../../examples/components/input/sizes.tsx?raw';
import Textarea from '../../examples/components/input/textarea';
import textareaCode from '../../examples/components/input/textarea.tsx?raw';
import { withBase } from '../../base';

export default function InputPage() {
  return (
    <article class="docs-page">
      <Title>Input · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Input</h1>
      <p class="docs-lead">
        A field box: a control, an <code>input</code> by default or any element with <code>as</code>, with optional sections on
        either side. The building block of the text fields; for a labelled field, put it in an{' '}
        <a href={withBase('/components/input-wrapper')}>InputWrapper</a>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Input } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>value</code>, <code>onInput</code>, <code>placeholder</code> and every other attribute go to the control. Only{' '}
        <code>class</code> and <code>style</code> go to the box, so a width or margin applies to what you see. A lone Input has no
        label: give it <code>aria-label</code>, or put it in an InputWrapper. <code>outline</code> is the default variant;{' '}
        <code>soft</code> is filled and has no border until it's focused; <code>ghost</code> has neither, for fields inside
        something that already draws a box.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="sections">Sections</H2>
      <p>
        <code>leftSection</code> and <code>rightSection</code> hold an icon, a unit or a button. A mouse down anywhere in the box
        focuses the control, unless it lands on a button or another control in a section.
      </p>
      <Example component={Sections} code={sectionsCode} />

      <H2 id="sizes">Sizes</H2>
      <p>
        The same heights as Button, so a field and a button of the same size line up. On touch screens the text is at least 16px,
        so phones don't zoom in when the field is focused.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="textarea">Other controls</H2>
      <p>
        <code>as</code> renders another control, read once. A textarea grows the box, and its sections stay on the first line.
      </p>
      <Example component={Textarea} code={textareaCode} />

      <H2 id="props">Props</H2>
      <p>Other props are passed to the control.</p>
      <PropsTable
        rows={[
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: 'Visual style.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "the wrapper's, or 'md'",
            description: 'Height and text size.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the control.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the control.' },
          {
            name: 'invalid',
            type: 'boolean',
            default: 'whether the wrapper has an error',
            description: 'Error border and aria-invalid.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the control read-only.' },
          { name: 'required', type: 'boolean', default: "the wrapper's", description: 'Makes the control required.' },
          { name: 'as', type: 'ValidComponent', default: "'input'", description: 'Element or component for the control.' },
          { name: 'class', type: 'ClassValue', description: 'Classes for the box.' },
          { name: 'style', type: 'JSX.CSSProperties', description: 'Styles for the box.' },
          { name: 'ref', type: 'Ref<HTMLElement>', description: 'The control element.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The box has the class <code>.slp-input</code>, with <code>data-variant</code>, <code>data-size</code>,{' '}
        <code>data-invalid</code>, <code>data-disabled</code>, <code>data-read-only</code>, <code>data-multiline</code> and{' '}
        <code>data-with-left-section</code> / <code>data-with-right-section</code>. Its slots are <code>input-control</code>,{' '}
        <code>input-left-section</code> and <code>input-right-section</code>. The focus ring is <code>:focus-within</code> on the
        box. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
