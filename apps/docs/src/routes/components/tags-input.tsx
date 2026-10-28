import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/tags-input/basic';
import basicCode from '../../examples/components/tags-input/basic.tsx?raw';
import Suggestions from '../../examples/components/tags-input/suggestions';
import suggestionsCode from '../../examples/components/tags-input/suggestions.tsx?raw';
import States from '../../examples/components/tags-input/states';
import statesCode from '../../examples/components/tags-input/states.tsx?raw';

export default function TagsInputPage() {
  return (
    <article class="docs-page">
      <Title>TagsInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>TagsInput</h1>
      <p class="docs-lead">
        A labelled field of free-text tags, shown as pills: Enter or a comma adds what's typed, and suggestions can be offered
        while typing.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { TagsInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is an array of tags. Enter adds what's typed, trimmed, without submitting the form; with nothing typed, Enter
        submits it as usual. A comma also adds what's before it, so a pasted list becomes several tags, and leaving the field adds
        what's left in it. Each tag has a button that removes it, and Backspace in the empty field removes the last one. A tag
        that's already there isn't added again.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="suggestions">Suggestions, limits and duplicates</H2>
      <p>
        <code>data</code> offers suggestions: strings, items with a <code>value</code> and <code>disabled</code>, or groups under
        a heading. Those that contain what's typed, without the tags already added, show in a dropdown. Typing never picks one, so
        Enter still adds what you typed; the arrows move to a suggestion, and Enter or a click adds it. <code>maxTags</code> stops
        adding once reached, <code>onDuplicate</code> says when a tag was already there (or <code>allowDuplicates</code> adds it
        again), and <code>clearable</code> adds a button that removes them all.
      </p>
      <Example component={Suggestions} code={suggestionsCode} />

      <H2 id="states">Separators, sections and states</H2>
      <p>
        <code>splitChars</code> sets which characters end a tag, <code>[',']</code> by default. The box is a PillsInput's:{' '}
        <code>variant</code>, <code>size</code> (the pills follow it), <code>leftSection</code> and <code>rightSection</code>. It
        grows as the tags wrap. The label, description and error work as on TextInput. <code>readOnly</code> hides the remove
        buttons and <code>disabled</code> disables them. <code>name</code> submits every tag with a form, through a hidden input
        each.
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
          { name: 'value', type: 'string[]', description: 'The tags, when controlled.' },
          { name: 'defaultValue', type: 'string[]', default: '[]', description: 'The tags it starts with.' },
          { name: 'onChange', type: '(value: string[]) => void', description: 'Called when a tag is added or removed.' },
          { name: 'data', type: 'TagsInputData', description: 'Suggestions offered while typing.' },
          { name: 'placeholder', type: 'string', description: 'Shown while there are no tags.' },
          { name: 'maxTags', type: 'number', description: 'At most this many tags.' },
          { name: 'allowDuplicates', type: 'boolean', default: 'false', description: 'Lets the same tag be added again.' },
          { name: 'onDuplicate', type: '(value: string) => void', description: "Called with a tag that's already there." },
          {
            name: 'splitChars',
            type: 'string[]',
            default: "[',']",
            description: "Characters that end a tag as they're typed.",
          },
          {
            name: 'acceptValueOnBlur',
            type: 'boolean',
            default: 'true',
            description: "Adds what's typed when the field loses focus.",
          },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'A button that removes every tag.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's name." },
          {
            name: 'removeLabel',
            type: 'string',
            default: "'Remove'",
            description: "The first word of each pill's remove button's name.",
          },
          { name: 'name', type: 'string', description: 'Submits the tags with a form.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the tags without letting them change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field and the pills.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the tags.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the field.' },
          {
            name: 'comboboxProps',
            type: '{ position, offset, matchTargetWidth, transition, transitionDuration }',
            description: "The dropdown's position and animation.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-tags-input</code> and <code>.slp-input-wrapper</code>; the box is a PillsInput's (
        <code>[data-slot="pills-input-box"]</code>, also <code>.slp-input</code>, with <code>data-read-only</code> when read
        only), the tags are <code>.slp-pill</code>s and the dropdown a Combobox's. Inside are{' '}
        <code>[data-slot="tags-input-pill"]</code> and <code>[data-slot="tags-input-clear"]</code>. <code>--slp-pill-color</code>{' '}
        on the root colors the tags. The rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
