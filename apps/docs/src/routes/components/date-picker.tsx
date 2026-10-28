import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/date-picker/basic';
import basicCode from '../../examples/components/date-picker/basic.tsx?raw';
import Multiple from '../../examples/components/date-picker/multiple';
import multipleCode from '../../examples/components/date-picker/multiple.tsx?raw';
import Range from '../../examples/components/date-picker/range';
import rangeCode from '../../examples/components/date-picker/range.tsx?raw';
import { withBase } from '../../base';

export default function DatePickerPage() {
  return (
    <article class="docs-page">
      <Title>DatePicker · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>DatePicker</h1>
      <p class="docs-lead">A calendar to choose days with: one day, several, or a range from one day to another.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { DatePicker } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A <a href={withBase('/components/calendar')}>Calendar</a> with a value, so every Calendar prop works: levels, limits,
        columns, the locale and the keyboard. <code>value</code> and <code>onChange</code> hold the chosen day, a{' '}
        <code>Date</code> at local midnight or <code>null</code>. A click on the chosen day keeps it; with{' '}
        <code>allowDeselect</code> it clears it. It opens on the month of the chosen day.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several days</H2>
      <p>
        With <code>type="multiple"</code> the value is an array: a click adds a day, or takes it away.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="range">A range</H2>
      <p>
        With <code>type="range"</code> the value is <code>[start, end]</code>. The first click sets the start and the second the
        end, in either order; a third starts again. Between them, the range is previewed up to the day under the pointer or the
        focus. A second click on the start clears it, or makes a one-day range with <code>allowSingleDateInRange</code>.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/calendar#props')}>Calendar's props</a>, except <code>minLevel</code>, plus these.
        Chosen days are added to what <code>getDayProps</code> returns, and <code>onDayClick</code> is still called.
      </p>
      <PropsTable
        rows={[
          {
            name: 'type',
            type: "'default' | 'multiple' | 'range'",
            default: "'default'",
            description: 'What it chooses. Read once.',
          },
          { name: 'value', type: 'DatePickerValue<Type>', description: 'The chosen days, when controlled.' },
          {
            name: 'defaultValue',
            type: 'DatePickerValue<Type>',
            default: 'empty',
            description: 'The days chosen first, when uncontrolled.',
          },
          { name: 'onChange', type: '(value: DatePickerValue<Type>) => void', description: 'Called with the new value.' },
          { name: 'allowDeselect', type: 'boolean', default: 'false', description: 'A click on the chosen day clears it.' },
          {
            name: 'allowSingleDateInRange',
            type: 'boolean',
            default: 'false',
            description: 'A range may start and end on one day.',
          },
        ]}
      />
      <p>
        <code>DatePickerValue</code> is <code>Date | null</code>, <code>Date[]</code> or <code>[Date | null, Date | null]</code>{' '}
        for each type.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The root is the Calendar's <code>.slp-calendar</code>, with the <code>.slp-date-picker</code> class and{' '}
        <code>data-type</code>; see the <a href={withBase('/components/calendar#styling')}>Calendar's slots</a>. Chosen days have{' '}
        <code>data-selected</code>, and a range's days <code>data-in-range</code>, <code>data-first-in-range</code> and{' '}
        <code>data-last-in-range</code>.
      </p>
    </article>
  );
}
