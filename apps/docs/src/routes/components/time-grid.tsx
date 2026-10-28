import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/time-grid/basic';
import basicCode from '../../examples/components/time-grid/basic.tsx?raw';
import Columns from '../../examples/components/time-grid/columns';
import columnsCode from '../../examples/components/time-grid/columns.tsx?raw';

export default function TimeGridPage() {
  return (
    <article class="docs-page">
      <Title>TimeGrid · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>TimeGrid</h1>
      <p class="docs-lead">A grid of times to choose one from, such as the free slots of a booking.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { TimeGrid, getTimeRange } from '@solid-slopkit/components/dates';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>data</code> lists the times as <code>HH:mm</code>; <code>getTimeRange</code> makes them from a start, an end and an
        interval in minutes. Each shows as the locale writes it, and the value is the time as given. The grid has one tab stop:
        the arrow keys move between times, and Enter or Space chooses one.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="layout">Layout and limits</H2>
      <p>
        <code>columns</code> sets the times to a row, and <code>minTime</code>, <code>maxTime</code> and <code>disableTime</code>{' '}
        disable times, which the keys then skip. <code>format</code> overrides the locale's 12 or 24 hours.
      </p>
      <Example component={Columns} code={columnsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the root <code>div</code>; name the grid with <code>aria-label</code> or <code>aria-labelledby</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'data', type: 'string[]', description: 'The times, HH:mm or HH:mm:ss.' },
          { name: 'value', type: 'string | null', description: 'The chosen time, when controlled.' },
          { name: 'defaultValue', type: 'string | null', default: 'null', description: 'The time chosen at first.' },
          { name: 'onChange', type: '(value: string | null) => void', description: 'Called with the new time.' },
          { name: 'allowDeselect', type: 'boolean', default: 'false', description: 'A click on the chosen time clears it.' },
          { name: 'format', type: "'12h' | '24h'", default: "the locale's", description: '12 hours with a day period, or 24.' },
          { name: 'withSeconds', type: 'boolean', default: 'false', description: 'Shows the seconds.' },
          { name: 'minTime', type: 'string', description: 'Earlier times are disabled.' },
          { name: 'maxTime', type: 'string', description: 'Later times are disabled.' },
          { name: 'disableTime', type: 'string[] | ((time: string) => boolean)', description: 'Times that are disabled.' },
          { name: 'columns', type: 'number', default: '3', description: 'Times to a row.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every time.' },
          { name: 'locale', type: 'string', default: "the provider's", description: 'A locale for this grid.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: 'The color role of the chosen time.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "The times' size." },
        ]}
      />
      <p>
        <code>getTimeRange({'{ start, end, interval, withSeconds? }'})</code> returns the times from <code>start</code> to{' '}
        <code>end</code>, <code>interval</code> minutes apart.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-time-grid</code>, with <code>data-size</code>, <code>data-color</code> and{' '}
        <code>data-disabled</code>. Each time is the <code>time-grid-control</code> slot, with <code>data-time</code>,{' '}
        <code>data-selected</code> and <code>data-disabled</code>. <code>--slp-time-grid-color</code> and{' '}
        <code>--slp-time-grid-content</code> set the chosen time's colors.
      </p>
    </article>
  );
}
