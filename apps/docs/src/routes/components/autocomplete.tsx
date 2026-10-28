import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/autocomplete/basic';
import basicCode from '../../examples/components/autocomplete/basic.tsx?raw';
import Groups from '../../examples/components/autocomplete/groups';
import groupsCode from '../../examples/components/autocomplete/groups.tsx?raw';

export default function AutocompletePage() {
  return (
    <article class="docs-page">
      <Title>Autocomplete · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Autocomplete</h1>
      <p class="docs-lead">
        A labelled text field with suggestions: what's typed is the value, and the suggestions that contain it are offered in a
        dropdown to fill it in.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Autocomplete } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Typing opens the suggestions that contain the text, ignoring case, and closes them when nothing matches, so the dropdown
        is never empty. Typing doesn't make a suggestion active: Enter keeps what was typed and submits a form as usual. The
        arrows move to a suggestion, and Enter or a click then fills it in. Escape and Tab close it and keep the text. For a value
        that must be one of the options, use a Select with <code>searchable</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="groups">Groups, limit and control</H2>
      <p>
        Suggestions can be strings, items with a <code>value</code> and <code>disabled</code>, or groups under a heading.{' '}
        <code>limit</code> caps how many are shown, across the groups. <code>onChange</code> gets the text on every change;{' '}
        <code>onOptionSubmit</code> only when a suggestion is chosen.
      </p>
      <Example component={Groups} code={groupsCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>class</code> and <code>style</code> go to the root, with the label and texts; other props, such as <code>name</code>{' '}
        or <code>placeholder</code>, go to the input. Plus <code>label</code>, <code>labelSection</code>, <code>description</code>
        , <code>error</code>, <code>required</code>, <code>withAsterisk</code>, <code>size</code> and <code>id</code>, as on
        TextInput.
      </p>
      <PropsTable
        rows={[
          { name: 'data', type: 'AutocompleteData', description: 'The suggestions: strings, items and groups. Required.' },
          { name: 'value', type: 'string', description: 'The text, when controlled.' },
          { name: 'defaultValue', type: 'string', default: "''", description: 'The text it starts with, when uncontrolled.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called whenever the text changes.' },
          { name: 'onOptionSubmit', type: '(value: string) => void', description: 'Called when a suggestion is chosen.' },
          { name: 'limit', type: 'number', description: 'At most this many suggestions are shown.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the text without letting it change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the text.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the text.' },
          {
            name: 'comboboxProps',
            type: '{ position, offset, matchTargetWidth, transition, transitionDuration }',
            description: "The dropdown's position and animation.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-autocomplete</code>; the field box is an <code>.slp-input</code>, and the dropdown a
        Combobox's (<code>.slp-combobox</code>, <code>.slp-combobox-option</code>). The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
