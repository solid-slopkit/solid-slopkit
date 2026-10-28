import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/date-picker-input/basic';
import basicCode from '../../examples/components/date-picker-input/basic.tsx?raw';
import Multiple from '../../examples/components/date-picker-input/multiple';
import multipleCode from '../../examples/components/date-picker-input/multiple.tsx?raw';
import Range from '../../examples/components/date-picker-input/range';
import rangeCode from '../../examples/components/date-picker-input/range.tsx?raw';
import { withBase } from '../../base';

export default function DatePickerInputPage() {
  return (
    <article class="docs-page">
      <Title>DatePickerInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>DatePickerInput</h1>
      <p class="docs-lead">A labelled field for a day, several days or a range, chosen in a calendar that opens under it.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { DatePickerInput } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The field is a button that shows the value, written in the locale, and opens a{' '}
        <a href={withBase('/components/date-picker')}>DatePicker</a> in a dropdown. The calendar takes the focus; choosing a day
        closes it and returns the focus to the field, and so does Escape; a press outside closes it too. <code>clearable</code>{' '}
        adds a button that empties it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several days</H2>
      <p>
        With <code>type="multiple"</code> the dropdown stays open while days are added or taken away. <code>valueFormat</code>{' '}
        takes <code>Intl.DateTimeFormat</code> options for how each day is written, and every DatePicker prop, such as{' '}
        <code>excludeDate</code>, goes to the calendar.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="range">A range</H2>
      <p>
        With <code>type="range"</code> it closes once the range has its end. <code>name</code> submits the days with a form as ISO
        days, here <code>2026-10-12,2026-10-16</code>.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/date-picker#props')}>DatePicker's props</a> go to the calendar, and <code>label</code>,{' '}
        <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>required</code>, <code>withAsterisk</code>,{' '}
        <code>size</code> and <code>id</code> work as on <a href={withBase('/components/text-input')}>TextInput</a>. Plus these:
      </p>
      <PropsTable
        rows={[
          { name: 'placeholder', type: 'string', description: 'Shown while nothing is chosen.' },
          {
            name: 'valueFormat',
            type: 'Intl.DateTimeFormatOptions',
            default: "{ dateStyle: 'medium' }",
            description: 'How a day is written in the field.',
          },
          { name: 'labelSeparator', type: 'string', default: "' – '", description: "Between a range's two days." },
          {
            name: 'closeOnChange',
            type: 'boolean',
            default: 'true',
            description: "Closes on a chosen day or a range's end.",
          },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'Adds a button that clears the value.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's name." },
          { name: 'name', type: 'string', description: 'Submits the ISO days through a hidden input.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the value without letting it change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the value.' },
          { name: 'rightSection', type: 'JSX.Element', description: "Content after the value, when there's no clear." },
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
        The root is <code>.slp-date-picker-input</code>, and the field box an <code>.slp-input</code> whose button has{' '}
        <code>data-empty</code> while nothing is chosen. The text is the <code>date-picker-input-value</code> slot (with{' '}
        <code>data-placeholder</code>), and the clear button <code>date-picker-input-clear</code>. The dropdown is{' '}
        <code>.slp-date-picker-input-dropdown</code>, with <code>data-placement</code>, <code>data-status</code> and{' '}
        <code>data-transition</code>, holding a <code>.slp-date-picker</code>.
      </p>
    </article>
  );
}
