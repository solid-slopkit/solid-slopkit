import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/pill/basic';
import basicCode from '../../examples/components/pill/basic.tsx?raw';
import Removable from '../../examples/components/pill/removable';
import removableCode from '../../examples/components/pill/removable.tsx?raw';
import Colors from '../../examples/components/pill/colors';
import colorsCode from '../../examples/components/pill/colors.tsx?raw';
import Sizes from '../../examples/components/pill/sizes';
import sizesCode from '../../examples/components/pill/sizes.tsx?raw';

export default function PillPage() {
  return (
    <article class="docs-page">
      <Title>Pill · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Pill</h1>
      <p class="docs-lead">
        A small rounded tag for a value someone chose, such as a tag or a picked option, optionally with a button that removes it.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Pill } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A Pill is a <code>span</code> whose label truncates when it doesn't fit. <code>Pill.Group</code> lays pills out in a row
        that wraps. PillsInput, MultiSelect and TagsInput show their values as pills.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="remove">Removing</H2>
      <p>
        <code>withRemoveButton</code> adds a small button that calls <code>onRemove</code>. It's named after the pill, "Remove
        Berlin", so each one says what it removes; <code>removeLabel</code> changes the first word. It's a tab stop, and Enter and
        Space press it.
      </p>
      <Example component={Removable} code={removableCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role: a light tint of it behind text in it, so it sits on any surface. Without one, the
        pill is on the base surface's second shade. <code>Pill.Group</code>'s <code>color</code> applies to every pill in it, and{' '}
        <code>--slp-pill-color</code> sets any color, on the pill or an ancestor.
      </p>
      <Example component={Colors} code={colorsCode} />

      <H2 id="sizes">Sizes and disabled</H2>
      <p>
        <code>xs</code> to <code>xl</code>, <code>md</code> by default, each sized to sit inside an input of the same size.{' '}
        <code>Pill.Group</code>'s <code>size</code> and <code>disabled</code> apply to every pill in it, as its <code>color</code>{' '}
        does; a disabled pill is dimmed and its remove button disabled.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>span</code>. <code>Pill.Group</code> takes <code>size</code>, <code>color</code> and{' '}
        <code>disabled</code>, and passes the rest to its <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: "Its size. Defaults to the group's.",
          },
          { name: 'color', type: 'SlopColor', description: "Color role. Defaults to the group's." },
          { name: 'withRemoveButton', type: 'boolean', default: 'false', description: 'Shows a button that removes it.' },
          { name: 'onRemove', type: '() => void', description: 'Called when the remove button is pressed.' },
          {
            name: 'removeLabel',
            type: 'string',
            default: "'Remove'",
            description: "The first word of the remove button's name.",
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims it and disables the remove button.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The pill has the class <code>.slp-pill</code>, with <code>[data-slot="pill-label"]</code> and{' '}
        <code>[data-slot="pill-remove"]</code> inside, and the group <code>.slp-pill-group</code>. Both have{' '}
        <code>data-size</code> and <code>data-disabled</code>; a pill has <code>data-color</code>, and{' '}
        <code>data-with-remove</code> with a remove button. Its tint and text come from <code>--slp-pill-color</code>. The rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
