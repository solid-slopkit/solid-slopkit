import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/indicator/basic';
import basicCode from '../../examples/components/indicator/basic.tsx?raw';
import Positions from '../../examples/components/indicator/positions';
import positionsCode from '../../examples/components/indicator/positions.tsx?raw';
import AvatarStatus from '../../examples/components/indicator/avatar';
import avatarCode from '../../examples/components/indicator/avatar.tsx?raw';

export default function IndicatorPage() {
  return (
    <article class="docs-page">
      <Title>Indicator · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Indicator</h1>
      <p class="docs-lead">
        Pins a dot or a small label to a corner or edge of its child. A <code>span</code> around the child.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Indicator } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Without <code>label</code> the mark is a dot; with one, a pill. <code>disabled</code> hides it. The mark is hidden from
        assistive technology, so put what it means in the child's accessible name, as the button below does.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="positions">Positions</H2>
      <p>
        Corners, edge centers and the middle of each side. <code>top-end</code> is the default.
      </p>
      <Example component={Positions} code={positionsCode} />

      <H2 id="avatars">On round children</H2>
      <p>
        <code>offset</code> moves the mark toward the center, in px, so it sits on a round child's edge. <code>processing</code>{' '}
        animates a ping, which stays still when the user asks for reduced motion.
      </p>
      <Example component={AvatarStatus} code={avatarCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>span</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'position',
            type: "'top-start' | 'top-center' | 'top-end' | 'middle-start' | 'middle-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'",
            default: "'top-end'",
            description: 'Where the mark sits on the child.',
          },
          { name: 'label', type: 'JSX.Element', description: 'Content of the mark. A dot without one.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color role of the mark.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the mark.' },
          { name: 'offset', type: 'number', default: '0', description: 'Moves the mark toward the center, in px.' },
          { name: 'processing', type: 'boolean', default: 'false', description: 'Animates a ping around the mark.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Hides the mark.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-indicator</code>. The mark is the <code>indicator-mark</code> slot, with{' '}
        <code>data-position</code>, <code>data-color</code>, <code>data-size</code>, <code>data-with-label</code> and{' '}
        <code>data-processing</code>. Its ring is a <code>box-shadow</code> in the surface color. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-indicator-color',
            default: 'var(--slp-color-<color>)',
            description: "Mark color. For a color that isn't a role.",
          },
          {
            name: '--slp-indicator-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Label color on the mark.',
          },
        ]}
      />
    </article>
  );
}
