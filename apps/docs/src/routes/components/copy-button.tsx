import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/copy-button/basic';
import basicCode from '../../examples/components/copy-button/basic.tsx?raw';
import Variants from '../../examples/components/copy-button/variants';
import variantsCode from '../../examples/components/copy-button/variants.tsx?raw';
import Feedback from '../../examples/components/copy-button/feedback';
import feedbackCode from '../../examples/components/copy-button/feedback.tsx?raw';
import { withBase } from '../../base';

export default function CopyButtonPage() {
  return (
    <article class="docs-page">
      <Title>CopyButton · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>CopyButton</h1>
      <p class="docs-lead">
        An <a href={withBase('/components/action-icon')}>ActionIcon</a> that copies <code>value</code> to the clipboard, then
        shows a check and says so for a moment.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { CopyButton } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A press writes <code>value</code> to the clipboard. For <code>timeout</code> milliseconds (2000 by default), the icon
        becomes a check, the button turns <code>success</code> and its name changes from “Copy” to “Copied”. Say what's copied
        when the page has more than one.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Variants</H2>
      <p>
        ActionIcon's <code>variant</code>, <code>color</code>, <code>size</code> and <code>shape</code>. <code>color</code>{' '}
        applies until a copy; the confirmation is always <code>success</code>.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="feedback">Confirming and errors</H2>
      <p>
        The new name is the only announcement, and only some screen readers read a focused button's new name. When a copy matters,
        confirm it in the page from <code>onCopied</code>. Browsers refuse outside a secure context (HTTPS or localhost) and
        sometimes without permission; then nothing is confirmed and <code>onCopyError</code> gets the reason.
      </p>
      <Example component={Feedback} code={feedbackCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>button</code>. <code>onClick</code> runs before the copy, and{' '}
        <code>event.preventDefault()</code> in it skips the copy.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'string', default: 'required', description: 'The text to copy.' },
          { name: 'label', type: 'string', default: "'Copy'", description: 'Accessible name.' },
          {
            name: 'copiedLabel',
            type: 'string',
            default: "'Copied'",
            description: 'Accessible name while the copy is confirmed.',
          },
          { name: 'timeout', type: 'number', default: '2000', description: 'How long the confirmation lasts, in milliseconds.' },
          { name: 'onCopied', type: '(value: string) => void', description: 'Called after the text is copied.' },
          { name: 'onCopyError', type: '(error: unknown) => void', description: 'Called when the browser refuses to copy.' },
          {
            name: 'variant',
            type: "'ghost' | 'solid' | 'soft' | 'outline' | 'dash'",
            default: "'ghost'",
            description: 'Visual style.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role until a copy.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          { name: 'shape', type: "'square' | 'circle'", default: "'square'", description: 'Shape.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'Native type.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-copy-button</code>, <code>.slp-action-icon</code> and <code>.slp-button</code>, with{' '}
        <code>data-copied</code> while the copy is confirmed, and Button's attributes and CSS variables. The icon has the slot{' '}
        <code>copy-button-icon</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
