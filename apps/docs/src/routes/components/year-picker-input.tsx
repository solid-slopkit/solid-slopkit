import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Basic from '../../examples/components/year-picker-input/basic';
import basicCode from '../../examples/components/year-picker-input/basic.tsx?raw';
import Range from '../../examples/components/year-picker-input/range';
import rangeCode from '../../examples/components/year-picker-input/range.tsx?raw';
import { withBase } from '../../base';

export default function YearPickerInputPage() {
  return (
    <article class="docs-page">
      <Title>YearPickerInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>YearPickerInput</h1>
      <p class="docs-lead">A labelled field for a year, several years or a range, chosen in a calendar of years.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { YearPickerInput } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        It works as <a href={withBase('/components/date-picker-input')}>DatePickerInput</a> does, with a{' '}
        <a href={withBase('/components/year-picker')}>YearPicker</a> in the dropdown. A year is the <code>Date</code> of its
        January 1, written as "2026" by default; <code>valueFormat</code> takes other <code>Intl.DateTimeFormat</code> options.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="range">A range</H2>
      <p>
        With <code>type="range"</code> it closes once the range has its end. <code>name</code> submits ISO years, here{' '}
        <code>2022,2026</code>.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/year-picker#props')}>YearPicker's props</a> go to the calendar, and the field takes{' '}
        <a href={withBase('/components/date-picker-input#props')}>DatePickerInput's field props</a>. <code>valueFormat</code>{' '}
        defaults to <code>{"{ year: 'numeric' }"}</code>.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        As DatePickerInput's, with <code>year-picker-input</code> for <code>date-picker-input</code>: the root{' '}
        <code>.slp-year-picker-input</code>, the slots <code>year-picker-input-value</code> and{' '}
        <code>year-picker-input-clear</code>, and the dropdown <code>.slp-year-picker-input-dropdown</code>.
      </p>
    </article>
  );
}
