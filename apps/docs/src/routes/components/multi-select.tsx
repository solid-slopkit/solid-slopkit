import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/multi-select/basic';
import basicCode from '../../examples/components/multi-select/basic.tsx?raw';
import Options from '../../examples/components/multi-select/options';
import optionsCode from '../../examples/components/multi-select/options.tsx?raw';
import States from '../../examples/components/multi-select/states';
import statesCode from '../../examples/components/multi-select/states.tsx?raw';

export default function MultiSelectPage() {
  return (
    <article class="docs-page">
      <Title>MultiSelect · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>MultiSelect</h1>
      <p class="docs-lead">
        A labelled field that picks several values from a list in a dropdown, shown as pills, with a field after them that filters
        the options.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { MultiSelect } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>data</code> holds the options, and the value is an array of them. Each value shows as a pill with a button that
        removes it. Typing in the field filters the options and makes the first match active; Enter or a click adds the option, or
        takes it out when it's already selected, and the dropdown stays open for the next one. Backspace in the empty field takes
        out the last value. Selected options have a check mark.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="options">Groups, limits and clearing</H2>
      <p>
        Options can be strings, items with a <code>value</code>, <code>label</code> and <code>disabled</code>, or groups under a
        heading. <code>hidePickedOptions</code> leaves the selected ones out of the list, <code>maxValues</code> disables the rest
        once that many are picked, and <code>clearable</code> adds a button that clears them all. Controlled here with{' '}
        <code>value</code> and <code>onChange</code>, which gets the new array and its items.
      </p>
      <Example component={Options} code={optionsCode} />

      <H2 id="states">Sections, variants and states</H2>
      <p>
        The box is a PillsInput's: <code>variant</code>, <code>size</code> (the pills follow it), <code>leftSection</code>, and{' '}
        <code>rightSection</code>, which replaces the chevron. It grows as the pills wrap, and the dropdown follows. The label,
        description and error work as on TextInput. <code>readOnly</code> hides the remove buttons and <code>disabled</code>{' '}
        disables them; both keep it closed. <code>name</code> submits every value with a form, through a hidden input each.
      </p>
      <Example component={States} code={statesCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>class</code> and <code>style</code> go to the root, with the label and texts; other props, such as{' '}
        <code>aria-label</code> or <code>onBlur</code>, go to the field. Plus <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>required</code>, <code>withAsterisk</code>, <code>size</code> and{' '}
        <code>id</code>, as on TextInput.
      </p>
      <PropsTable
        rows={[
          { name: 'data', type: 'MultiSelectData', description: 'The options: strings, items and groups. Required.' },
          { name: 'value', type: 'string[]', description: 'The selected values, when controlled.' },
          { name: 'defaultValue', type: 'string[]', default: '[]', description: 'The values it starts with.' },
          {
            name: 'onChange',
            type: '(value: string[], items: MultiSelectItem[]) => void',
            description: 'Called when the selection changes.',
          },
          { name: 'placeholder', type: 'string', description: 'Shown while nothing is selected.' },
          { name: 'maxValues', type: 'number', description: 'At most this many values.' },
          {
            name: 'hidePickedOptions',
            type: 'boolean',
            default: 'false',
            description: 'Leaves the selected options out of the list.',
          },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'A button that clears the selection.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's name." },
          {
            name: 'removeLabel',
            type: 'string',
            default: "'Remove'",
            description: "The first word of each pill's remove button's name.",
          },
          {
            name: 'nothingFoundMessage',
            type: 'string',
            default: "'Nothing found'",
            description: 'Shown when no option matches the search.',
          },
          { name: 'name', type: 'string', description: 'Submits the values with a form.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the values without letting them change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field and the pills.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the pills.' },
          { name: 'rightSection', type: 'JSX.Element', default: 'a chevron', description: 'Content after the field.' },
          {
            name: 'comboboxProps',
            type: '{ position, offset, matchTargetWidth, transition, transitionDuration }',
            description: "The dropdown's position and animation.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-multi-select</code> and <code>.slp-input-wrapper</code>; the box is a PillsInput's (
        <code>[data-slot="pills-input-box"]</code>, also <code>.slp-input</code>, with <code>data-read-only</code> when read
        only), the pills are <code>.slp-pill</code>s and the dropdown a Combobox's. Inside are{' '}
        <code>[data-slot="multi-select-pill"]</code>, <code>[data-slot="multi-select-chevron"]</code>,{' '}
        <code>[data-slot="multi-select-clear"]</code>, <code>[data-slot="multi-select-option-check"]</code> and{' '}
        <code>[data-slot="multi-select-option-label"]</code>. <code>--slp-pill-color</code> on the root colors the pills. The
        rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
