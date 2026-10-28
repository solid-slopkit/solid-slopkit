import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/radio/basic';
import basicCode from '../../examples/components/radio/basic.tsx?raw';
import Card from '../../examples/components/radio/card';
import cardCode from '../../examples/components/radio/card.tsx?raw';

export default function RadioPage() {
  return (
    <article class="docs-page">
      <Title>Radio · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Radio</h1>
      <p class="docs-lead">
        A radio with a label: a native <code>input type="radio"</code> drawn as a circle. Radios are one choice of several: put
        them in a <code>Radio.Group</code>, or use <code>Radio.Card</code> for bigger targets.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Radio } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The group's value is the chosen radio's <code>value</code>. The radios share a <code>name</code>, so Tab reaches the
        chosen one and the arrow keys move the choice. The group is a <code>role="radiogroup"</code> named by its label; it
        doesn't lay out its children.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="card">Radio.Card</H2>
      <p>A card that is a radio: a click anywhere chooses it. Its content is its accessible name, so keep it short.</p>
      <Example component={Card} code={cardCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>Radio.Group</code>: other props go to the InputWrapper root. Plus InputWrapper's <code>label</code>,{' '}
        <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string | undefined', description: 'The chosen value, controlled.' },
          { name: 'defaultValue', type: 'string', description: 'The value chosen at first, uncontrolled.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called with the newly chosen value.' },
          { name: 'name', type: 'string', default: 'generated', description: 'The name of every radio.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every radio.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'A choice is needed to send the form.' },
        ]}
      />
      <p>
        <code>Radio</code>: other props go to the <code>input</code>; <code>class</code> and <code>style</code> to the root.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'Its value in the group, and for forms.' },
          { name: 'label', type: 'JSX.Element', description: 'The label next to the circle.' },
          { name: 'description', type: 'JSX.Element', description: 'Help text under the label.' },
          { name: 'error', type: 'JSX.Element', description: 'Error message; marks it invalid.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "group's, or 'md'",
            description: 'Size of the circle and text.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color of the chosen circle.',
          },
          {
            name: 'labelPosition',
            type: "'right' | 'left'",
            default: "'right'",
            description: "Which side the label goes; left puts the circle at the row's end.",
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          { name: 'checked, defaultChecked, onChange', type: '—', description: 'Outside a group only.' },
        ]}
      />
      <p>
        <code>Radio.Card</code>: other props go to the hidden <code>input</code>; <code>class</code> and <code>style</code> to the{' '}
        <code>label</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'Its value in the group.' },
          { name: 'children', type: 'JSX.Element', description: 'The content, which is also its accessible name.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color of the chosen circle and border.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          { name: 'name', type: 'string', default: "group's", description: "The input's name." },
          { name: 'checked, defaultChecked, onChange', type: '—', description: 'Outside a group only.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The roots are <code>.slp-radio</code>, <code>.slp-radio-group</code> and <code>.slp-radio-card</code>. A radio's slots are{' '}
        <code>radio-control</code>, <code>radio-input</code> (the circle), <code>radio-icon</code> (the dot) and the text slots; a
        card's are <code>radio-card-input</code>, <code>radio-card-indicator</code> and <code>radio-card-content</code>. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-radio-color',
            default: 'var(--slp-color-<color>)',
            description: "The chosen circle, and a chosen card's border.",
          },
          { name: '--slp-radio-content', default: 'var(--slp-color-<color>-content)', description: 'The dot.' },
        ]}
      />
    </article>
  );
}
