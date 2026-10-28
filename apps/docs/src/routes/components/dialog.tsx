import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/dialog/basic';
import basicCode from '../../examples/components/dialog/basic.tsx?raw';
import Position from '../../examples/components/dialog/position';
import positionCode from '../../examples/components/dialog/position.tsx?raw';

export default function DialogPage() {
  return (
    <article class="docs-page">
      <Title>Dialog · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Dialog</h1>
      <p class="docs-lead">
        A small window in a corner of the viewport that leaves the page usable, such as a feedback prompt or a chat: a non-modal{' '}
        <code>role="dialog"</code> in the browser's top layer.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Dialog } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        It's controlled: pass <code>opened</code>, and set it to <code>false</code> in <code>onClose</code>, which the close
        button and Escape call. Name it with <code>aria-label</code> or <code>aria-labelledby</code>. It isn't modal: the page
        under it stays usable, and it doesn't move focus or keep it inside; Tab reaches it where it is in the document. For a
        dialog that blocks the page, use Modal.
      </p>
      <Example component={Basic} code={basicCode} />
      <p>
        Escape closes it only while focus is inside it, not from elsewhere on the page, unless <code>closeOnEscape</code> is off.
        With a menu or popover open inside it, Escape closes that one first.
      </p>

      <H2 id="position">Position and size</H2>
      <p>
        <code>position</code> is a corner or the middle of the top or bottom edge, <code>bottom-right</code> by default, and{' '}
        <code>offset</code> the gap to the edges, 16px by default. <code>size</code> is its width, <code>xs</code> to{' '}
        <code>xl</code>, 16 to 32rem, never past the viewport. It fades up at the bottom and down at the top, unless{' '}
        <code>transition</code> picks another of Transition's presets.
      </p>
      <Example component={Position} code={positionCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether it is shown.' },
          { name: 'onClose', type: '() => void', description: 'Called when it asks to close.' },
          { name: 'position', type: 'DialogPosition', default: "'bottom-right'", description: 'Where it sits.' },
          { name: 'offset', type: 'number', default: '16', description: "Gap to the viewport's edges, in px." },
          { name: 'size', type: 'SlopSize', default: "'md'", description: 'Width, from 16 to 32rem.' },
          { name: 'withCloseButton', type: 'boolean', default: 'true', description: 'Shows a close button in its corner.' },
          { name: 'closeButtonLabel', type: 'string', default: "'Close'", description: 'Accessible name of the close button.' },
          {
            name: 'closeOnEscape',
            type: 'boolean',
            default: 'true',
            description: 'Whether Escape closes it while focus is inside.',
          },
          { name: 'transition', type: 'TransitionName', default: 'by position', description: 'Its animation.' },
          { name: 'transitionDuration', type: 'number', default: '200', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-dialog</code>, with <code>data-position</code>, <code>data-size</code>,{' '}
        <code>data-with-close-button</code>, <code>data-status</code> and <code>data-transition</code>. The close button is{' '}
        <code>[data-slot="dialog-close"]</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
