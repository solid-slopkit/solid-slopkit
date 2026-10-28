import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/year-picker/basic';
import basicCode from '../../examples/components/year-picker/basic.tsx?raw';
import Multiple from '../../examples/components/year-picker/multiple';
import multipleCode from '../../examples/components/year-picker/multiple.tsx?raw';
import Range from '../../examples/components/year-picker/range';
import rangeCode from '../../examples/components/year-picker/range.tsx?raw';
import { withBase } from '../../base';

export default function YearPickerPage() {
  return (
    <article class="docs-page">
      <Title>YearPicker · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>YearPicker</h1>
      <p class="docs-lead">A calendar to choose years with: one year, several, or a range from one year to another.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { YearPicker } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A <a href={withBase('/components/calendar')}>Calendar</a> fixed at the years of a decade, with a value. <code>value</code>{' '}
        and <code>onChange</code> hold the chosen year, the <code>Date</code> of its January 1 at local midnight, or{' '}
        <code>null</code>. A click on the chosen year keeps it; with <code>allowDeselect</code> it clears it. It opens on the
        decade of the chosen year, and previous and next move a decade.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several years</H2>
      <p>
        With <code>type="multiple"</code> the value is an array: a click adds a year, or takes it away.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="range">A range</H2>
      <p>
        With <code>type="range"</code> the value is <code>[start, end]</code>. The first click sets the start and the second the
        end, in either order; a third starts again. Between them, the range is previewed up to the year under the pointer or the
        focus. A second click on the start clears it, or makes a one-year range with <code>allowSingleDateInRange</code>. Here two
        decades show side by side.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/calendar#props')}>Calendar's props</a> for years (<code>date</code>,{' '}
        <code>defaultDate</code>, <code>onDateChange</code>, <code>numberOfColumns</code>, <code>minDate</code>,{' '}
        <code>maxDate</code>, <code>getYearProps</code>, <code>onYearClick</code>, <code>locale</code>, <code>color</code>,{' '}
        <code>size</code>, <code>previousLabel</code>, <code>nextLabel</code>), plus these. Chosen years are added to what{' '}
        <code>getYearProps</code> returns, and <code>onYearClick</code> is still called.
      </p>
      <PropsTable
        rows={[
          {
            name: 'type',
            type: "'default' | 'multiple' | 'range'",
            default: "'default'",
            description: 'What it chooses. Read once.',
          },
          { name: 'value', type: 'YearPickerValue<Type>', description: 'The chosen years, when controlled.' },
          {
            name: 'defaultValue',
            type: 'YearPickerValue<Type>',
            default: 'empty',
            description: 'The years chosen first, when uncontrolled.',
          },
          { name: 'onChange', type: '(value: YearPickerValue<Type>) => void', description: 'Called with the new value.' },
          { name: 'allowDeselect', type: 'boolean', default: 'false', description: 'A click on the chosen year clears it.' },
          {
            name: 'allowSingleDateInRange',
            type: 'boolean',
            default: 'false',
            description: 'A range may start and end in one year.',
          },
        ]}
      />
      <p>
        <code>YearPickerValue</code> is <code>Date | null</code>, <code>Date[]</code> or <code>[Date | null, Date | null]</code>{' '}
        for each type.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The root is the Calendar's <code>.slp-calendar</code>, with the <code>.slp-year-picker</code> class and{' '}
        <code>data-type</code>; see the <a href={withBase('/components/calendar#styling')}>Calendar's slots</a>. Years are the{' '}
        <code>calendar-year</code> slot with <code>data-date</code> (<code>2026</code>). Chosen years have{' '}
        <code>data-selected</code>, and a range's years <code>data-in-range</code>, <code>data-first-in-range</code> and{' '}
        <code>data-last-in-range</code>.
      </p>
    </article>
  );
}
