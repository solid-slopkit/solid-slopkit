import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/date-input/basic';
import basicCode from '../../examples/components/date-input/basic.tsx?raw';
import Format from '../../examples/components/date-input/format';
import formatCode from '../../examples/components/date-input/format.tsx?raw';
import { withBase } from '../../base';

export default function DateInputPage() {
  return (
    <article class="docs-page">
      <Title>DateInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>DateInput</h1>
      <p class="docs-lead">A labelled text field for a day: type it, or choose it in a calendar under the field.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { DateInput } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Typed text that names a day sets it at once: an ISO day, or numbers in the locale's order (<code>10/15/2026</code> in
        English, <code>15.10.2026</code> in German). Leaving the field writes the day again, so text that isn't a day goes. A
        click or ArrowDown opens a <a href={withBase('/components/date-picker')}>DatePicker</a> on the day's month; the focus
        stays in the field, and Tab moves into the calendar.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="format">Format and limits</H2>
      <p>
        <code>valueFormat</code> sets how the day is written once the edit ends; the field still reads numbers. Days the calendar
        wouldn't allow, before <code>minDate</code> or excluded, aren't taken when typed either. <code>dateParser</code> replaces
        how text is read.
      </p>
      <Example component={Format} code={formatCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/date-picker#props')}>DatePicker's props</a> for one day go to the calendar, and{' '}
        <code>label</code>, <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>required</code>,{' '}
        <code>withAsterisk</code>, <code>size</code> and <code>id</code> work as on{' '}
        <a href={withBase('/components/text-input')}>TextInput</a>. Plus these:
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'Date | null', description: 'The day, when controlled.' },
          { name: 'defaultValue', type: 'Date | null', default: 'null', description: 'The day at first, when uncontrolled.' },
          { name: 'onChange', type: '(value: Date | null) => void', description: 'Called with the new day.' },
          {
            name: 'valueFormat',
            type: 'Intl.DateTimeFormatOptions',
            default: "{ year: 'numeric', month: '2-digit', day: '2-digit' }",
            description: 'How the day is written.',
          },
          {
            name: 'dateParser',
            type: '(text: string) => Date | null',
            default: 'parseDate in the locale',
            description: 'Reads a day from the text.',
          },
          { name: 'allowDeselect', type: 'boolean', default: 'false', description: 'Choosing the chosen day clears it.' },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'Adds a button that clears the day.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's name." },
          { name: 'name', type: 'string', description: 'Submits the ISO day through a hidden input.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the day without letting it change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the text.' },
          { name: 'rightSection', type: 'JSX.Element', description: "Content after the text, when there's no clear." },
          {
            name: 'position',
            type: 'FloatingPlacement',
            default: "'bottom-start'",
            description: 'Where the dropdown goes against the field.',
          },
          { name: 'offset', type: 'number', default: '4', description: 'Gap between the field and the dropdown, in px.' },
          { name: 'transition', type: 'TransitionName', default: "'fade'", description: "The dropdown's animation." },
          { name: 'transitionDuration', type: 'number', default: '150', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-date-input</code>, and the field box an <code>.slp-input</code>. The clear button is the{' '}
        <code>date-input-clear</code> slot. The dropdown is <code>.slp-date-input-dropdown</code>, with{' '}
        <code>data-placement</code>, <code>data-status</code> and <code>data-transition</code>, holding a{' '}
        <code>.slp-date-picker</code>.
      </p>
    </article>
  );
}
