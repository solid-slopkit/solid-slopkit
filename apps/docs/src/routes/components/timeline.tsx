import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/timeline/basic';
import basicCode from '../../examples/components/timeline/basic.tsx?raw';
import Steps from '../../examples/components/timeline/steps';
import stepsCode from '../../examples/components/timeline/steps.tsx?raw';
import Plain from '../../examples/components/timeline/plain';
import plainCode from '../../examples/components/timeline/plain.tsx?raw';

export default function TimelinePage() {
  return (
    <article class="docs-page">
      <Title>Timeline · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Timeline</h1>
      <p class="docs-lead">
        A sequence of events in order: an <code>ol</code> of <code>Timeline.Item</code>, joined by a line.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Timeline } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Each item has a <code>title</code>, a description as its children, and a bullet on the line. <code>bullet</code> puts an
        icon or a number in it. <code>active</code> marks an event as reached: its bullet fills, and the line to the next active
        item takes the color.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="steps">Steps</H2>
      <p>
        <code>active</code> is set per item, so it follows any state you have. <code>color</code> on the Timeline takes a color
        role.
      </p>
      <Example component={Steps} code={stepsCode} />

      <H2 id="plain">Without bullets</H2>
      <p>
        Without <code>bullet</code>, each bullet is a plain circle.
      </p>
      <Example component={Plain} code={plainCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        The events are an ordered list. Bullets are hidden from assistive technology, so the title should say what each event is;
        if it matters which are done, say it in the text too.
      </p>

      <H2 id="timeline-props">Timeline props</H2>
      <p>
        Other props are passed to the <code>ol</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color role of active bullets and their line.',
          },
        ]}
      />

      <H2 id="timeline-item-props">Timeline.Item props</H2>
      <p>
        Other props are passed to the <code>li</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'title', type: 'JSX.Element', description: "The event's heading." },
          { name: 'bullet', type: 'JSX.Element', description: 'Content of the bullet, such as an icon or a number.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Marks the event as reached.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The list has the class <code>.slp-timeline</code> and <code>data-color</code>; each item has{' '}
        <code>.slp-timeline-item</code>, with <code>data-active</code> and <code>data-with-bullet</code>. Its slots are{' '}
        <code>timeline-item-bullet</code>, <code>timeline-item-content</code>, <code>timeline-item-title</code> and{' '}
        <code>timeline-item-body</code>. The line is each item's <code>::before</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-timeline-color',
            default: 'var(--slp-color-<color>)',
            description: "Active color. For a color that isn't a role.",
          },
          {
            name: '--slp-timeline-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Icon color in an active bullet.',
          },
        ]}
      />
    </article>
  );
}
