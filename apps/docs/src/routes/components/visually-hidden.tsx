import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/visually-hidden/basic';
import basicCode from '../../examples/components/visually-hidden/basic.tsx?raw';
import Heading from '../../examples/components/visually-hidden/heading';
import headingCode from '../../examples/components/visually-hidden/heading.tsx?raw';

export default function VisuallyHiddenPage() {
  return (
    <article class="docs-page">
      <Title>VisuallyHidden · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>VisuallyHidden</h1>
      <p class="docs-lead">
        Content that screen readers announce but the page doesn't show: a <code>span</code> by default, or any element with{' '}
        <code>as</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { VisuallyHidden } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Use it for text the layout already says visually: an icon's meaning, or what a number counts. The element is clipped to
        nothing and taken out of the flow, so it takes no space, but it stays rendered, so screen readers read it and it names the
        control it sits in. Below, the button is announced as “Delete draft” and the badge as “3 unread messages”.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="element">Element</H2>
      <p>
        The default <code>span</code> fits anywhere text does. For block content or a heading, pass <code>as</code>. A hidden
        heading gives a section a name in the page outline when its purpose is already clear on screen.
      </p>
      <Example component={Heading} code={headingCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        Don't put a link or button inside: it stays hidden when it gets focus, so a keyboard user would lose sight of where they
        are. On a control with no visible text, <code>aria-label</code> does the same job; VisuallyHidden is for text that's part
        of the content, and it gets translated with the page.
      </p>

      <H2 id="props">Props</H2>
      <p>Other props are passed to the element.</p>
      <PropsTable
        rows={[
          { name: 'as', type: 'ValidComponent', default: "'span'", description: 'Element or component to render.' },
          { name: 'dynamicAs', type: 'boolean', default: 'false', description: 'Set when as changes after the first render.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-visually-hidden</code>, and no slots or state attributes. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins: an app rule that sets <code>position</code>,{' '}
        <code>clip-path</code> or <code>overflow</code> on the same element can make it show.
      </p>
    </article>
  );
}
