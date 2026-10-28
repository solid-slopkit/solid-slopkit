import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/burger/basic';
import basicCode from '../../examples/components/burger/basic.tsx?raw';
import Controlled from '../../examples/components/burger/controlled';
import controlledCode from '../../examples/components/burger/controlled.tsx?raw';
import Sizes from '../../examples/components/burger/sizes';
import sizesCode from '../../examples/components/burger/sizes.tsx?raw';
import { withBase } from '../../base';

export default function BurgerPage() {
  return (
    <article class="docs-page">
      <Title>Burger · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Burger</h1>
      <p class="docs-lead">
        A button with three lines that turn into an X while what it toggles, usually the navigation, is open.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Burger } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Uncontrolled, it toggles itself, starting at <code>defaultOpened</code>. It's named “Navigation” by default; pass{' '}
        <code>label</code> to say what it opens. The state is <code>aria-expanded</code>, so the name stays the same and screen
        readers say “expanded” or “collapsed”.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        With <code>opened</code>, it shows your state, and <code>onChange</code> gets the new one on each press. Showing and
        hiding what it opens is up to you; point <code>aria-controls</code> at it.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="sizes">Sizes and variants</H2>
      <p>
        An <a href={withBase('/components/action-icon')}>ActionIcon</a>, <code>ghost</code> by default, with <code>variant</code>,{' '}
        <code>color</code> and <code>size</code>. The lines are in the current text color and grow with the size.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>aria-controls</code>, are passed to the <code>button</code>. <code>onClick</code> runs first,
        and <code>event.preventDefault()</code> in it skips the toggle.
      </p>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: "Whether it's open, for a controlled burger." },
          { name: 'defaultOpened', type: 'boolean', default: 'false', description: 'Whether it starts open, uncontrolled.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: "Called with the new state when it's pressed." },
          { name: 'label', type: 'string', default: "'Navigation'", description: 'Accessible name: what it opens.' },
          {
            name: 'variant',
            type: "'ghost' | 'solid' | 'soft' | 'outline' | 'dash'",
            default: "'ghost'",
            description: 'Visual style.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role. The text color when omitted.',
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: 'Size of the button and the lines.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-burger</code>, <code>.slp-action-icon</code> and <code>.slp-button</code>, with{' '}
        <code>data-opened</code> while open, and Button's attributes. The slot <code>burger-lines</code> is the middle line; the
        outer two are its <code>::before</code> and <code>::after</code>. Its rules live in <code>@layer slopkit.components</code>
        , so unlayered CSS wins.
      </p>
    </article>
  );
}
