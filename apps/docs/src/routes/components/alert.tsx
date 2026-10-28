import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/alert/basic';
import basicCode from '../../examples/components/alert/basic.tsx?raw';
import Colors from '../../examples/components/alert/colors';
import colorsCode from '../../examples/components/alert/colors.tsx?raw';
import Variants from '../../examples/components/alert/variants';
import variantsCode from '../../examples/components/alert/variants.tsx?raw';
import Dismiss from '../../examples/components/alert/dismiss';
import dismissCode from '../../examples/components/alert/dismiss.tsx?raw';

export default function AlertPage() {
  return (
    <article class="docs-page">
      <Title>Alert · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Alert</h1>
      <p class="docs-lead">
        A message that needs the reader's attention: a <code>div</code> with <code>role="alert"</code>, an optional icon and
        title.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Alert } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>title</code> goes above the message, and <code>icon</code> on the start side, centered on the first line. Mark the
        icon <code>aria-hidden</code>: the text carries the meaning.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role and defaults to <code>info</code>.
      </p>
      <Example component={Colors} code={colorsCode} />

      <H2 id="variants">Variants</H2>
      <p>
        <code>soft</code> (the default) is a light tint with an edge, <code>outline</code> only the edge, and <code>solid</code>{' '}
        fills the box. In soft and outline, the role color is in the icon and the edge and the text keeps the base color, so it
        stays readable whatever the role.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="roles">Announcing</H2>
      <p>
        An Alert has <code>role="alert"</code>, so one that appears after something the reader did, such as a failed submit, is
        announced at once. For a polite update, such as "Saved", pass <code>role="status"</code>; for information that's on the
        page from the start, <code>role="note"</code>, as the examples above do.
      </p>

      <H2 id="dismiss">Dismissing</H2>
      <p>
        Passing <code>onClose</code> shows a close button at the end edge, and pressing it calls <code>onClose</code>. The alert
        doesn't remove itself: render it conditionally and hide it there. <code>closeButtonLabel</code> names the button for
        screen readers, <code>'Close'</code> by default.
      </p>
      <Example component={Dismiss} code={dismissCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>role</code>, are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'title', type: 'JSX.Element', description: 'A short heading above the message.' },
          { name: 'icon', type: 'JSX.Element', description: 'An icon on the start side.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'info'",
            description: 'Color role.',
          },
          { name: 'variant', type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: 'Visual style.' },
          { name: 'onClose', type: '() => void', description: "Shows a close button, and is called when it's pressed." },
          { name: 'closeButtonLabel', type: 'string', default: "'Close'", description: 'Accessible name of the close button.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-alert</code>, with <code>data-color</code>, <code>data-variant</code> and{' '}
        <code>data-with-icon</code>. Its slots are <code>alert-icon</code>, <code>alert-content</code>, <code>alert-title</code>,{' '}
        <code>alert-message</code> and <code>alert-close-button</code>. Its rules live in <code>@layer slopkit.components</code>,
        so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-alert-color',
            default: 'var(--slp-color-<color>)',
            description: 'Accent color: tint, edge and icon, or the background of a solid alert.',
          },
          {
            name: '--slp-alert-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Text color on a solid alert.',
          },
        ]}
      />
    </article>
  );
}
