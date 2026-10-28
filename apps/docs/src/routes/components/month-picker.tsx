import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/month-picker/basic';
import basicCode from '../../examples/components/month-picker/basic.tsx?raw';
import Multiple from '../../examples/components/month-picker/multiple';
import multipleCode from '../../examples/components/month-picker/multiple.tsx?raw';
import Range from '../../examples/components/month-picker/range';
import rangeCode from '../../examples/components/month-picker/range.tsx?raw';
import { withBase } from '../../base';

export default function MonthPickerPage() {
  return (
    <article class="docs-page">
      <Title>MonthPicker · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>MonthPicker</h1>
      <p class="docs-lead">A calendar to choose months with: one month, several, or a range from one month to another.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { MonthPicker } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A <a href={withBase('/components/calendar')}>Calendar</a> that starts at the months of a year, with the years of a decade
        above them, and a value. <code>value</code> and <code>onChange</code> hold the chosen month, the <code>Date</code> of its
        first day at local midnight, or <code>null</code>. A click on the chosen month keeps it; with <code>allowDeselect</code>{' '}
        it clears it. It opens on the year of the chosen month. The header's name of the year goes up to the decade, and a year
        goes back down to its months.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several months</H2>
      <p>
        With <code>type="multiple"</code> the value is an array: a click adds a month, or takes it away.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="range">A range</H2>
      <p>
        With <code>type="range"</code> the value is <code>[start, end]</code>. The first click sets the start and the second the
        end, in either order; a third starts again. Between them, the range is previewed up to the month under the pointer or the
        focus. A second click on the start clears it, or makes a one-month range with <code>allowSingleDateInRange</code>. Here
        two years show side by side, and <code>maxLevel="year"</code> keeps it on the months.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/calendar#props')}>Calendar's props</a> for months and years (<code>date</code>,{' '}
        <code>defaultDate</code>, <code>onDateChange</code>, <code>numberOfColumns</code>, <code>minDate</code>,{' '}
        <code>maxDate</code>, <code>getMonthProps</code>, <code>getYearProps</code>, <code>onMonthClick</code>,{' '}
        <code>onYearClick</code>, <code>locale</code>, <code>color</code>, <code>size</code>, <code>previousLabel</code>,{' '}
        <code>nextLabel</code>), plus these. Chosen months are added to what <code>getMonthProps</code> returns, and{' '}
        <code>onMonthClick</code> is still called.
      </p>
      <PropsTable
        rows={[
          {
            name: 'type',
            type: "'default' | 'multiple' | 'range'",
            default: "'default'",
            description: 'What it chooses. Read once.',
          },
          { name: 'value', type: 'MonthPickerValue<Type>', description: 'The chosen months, when controlled.' },
          {
            name: 'defaultValue',
            type: 'MonthPickerValue<Type>',
            default: 'empty',
            description: 'The months chosen first, when uncontrolled.',
          },
          { name: 'onChange', type: '(value: MonthPickerValue<Type>) => void', description: 'Called with the new value.' },
          { name: 'allowDeselect', type: 'boolean', default: 'false', description: 'A click on the chosen month clears it.' },
          {
            name: 'allowSingleDateInRange',
            type: 'boolean',
            default: 'false',
            description: 'A range may start and end in one month.',
          },
          { name: 'level', type: "'year' | 'decade'", description: 'What it shows, when controlled.' },
          { name: 'defaultLevel', type: "'year' | 'decade'", default: "'year'", description: 'What it shows first.' },
          { name: 'onLevelChange', type: '(level) => void', description: 'Called when the level changes.' },
          { name: 'maxLevel', type: "'year' | 'decade'", default: "'decade'", description: 'The highest level.' },
        ]}
      />
      <p>
        <code>MonthPickerValue</code> is <code>Date | null</code>, <code>Date[]</code> or <code>[Date | null, Date | null]</code>{' '}
        for each type.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The root is the Calendar's <code>.slp-calendar</code>, with the <code>.slp-month-picker</code> class and{' '}
        <code>data-type</code>; see the <a href={withBase('/components/calendar#styling')}>Calendar's slots</a>. Months are the{' '}
        <code>calendar-month</code> slot with <code>data-date</code> (<code>2026-10</code>). Chosen months have{' '}
        <code>data-selected</code>, and a range's months <code>data-in-range</code>, <code>data-first-in-range</code> and{' '}
        <code>data-last-in-range</code>.
      </p>
    </article>
  );
}
