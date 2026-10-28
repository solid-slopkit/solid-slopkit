import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Single from '../../examples/components/chip/single';
import singleCode from '../../examples/components/chip/single.tsx?raw';
import Multiple from '../../examples/components/chip/multiple';
import multipleCode from '../../examples/components/chip/multiple.tsx?raw';
import Variants from '../../examples/components/chip/variants';
import variantsCode from '../../examples/components/chip/variants.tsx?raw';

export default function ChipPage() {
  return (
    <article class="docs-page">
      <Title>Chip · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Chip</h1>
      <p class="docs-lead">
        A pill-shaped toggle: a <code>label</code> around a hidden native checkbox, or a radio in a single-choice{' '}
        <code>Chip.Group</code>. For filters, tags and quick options.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Chip } from '@solid-slopkit/components';`} />

      <H2 id="single">One choice</H2>
      <p>
        By default a group is single-choice: the chips are radios, the value is a <code>string</code>, and the arrow keys move the
        choice.
      </p>
      <Example component={Single} code={singleCode} />

      <H2 id="multiple">Several choices</H2>
      <p>
        With <code>multiple</code>, the chips are checkboxes and the value is a <code>string[]</code>; the types follow the prop.
        Without a visible label, name the group with <code>aria-label</code>.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="variants">Variants</H2>
      <p>
        How a chip looks when on: <code>soft</code>, <code>outline</code> or <code>filled</code>. Soft and outline keep the text
        in the base color, so it stays readable whatever the role.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>Chip</code>: other props go to the hidden <code>input</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'Its key in a group, and for forms.' },
          { name: 'checked', type: 'boolean', description: "Whether it's on, alone and controlled." },
          { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Whether it starts on, alone.' },
          { name: 'onChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
          { name: 'variant', type: "'soft' | 'outline' | 'filled'", default: "'soft'", description: 'How it looks when on.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color when on.',
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "group's, or 'md'",
            description: 'Height and text size.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
        ]}
      />
      <p>
        <code>Chip.Group</code>: other props go to the InputWrapper root. Plus InputWrapper's <code>label</code>,{' '}
        <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>; <code>aria-label</code> names the group.
      </p>
      <PropsTable
        rows={[
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Several chips can be on. Read once.' },
          { name: 'value', type: 'string | undefined, or string[] with multiple', description: 'The value, controlled.' },
          { name: 'defaultValue', type: 'string, or string[] with multiple', description: 'The starting value, uncontrolled.' },
          { name: 'onChange', type: '(value: string), or (value: string[])', description: 'Called with the new value.' },
          { name: 'name', type: 'string', default: 'generated', description: 'The name of every chip.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every chip.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The roots are <code>.slp-chip</code> (the <code>label</code>) and <code>.slp-chip-group</code>. A chip's slots are{' '}
        <code>chip-input</code>, <code>chip-icon</code> and <code>chip-label</code>; the group's chips are in{' '}
        <code>chip-group-items</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          { name: '--slp-chip-color', default: 'var(--slp-color-<color>)', description: 'The color when on.' },
          {
            name: '--slp-chip-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Text color on a filled chip.',
          },
        ]}
      />
    </article>
  );
}
