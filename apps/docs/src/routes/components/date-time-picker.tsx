import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/date-time-picker/basic';
import basicCode from '../../examples/components/date-time-picker/basic.tsx?raw';
import Time from '../../examples/components/date-time-picker/time';
import timeCode from '../../examples/components/date-time-picker/time.tsx?raw';
import { withBase } from '../../base';

export default function DateTimePickerPage() {
  return (
    <article class="docs-page">
      <Title>DateTimePicker · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>DateTimePicker</h1>
      <p class="docs-lead">A labelled field for a date and time, chosen in a calendar and a time picker under it.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { DateTimePicker } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is a <code>Date</code> with its time of day. The dropdown holds a{' '}
        <a href={withBase('/components/date-picker')}>DatePicker</a>, a{' '}
        <a href={withBase('/components/time-picker')}>TimePicker</a> and a button that closes it. Changes apply at once: a chosen
        day keeps the time, and a chosen time keeps the day.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="time">The time</H2>
      <p>
        <code>timePickerProps</code> go to the time picker: here 24 hours, steps of 15 minutes, limits and its own dropdown.
        Calendar props such as <code>minDate</code> go to the calendar. <code>name</code> submits the local date and time,{' '}
        <code>2026-10-15T09:30</code>.
      </p>
      <Example component={Time} code={timeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/date-picker#props')}>DatePicker's props</a> for one day go to the calendar, and{' '}
        <code>label</code>, <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>required</code>,{' '}
        <code>withAsterisk</code>, <code>size</code> and <code>id</code> work as on{' '}
        <a href={withBase('/components/text-input')}>TextInput</a>. Other props go to the button. Plus these:
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'Date | null', description: 'The date and time, when controlled.' },
          { name: 'defaultValue', type: 'Date | null', default: 'null', description: 'The date and time at first.' },
          { name: 'onChange', type: '(value: Date | null) => void', description: 'Called with the new date and time.' },
          { name: 'placeholder', type: 'string', description: 'Shown while nothing is chosen.' },
          {
            name: 'valueFormat',
            type: 'Intl.DateTimeFormatOptions',
            default: "{ dateStyle: 'medium', timeStyle: 'short' }",
            description: 'How the value is written.',
          },
          { name: 'withSeconds', type: 'boolean', default: 'false', description: 'Adds the seconds.' },
          {
            name: 'timePickerProps',
            type: "Omit<TimePickerProps, 'value' | 'defaultValue' | 'onChange' | 'withSeconds'>",
            description: 'Props for the time picker.',
          },
          { name: 'timeLabel', type: 'string', default: "'Time'", description: "The time picker's label." },
          { name: 'submitLabel', type: 'string', default: "'Done'", description: 'The text of the button that closes it.' },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'Adds a button that clears the value.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's name." },
          { name: 'name', type: 'string', description: 'Submits the local date and time.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the value without letting it change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the value.' },
          {
            name: 'rightSection',
            type: 'JSX.Element',
            description: 'Content after the value; the clear button takes its place while it shows.',
          },
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
        The root is <code>.slp-date-time-picker</code>, and the field box an <code>.slp-input</code>. The text is the{' '}
        <code>date-time-picker-value</code> slot and the clear button <code>date-time-picker-clear</code>. The dropdown is{' '}
        <code>.slp-date-time-picker-dropdown</code>, holding a <code>.slp-date-picker</code>, the time picker (its root is{' '}
        <code>date-time-picker-time</code>) and the button (<code>date-time-picker-submit</code>).
      </p>
    </article>
  );
}
