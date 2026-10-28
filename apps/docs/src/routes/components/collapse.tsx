import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/collapse/basic';
import basicCode from '../../examples/components/collapse/basic.tsx?raw';
import Icons from '../../examples/components/collapse/icons';
import iconsCode from '../../examples/components/collapse/icons.tsx?raw';
import Controlled from '../../examples/components/collapse/controlled';
import controlledCode from '../../examples/components/collapse/controlled.tsx?raw';

export default function CollapsePage() {
  return (
    <article class="docs-page">
      <Title>Collapse · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Collapse</h1>
      <p class="docs-lead">
        A title that shows and hides the content under it, built from <code>Collapse.Title</code> and{' '}
        <code>Collapse.Content</code>. The height animates in CSS.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Collapse } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>Collapse.Title</code> is a button that toggles the content, with <code>aria-expanded</code> and{' '}
        <code>aria-controls</code> set. Closed, the content stays in the DOM with <code>visibility: hidden</code>: it keeps its
        state, and is out of the tab order and hidden from screen readers. The Collapse has no surface of its own, so put it in a
        Paper or a Card, or give it one with <code>class</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="icons">Icons</H2>
      <p>
        <code>icon="arrow"</code> adds a chevron that turns, and <code>icon="plus"</code> a plus that becomes a minus, at the end
        of the title. They're drawn in CSS, so they add nothing to the button's accessible name. <code>defaultOpened</code> starts
        it open.
      </p>
      <Example component={Icons} code={iconsCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        Pass <code>opened</code> and update it from <code>onChange</code>, which is called with the state the title asks for.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="animation">Animation</H2>
      <p>
        The content's grid row goes from <code>0fr</code> to <code>1fr</code> in 200ms, so nothing is measured and the server
        render is final. Changing it midway reverses from where it is. Under <code>prefers-reduced-motion: reduce</code>, it
        changes at once. Retime it with a selector:
      </p>
      <CodeBlock code={`.slp-collapse-content {\n  transition-duration: 400ms;\n  transition-timing-function: linear;\n}`} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>div</code>. <code>Collapse.Title</code> passes them to its <code>button</code>{' '}
        (its <code>onClick</code> runs first, and <code>event.preventDefault()</code> keeps the state), and{' '}
        <code>Collapse.Content</code> to its <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether the content is shown, when controlled.' },
          { name: 'defaultOpened', type: 'boolean', default: 'false', description: 'Whether it starts open, when uncontrolled.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when the title is pressed.' },
          { name: 'icon', type: "'arrow' | 'plus'", description: 'An indicator at the end of the title.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The parts have the classes <code>.slp-collapse</code>, <code>.slp-collapse-title</code> and{' '}
        <code>.slp-collapse-content</code>, and the content's inner <code>[data-slot="collapse-content-body"]</code> clips it
        while it moves and holds the padding. All three have <code>data-opened</code>; the root and the title have{' '}
        <code>data-icon</code>. Their rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
