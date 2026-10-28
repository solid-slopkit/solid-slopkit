import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/fieldset/basic';
import basicCode from '../../examples/components/fieldset/basic.tsx?raw';
import Variants from '../../examples/components/fieldset/variants';
import variantsCode from '../../examples/components/fieldset/variants.tsx?raw';
import Disabled from '../../examples/components/fieldset/disabled';
import disabledCode from '../../examples/components/fieldset/disabled.tsx?raw';

export default function FieldsetPage() {
  return (
    <article class="docs-page">
      <Title>Fieldset · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Fieldset</h1>
      <p class="docs-lead">
        A group of related fields: a <code>fieldset</code>, with its <code>legend</code> as a caption inside the box.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Fieldset } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The legend names the group, so screen readers say “Shipping address, group” before its first field. Without one, give the
        fieldset an <code>aria-label</code>. The fields stack in a column, 1rem apart.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Variants</H2>
      <p>
        <code>outline</code> is a bordered box, <code>soft</code> a filled one, and <code>ghost</code> has no box, for grouping
        without a frame.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="disabled">Disabled</H2>
      <p>
        <code>disabled</code> disables every control inside, natively, including ones that aren't from this library. Inputs inside
        look disabled too.
      </p>
      <Example component={Disabled} code={disabledCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>fieldset</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'legend', type: 'JSX.Element', description: "The group's caption and name." },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: 'Visual style.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every control inside, natively.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-fieldset</code>, with <code>data-variant</code> and <code>data-disabled</code>. The
        legend has the slot <code>fieldset-legend</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered
        CSS wins.
      </p>
    </article>
  );
}
