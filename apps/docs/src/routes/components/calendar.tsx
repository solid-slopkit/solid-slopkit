import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/calendar/basic';
import basicCode from '../../examples/components/calendar/basic.tsx?raw';
import Limits from '../../examples/components/calendar/limits';
import limitsCode from '../../examples/components/calendar/limits.tsx?raw';
import Range from '../../examples/components/calendar/range';
import rangeCode from '../../examples/components/calendar/range.tsx?raw';
import Levels from '../../examples/components/calendar/levels';
import levelsCode from '../../examples/components/calendar/levels.tsx?raw';
import Options from '../../examples/components/calendar/options';
import optionsCode from '../../examples/components/calendar/options.tsx?raw';

export default function CalendarPage() {
  return (
    <article class="docs-page">
      <Title>Calendar · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Calendar</h1>
      <p class="docs-lead">
        The days of a month, the months of a year, or the years of a decade, in grids you move through with the keyboard.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Calendar } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A calendar has no value of its own: <code>getDayProps</code> marks the selected days and <code>onDayClick</code> chooses
        them. Days are <code>Date</code>s at local midnight. One day takes Tab; the arrow keys move a day or a week, Home and End
        to the ends of the week, Page Up and Page Down a month (with Shift, a year), crossing into the neighboring months. Today
        is marked once the page is hydrated, since the browser's day may differ from the server's.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="limits">Limits</H2>
      <p>
        Days before <code>minDate</code>, after <code>maxDate</code>, or for which <code>excludeDate</code> is true are disabled,
        and the keyboard skips them. Previous and next stop at the limits, keeping the focus.
      </p>
      <Example component={Limits} code={limitsCode} />

      <H2 id="ranges">Ranges and columns</H2>
      <p>
        <code>getDayProps</code> can also mark a range: <code>inRange</code> tints it, and <code>firstInRange</code> and{' '}
        <code>lastInRange</code> fill its ends. <code>numberOfColumns</code> shows months side by side, wrapping when they don't
        fit; the neighboring months' days are then left out.
      </p>
      <Example component={Range} code={rangeCode} />

      <H2 id="levels">Levels</H2>
      <p>
        The name in the header goes up a level, to the months of the year and then the years of the decade; choosing a month or a
        year comes back down. <code>minLevel</code> and <code>maxLevel</code> bound it, so <code>minLevel="year"</code> makes a
        month picker, with <code>getMonthProps</code> and <code>onMonthClick</code>.
      </p>
      <Example component={Levels} code={levelsCode} />

      <H2 id="options">Locale, weeks and content</H2>
      <p>
        Names and the first day of the week follow the provider's locale, or the <code>locale</code> prop;{' '}
        <code>firstDayOfWeek</code> and <code>weekendDays</code> override it. <code>hideOutsideDates</code> leaves the neighboring
        months' days out, <code>fixedWeeks={'{false}'}</code> shows only the month's weeks, and <code>renderDay</code> replaces a
        day's number.
      </p>
      <Example component={Options} code={optionsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the root <code>div</code>. <code>CalendarCellState</code> is{' '}
        <code>{'{ selected?, inRange?, firstInRange?, lastInRange?, disabled? }'}</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'date', type: 'Date', description: 'A date in the month shown, when controlled.' },
          { name: 'defaultDate', type: 'Date', default: 'today', description: 'The month shown first.' },
          { name: 'onDateChange', type: '(date: Date) => void', description: 'Called with the first day of the new period.' },
          { name: 'level', type: "'month' | 'year' | 'decade'", description: 'What it shows, when controlled.' },
          { name: 'defaultLevel', type: "'month' | 'year' | 'decade'", default: 'minLevel', description: 'What it shows first.' },
          { name: 'onLevelChange', type: '(level) => void', description: 'Called when the level changes.' },
          { name: 'minLevel', type: "'month' | 'year' | 'decade'", default: "'month'", description: 'The lowest level.' },
          { name: 'maxLevel', type: "'month' | 'year' | 'decade'", default: "'decade'", description: 'The highest level.' },
          { name: 'numberOfColumns', type: 'number', default: '1', description: 'Periods side by side.' },
          { name: 'minDate', type: 'Date', description: 'The earliest day that can be chosen.' },
          { name: 'maxDate', type: 'Date', description: 'The latest day that can be chosen.' },
          { name: 'excludeDate', type: '(date: Date) => boolean', description: "Days that can't be chosen." },
          { name: 'getDayProps', type: '(date: Date) => CalendarCellState', description: 'Marks a day.' },
          { name: 'getMonthProps', type: '(date: Date) => CalendarCellState', description: 'Marks a month.' },
          { name: 'getYearProps', type: '(date: Date) => CalendarCellState', description: 'Marks a year.' },
          { name: 'onDayClick', type: '(date: Date, event: MouseEvent) => void', description: 'A day was chosen.' },
          { name: 'onMonthClick', type: '(date: Date, event: MouseEvent) => void', description: 'A month was chosen.' },
          { name: 'onYearClick', type: '(date: Date, event: MouseEvent) => void', description: 'A year was chosen.' },
          { name: 'renderDay', type: '(date: Date) => JSX.Element', description: "A day's content." },
          { name: 'firstDayOfWeek', type: '0 … 6', default: "the locale's", description: 'The day weeks start on; 0 is Sunday.' },
          { name: 'weekendDays', type: '(0 … 6)[]', default: "the locale's", description: 'The days marked as weekend.' },
          { name: 'fixedWeeks', type: 'boolean', default: 'true', description: 'Always six weeks.' },
          {
            name: 'hideOutsideDates',
            type: 'boolean',
            default: 'false',
            description: "Leaves the neighboring months' days out.",
          },
          { name: 'hideWeekdays', type: 'boolean', default: 'false', description: 'Leaves the weekday names out.' },
          {
            name: 'weekdayFormat',
            type: "'short' | 'narrow'",
            default: "'short'",
            description: 'How weekday names are written.',
          },
          { name: 'locale', type: 'string', default: "the provider's", description: 'A locale for this calendar.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: 'The color role of selected cells.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "The cells' size." },
          {
            name: 'previousLabel',
            type: '(level) => string',
            default: "'Previous month'",
            description: "The previous button's name.",
          },
          { name: 'nextLabel', type: '(level) => string', default: "'Next month'", description: "The next button's name." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-calendar</code>, with <code>data-level</code>, <code>data-size</code> and <code>data-color</code>.
        Each period is a <code>[data-slot="calendar-column"]</code> holding <code>calendar-header</code> (with{' '}
        <code>calendar-previous</code>, <code>calendar-level</code> and <code>calendar-next</code>) and <code>calendar-grid</code>
        , whose cells are <code>calendar-weekday</code>, <code>calendar-day</code>, <code>calendar-month</code> or{' '}
        <code>calendar-year</code>. A previous, next or level button has <code>data-disabled</code> when it goes nowhere. A cell
        has <code>data-date</code> (<code>2026-10-15</code>, <code>2026-10</code> or <code>2026</code>), and{' '}
        <code>data-outside</code>, <code>data-weekend</code>, <code>data-today</code>, <code>data-selected</code>,{' '}
        <code>data-in-range</code>, <code>data-first-in-range</code>, <code>data-last-in-range</code> and{' '}
        <code>data-disabled</code> as they apply. <code>--slp-calendar-color</code>, <code>--slp-calendar-content</code> and{' '}
        <code>--slp-calendar-radius</code> set the selected cells' colors and the corners. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
