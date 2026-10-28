import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Basic from '../../examples/components/month-picker-input/basic';
import basicCode from '../../examples/components/month-picker-input/basic.tsx?raw';
import Range from '../../examples/components/month-picker-input/range';
import rangeCode from '../../examples/components/month-picker-input/range.tsx?raw';
import { withBase } from '../../base';

export default function MonthPickerInputPage() {
  return (
    <article class="docs-page">
      <Title>MonthPickerInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>MonthPickerInput</h1>
      <p class="docs-lead">A labelled field for a month, several months or a range, chosen in a calendar of months.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { MonthPickerInput } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        It works as <a href={withBase('/components/date-picker-input')}>DatePickerInput</a> does, with a{' '}
        <a href={withBase('/components/month-picker')}>MonthPicker</a> in the dropdown. A month is the <code>Date</code> of its
        first day, written as "October 2026" by default; <code>valueFormat</code> takes other <code>Intl.DateTimeFormat</code>{' '}
        options.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="range">A range</H2>
      <p>
        With <code>type="range"</code> it closes once the range has its end. <code>name</code> submits ISO months, here{' '}
        <code>2026-06,2026-08</code>.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="props">Props</H2>
      <p>
        The <a href={withBase('/components/month-picker#props')}>MonthPicker's props</a> go to the calendar, and the field takes{' '}
        <a href={withBase('/components/date-picker-input#props')}>DatePickerInput's field props</a>. <code>valueFormat</code>{' '}
        defaults to <code>{"{ month: 'long', year: 'numeric' }"}</code>.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        As DatePickerInput's, with <code>month-picker-input</code> for <code>date-picker-input</code>: the root{' '}
        <code>.slp-month-picker-input</code>, the slots <code>month-picker-input-value</code> and{' '}
        <code>month-picker-input-clear</code>, and the dropdown <code>.slp-month-picker-input-dropdown</code>.
      </p>
    </article>
  );
}
