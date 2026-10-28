import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/native-select/basic';
import basicCode from '../../examples/components/native-select/basic.tsx?raw';
import Groups from '../../examples/components/native-select/groups';
import groupsCode from '../../examples/components/native-select/groups.tsx?raw';
import { withBase } from '../../base';

export default function NativeSelectPage() {
  return (
    <article class="docs-page">
      <Title>NativeSelect · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>NativeSelect</h1>
      <p class="docs-lead">
        A labelled native <code>select</code> in an <a href={withBase('/components/input')}>Input</a> box, with a chevron. The
        browser draws the list, so it behaves like any select on every device, including phones' own pickers.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { NativeSelect } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>data</code> takes strings, <code>{'{ value, label, disabled }'}</code> objects and <code>{'{ group, items }'}</code>{' '}
        groups; without it, pass <code>option</code>s as children. The value and <code>onChange</code> are the select's own.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="groups">Groups and placeholder</H2>
      <p>
        Groups become <code>optgroup</code>s. <code>placeholder</code> adds a first, empty option that can't be chosen again;
        start a controlled select at <code>value=""</code> to show it.
      </p>
      <Example component={Groups} code={groupsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>select</code>; the wrapper's are TextInput's. One choice only: there's no{' '}
        <code>multiple</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'data',
            type: '(string | { value, label?, disabled? } | { group, items })[]',
            description: 'The options. Without it, children.',
          },
          { name: 'placeholder', type: 'string', description: 'A first, empty option shown until a choice.' },
          { name: 'value', type: 'string', description: 'The chosen value, controlled.' },
          { name: 'onChange', type: '(event) => void', description: "The select's change event." },
          {
            name: 'variant',
            type: "'outline' | 'soft' | 'ghost'",
            default: "'outline'",
            description: 'Visual style of the box.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the select.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select.' },
          { name: 'children', type: 'JSX.Element', description: 'The option elements, without data.' },
          { name: 'ref', type: 'Ref<HTMLElement>', description: 'The select.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-native-select</code> and <code>.slp-input-wrapper</code>. The select is the Input's{' '}
        <code>input-control</code> slot, and the chevron has the slot <code>native-select-chevron</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
