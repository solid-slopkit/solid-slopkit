import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/mini-calendar/basic';
import basicCode from '../../examples/components/mini-calendar/basic.tsx?raw';
import Options from '../../examples/components/mini-calendar/options';
import optionsCode from '../../examples/components/mini-calendar/options.tsx?raw';

export default function MiniCalendarPage() {
  return (
    <article class="docs-page">
      <Title>MiniCalendar · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>MiniCalendar</h1>
      <p class="docs-lead">A strip of days to choose one from, for the day of a schedule or a booking.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { MiniCalendar } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>value</code> and <code>onChange</code> hold the chosen day, a <code>Date</code> at local midnight. Previous and next
        move the strip by its length. One day takes Tab; Left and Right move the focus, past the ends of the strip, and Enter,
        Space or a click chooses. It's a listbox named after the days it shows, and a new set of days is announced.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="options">Length, limits and sizes</H2>
      <p>
        <code>numberOfDays</code> sets how many days show (default 7). Days before <code>minDate</code>, after{' '}
        <code>maxDate</code>, or for which <code>excludeDate</code> is true are disabled and skipped by the keyboard, and previous
        and next stop at the limits. Names follow the provider's locale, or <code>locale</code>; <code>size</code> goes from{' '}
        <code>xs</code> to <code>xl</code>, and <code>color</code> fills the chosen day.
      </p>
      <Example component={Options} code={optionsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the root <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'Date | null', description: 'The chosen day, when controlled.' },
          { name: 'defaultValue', type: 'Date | null', description: 'The day chosen first, when uncontrolled.' },
          { name: 'onChange', type: '(date: Date) => void', description: 'Called when another day is chosen.' },
          { name: 'date', type: 'Date', description: 'The first day shown, when controlled.' },
          { name: 'defaultDate', type: 'Date', default: 'the value, else today', description: 'The first day shown first.' },
          { name: 'onDateChange', type: '(date: Date) => void', description: 'Called with the new first day.' },
          { name: 'numberOfDays', type: 'number', default: '7', description: 'How many days show.' },
          { name: 'minDate', type: 'Date', description: 'The earliest day that can be chosen.' },
          { name: 'maxDate', type: 'Date', description: 'The latest day that can be chosen.' },
          { name: 'excludeDate', type: '(date: Date) => boolean', description: "Days that can't be chosen." },
          { name: 'locale', type: 'string', default: "the provider's", description: 'A locale for this mini calendar.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The chosen day's color role." },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "The days' size." },
          { name: 'previousLabel', type: 'string', default: "'Previous days'", description: "The previous button's name." },
          { name: 'nextLabel', type: 'string', default: "'Next days'", description: "The next button's name." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-mini-calendar</code>, with <code>data-size</code> and <code>data-color</code>. Its parts are{' '}
        <code>[data-slot="mini-calendar-previous"]</code>, <code>mini-calendar-days</code> (the listbox),{' '}
        <code>mini-calendar-day</code> with <code>mini-calendar-weekday</code> and <code>mini-calendar-number</code> inside,{' '}
        <code>mini-calendar-next</code>, and the visually hidden <code>mini-calendar-range</code>. A day has{' '}
        <code>data-date</code> (<code>2026-10-15</code>), and <code>data-selected</code>, <code>data-today</code> and{' '}
        <code>data-disabled</code> as they apply; previous and next have <code>data-disabled</code> at a limit.{' '}
        <code>--slp-mini-calendar-color</code>, <code>--slp-mini-calendar-content</code> and{' '}
        <code>--slp-mini-calendar-radius</code> set the chosen day's colors and the corners. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
