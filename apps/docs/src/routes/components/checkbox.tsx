import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/checkbox/basic';
import basicCode from '../../examples/components/checkbox/basic.tsx?raw';
import Indeterminate from '../../examples/components/checkbox/indeterminate';
import indeterminateCode from '../../examples/components/checkbox/indeterminate.tsx?raw';
import GroupExample from '../../examples/components/checkbox/group';
import groupCode from '../../examples/components/checkbox/group.tsx?raw';
import Card from '../../examples/components/checkbox/card';
import cardCode from '../../examples/components/checkbox/card.tsx?raw';

export default function CheckboxPage() {
  return (
    <article class="docs-page">
      <Title>Checkbox · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Checkbox</h1>
      <p class="docs-lead">
        A checkbox with a label: a native <code>input type="checkbox"</code> drawn as a box with a check, next to a label,
        description and error. Alone, in a <code>Checkbox.Group</code>, or as a <code>Checkbox.Card</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Checkbox } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Controlled with <code>checked</code> and <code>onChange</code>, which gets the new <code>boolean</code>, or uncontrolled
        with <code>defaultChecked</code>. A click on the label toggles. <code>error</code> describes the checkbox and marks it
        invalid.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="indeterminate">Indeterminate</H2>
      <p>
        <code>indeterminate</code> shows a dash for “some of these”, and screen readers say “mixed”. Keep it up to date yourself.
      </p>
      <Example component={Indeterminate} code={indeterminateCode} />

      <H2 id="group">Checkbox.Group</H2>
      <p>
        One value for several checkboxes: the array of the checked ones' <code>value</code>s. The group is a{' '}
        <code>role="group"</code> named by its label; it doesn't lay out its children, so put them in a Stack or a Group.
      </p>
      <Example component={GroupExample} code={groupCode} />

      <H2 id="card">Checkbox.Card</H2>
      <p>
        A card that is a checkbox: a click anywhere toggles it. The content is its accessible name, so keep it short and don't put
        links or buttons inside. Cards work in a group too.
      </p>
      <Example component={Card} code={cardCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>input</code>; <code>class</code> and <code>style</code> go to the root.
      </p>
      <PropsTable
        rows={[
          { name: 'checked', type: 'boolean', description: "Whether it's checked, controlled." },
          { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Whether it starts checked, uncontrolled.' },
          { name: 'onChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows a dash; the state is mixed.' },
          { name: 'label', type: 'JSX.Element', description: 'The label next to the box.' },
          { name: 'description', type: 'JSX.Element', description: 'Help text under the label.' },
          { name: 'error', type: 'JSX.Element', description: 'Error message; marks it invalid.' },
          { name: 'value', type: 'string', description: 'Submitted when checked; the key in a group.' },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "group's, or 'md'",
            description: 'Size of the box and text.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color of the checked box.',
          },
          {
            name: 'labelPosition',
            type: "'right' | 'left'",
            default: "'right'",
            description: "Which side of the box the label goes; left puts the box at the row's end.",
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
        ]}
      />
      <p>
        <code>Checkbox.Group</code> takes <code>value</code>, <code>defaultValue</code>, <code>onChange</code> (with a{' '}
        <code>string[]</code>), <code>name</code>, <code>disabled</code> and InputWrapper's props. <code>Checkbox.Card</code>{' '}
        takes Checkbox's state props and <code>color</code>, with the content as children.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The roots are <code>.slp-checkbox</code>, <code>.slp-checkbox-group</code> and <code>.slp-checkbox-card</code>. A
        checkbox's slots are <code>checkbox-control</code>, <code>checkbox-input</code> (the box), <code>checkbox-icon</code> and
        the text slots; a card's are <code>checkbox-card-input</code>, <code>checkbox-card-indicator</code> and{' '}
        <code>checkbox-card-content</code>. State is in <code>data-checked</code>, <code>data-indeterminate</code>,{' '}
        <code>data-disabled</code> and <code>data-invalid</code>. Its rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-checkbox-color',
            default: 'var(--slp-color-<color>)',
            description: "The checked box, and a checked card's border.",
          },
          { name: '--slp-checkbox-content', default: 'var(--slp-color-<color>-content)', description: 'The check.' },
        ]}
      />
    </article>
  );
}
