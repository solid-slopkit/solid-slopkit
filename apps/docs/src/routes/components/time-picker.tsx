import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/time-picker/basic';
import basicCode from '../../examples/components/time-picker/basic.tsx?raw';
import Dropdown from '../../examples/components/time-picker/dropdown';
import dropdownCode from '../../examples/components/time-picker/dropdown.tsx?raw';
import Seconds from '../../examples/components/time-picker/seconds';
import secondsCode from '../../examples/components/time-picker/seconds.tsx?raw';
import { withBase } from '../../base';

export default function TimePickerPage() {
  return (
    <article class="docs-page">
      <Title>TimePicker · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>TimePicker</h1>
      <p class="docs-lead">A labelled field for a time of day, in the locale's 12 or 24 hours, typed part by part.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { TimePicker } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Each part of the time is a segment: type its digits and it moves on to the next, or step it with Up and Down. The value is{' '}
        <code>HH:mm</code> in 24 hours, whatever the field shows, and <code>''</code> until every part is filled. The locale sets
        12 or 24 hours; <code>format</code> overrides it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="dropdown">Dropdown</H2>
      <p>
        <code>withDropdown</code> adds a column of options per part, opened by a click on the field; the steps apply to the
        options and the keys. Leaving the field brings a time outside <code>minTime</code> and <code>maxTime</code> to the
        nearest.
      </p>
      <Example component={Dropdown} code={dropdownCode} />

      <H2 id="seconds">Seconds</H2>
      <p>
        <code>withSeconds</code> adds them, and the value becomes <code>HH:mm:ss</code>.
      </p>
      <Example component={Seconds} code={secondsCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>label</code>, <code>labelSection</code>, <code>description</code>, <code>error</code>, <code>required</code>,{' '}
        <code>withAsterisk</code>, <code>size</code> and <code>id</code> work as on{' '}
        <a href={withBase('/components/text-input')}>TextInput</a>, and other props go to the group of segments. Plus these:
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'The time, when controlled: HH:mm or HH:mm:ss.' },
          { name: 'defaultValue', type: 'string', default: "''", description: 'The time at first, when uncontrolled.' },
          { name: 'onChange', type: '(value: string) => void', description: "Called with the time, or ''." },
          { name: 'format', type: "'12h' | '24h'", default: "the locale's", description: '12 hours with a day period, or 24.' },
          { name: 'withSeconds', type: 'boolean', default: 'false', description: 'Adds the seconds.' },
          { name: 'minTime', type: 'string', description: 'The earliest time.' },
          { name: 'maxTime', type: 'string', description: 'The latest time.' },
          { name: 'hoursStep', type: 'number', default: '1', description: 'How far the keys and the dropdown step the hours.' },
          { name: 'minutesStep', type: 'number', default: '1', description: 'How far they step the minutes.' },
          { name: 'secondsStep', type: 'number', default: '1', description: 'How far they step the seconds.' },
          { name: 'withDropdown', type: 'boolean', default: 'false', description: 'Adds a dropdown of options.' },
          { name: 'clearable', type: 'boolean', default: 'false', description: 'Adds a button that clears the time.' },
          { name: 'clearLabel', type: 'string', default: "'Clear'", description: "The clear button's name." },
          { name: 'name', type: 'string', description: 'Submits the time through a hidden input.' },
          { name: 'locale', type: 'string', default: "the provider's", description: 'A locale for this field.' },
          {
            name: 'dayPeriodLabels',
            type: '[string, string]',
            default: "the locale's",
            description: 'The names of the morning and the afternoon.',
          },
          {
            name: 'segmentLabels',
            type: '{ hours?, minutes?, seconds?, dayPeriod? }',
            default: 'English',
            description: "The segments' names.",
          },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the time without letting it change.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
          { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: "The box's look." },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the time.' },
          {
            name: 'rightSection',
            type: 'JSX.Element',
            description: 'Content after the time; the clear button takes its place while it shows.',
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
        The root is <code>.slp-time-picker</code>, and the field box an <code>.slp-input</code> whose control is the group. The
        segments are the <code>time-picker-hours</code>, <code>time-picker-minutes</code>, <code>time-picker-seconds</code> and{' '}
        <code>time-picker-day-period</code> slots, with <code>data-empty</code>; the clear button <code>time-picker-clear</code>.
        The dropdown is <code>.slp-time-picker-dropdown</code>, with columns <code>time-picker-column</code> and options{' '}
        <code>time-picker-option</code>.
      </p>
    </article>
  );
}
