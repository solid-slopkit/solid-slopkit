import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/floating-indicator/basic';
import basicCode from '../../examples/components/floating-indicator/basic.tsx?raw';
import Grid from '../../examples/components/floating-indicator/grid';
import gridCode from '../../examples/components/floating-indicator/grid.tsx?raw';

export default function FloatingIndicatorPage() {
  return (
    <article class="docs-page">
      <Title>FloatingIndicator · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>FloatingIndicator</h1>
      <p class="docs-lead">
        A box that covers one element of a group and glides to another when the target changes, such as the active tab or the
        selected option.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { FloatingIndicator } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Render it inside <code>parent</code>, which needs <code>position: relative</code>, before the targets, and give the
        targets <code>position: relative</code> so they paint over it. It covers <code>target</code> exactly, borders, padding and
        scroll of the parent included, and glides to the next one in 200ms. The first placement jumps, so it doesn't slide in from
        the corner. Keep the targets in signals: the indicator is created before them, so a plain array read then is still empty.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="no-target">Following the pointer</H2>
      <p>
        It moves in both directions, and hides without a target; the next one it jumps to. Here it follows the pointer over a
        grid. It's placed again whenever the target, the parent or a sibling changes size, and when the parent scrolls.
      </p>
      <Example component={Grid} code={gridCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        It's decoration: <code>aria-hidden</code>, and the pointer goes through it. Mark the state on the targets themselves, with{' '}
        <code>aria-pressed</code>, <code>aria-selected</code> or <code>aria-current</code>. Under{' '}
        <code>prefers-reduced-motion: reduce</code> it jumps instead of gliding.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'target', type: 'HTMLElement | null', description: 'The element it covers. Hidden without one.' },
          {
            name: 'parent',
            type: 'HTMLElement | null',
            description: "The element it's positioned in, with position: relative.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        It has the class <code>.slp-floating-indicator</code>, with <code>data-hidden</code> without a target and{' '}
        <code>data-placed</code> once placed, when the transition applies. By default it's the base surface color with a small
        shadow and a 0.5rem radius; restyle it with <code>class</code>, and retime it with a selector:
      </p>
      <CodeBlock code={`.slp-floating-indicator[data-placed] {\n  transition-duration: 300ms;\n}`} />
      <p>
        The rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
