import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/switch/basic';
import basicCode from '../../examples/components/switch/basic.tsx?raw';
import Sizes from '../../examples/components/switch/sizes';
import sizesCode from '../../examples/components/switch/sizes.tsx?raw';
import Group from '../../examples/components/switch/group';
import groupCode from '../../examples/components/switch/group.tsx?raw';
import { withBase } from '../../base';

export default function SwitchPage() {
  return (
    <article class="docs-page">
      <Title>Switch · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Switch</h1>
      <p class="docs-lead">
        An on/off switch with a label: a native checkbox with <code>role="switch"</code>, drawn as a track with a sliding thumb.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Switch } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A switch is for a setting that takes effect at once; for a choice applied when a form is sent, use a{' '}
        <a href={withBase('/components/checkbox')}>Checkbox</a>. Controlled with <code>checked</code> and <code>onChange</code>,
        or uncontrolled. Screen readers say “Wi-Fi, switch, on”.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="sizes">Sizes</H2>
      <p>
        <code>size</code> sizes the track and the text together.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="group">Switch.Group</H2>
      <p>
        One value for several switches: the array of the ones that are on. It works like <code>Checkbox.Group</code>.
      </p>
      <Example component={Group} code={groupCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>input</code>; <code>class</code> and <code>style</code> go to the root.
      </p>
      <PropsTable
        rows={[
          { name: 'checked', type: 'boolean', description: "Whether it's on, controlled." },
          { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Whether it starts on, uncontrolled.' },
          { name: 'onChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
          { name: 'label', type: 'JSX.Element', description: 'The label next to the track.' },
          { name: 'description', type: 'JSX.Element', description: 'Help text under the label.' },
          { name: 'error', type: 'JSX.Element', description: 'Error message; marks it invalid.' },
          { name: 'value', type: 'string', description: 'Submitted when on; the key in a group.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "group's, or 'md'",
            description: 'Size of the track and text.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color of the track when on.',
          },
          {
            name: 'labelPosition',
            type: "'right' | 'left'",
            default: "'right'",
            description: "Which side the label goes; left puts the switch at the row's end.",
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
        ]}
      />
      <p>
        <code>Switch.Group</code> takes <code>value</code>, <code>defaultValue</code>, <code>onChange</code> (with a{' '}
        <code>string[]</code>), <code>name</code>, <code>disabled</code> and InputWrapper's <code>label</code>,{' '}
        <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>; other props go to its root.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The roots are <code>.slp-switch</code> and <code>.slp-switch-group</code>. A switch's slots are{' '}
        <code>switch-control</code>, <code>switch-track</code> (the input), <code>switch-thumb</code> and the text slots. Its
        rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          { name: '--slp-switch-color', default: 'var(--slp-color-<color>)', description: 'The track when on.' },
          { name: '--slp-switch-content', default: 'var(--slp-color-<color>-content)', description: 'The thumb when on.' },
        ]}
      />
    </article>
  );
}
