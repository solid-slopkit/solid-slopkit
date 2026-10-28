import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/modals/basic';
import basicCode from '../../examples/components/modals/basic.tsx?raw';
import Confirm from '../../examples/components/modals/confirm';
import confirmCode from '../../examples/components/modals/confirm.tsx?raw';
import Async from '../../examples/components/modals/async';
import asyncCode from '../../examples/components/modals/async.tsx?raw';
import { withBase } from '../../base';

export default function ModalsPage() {
  return (
    <article class="docs-page">
      <Title>Modals · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Modals</h1>
      <p class="docs-lead">Open modals from code, without keeping their state yourself, and ask the user to confirm.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Modals, useModals, modals } from '@solid-slopkit/components';`} />

      <H2 id="setup">Setup</H2>
      <p>
        Render <code>{'<Modals />'}</code> once, inside <code>{'<SlopkitUi>'}</code>. It shows the modals opened from code. Its
        props, such as <code>size</code> or <code>centered</code>, are every modal's defaults.
      </p>
      <CodeBlock
        code={`<SlopkitUi>
  <App />
  <Modals centered />
</SlopkitUi>`}
      />

      <H2 id="usage">Usage</H2>
      <p>
        <code>useModals().open(settings)</code> opens a <a href={withBase('/components/modal')}>Modal</a> with its props (
        <code>title</code>, <code>size</code>, …) and <code>children</code>, and returns its id for <code>update</code> and{' '}
        <code>close</code>. Pass the content as a function, as here: it then renders inside the modal, under the provider, so
        components and anything reactive work. Plain text can be passed as is. The close button, Escape and the backdrop close it,
        and <code>onClose</code> is called once it has gone.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="confirm">Confirming</H2>
      <p>
        <code>confirm(settings)</code> opens a modal with cancel and confirm buttons and resolves <code>true</code> when
        confirmed, <code>false</code> when closed any other way. <code>openConfirm</code> does the same with{' '}
        <code>onConfirm</code> and <code>onCancel</code> callbacks. <code>labels</code> renames the buttons, and{' '}
        <code>confirmProps</code> and <code>cancelProps</code> style them, such as <code>color: 'error'</code> for a destructive
        action.
      </p>
      <Example component={Confirm} code={confirmCode} />

      <H2 id="async">Waiting for a request</H2>
      <p>
        With <code>closeOnConfirm: false</code>, confirming leaves the modal open: show progress with <code>update</code> (the
        buttons' <code>loading</code> and <code>disabled</code> follow it), then <code>close</code> it.
      </p>
      <Example component={Async} code={asyncCode} />

      <H2 id="facade">Outside components</H2>
      <p>
        The <code>modals</code> object has the same methods, for code outside the component tree. It reaches the most recently
        mounted <code>{'<SlopkitUi>'}</code>. On the server it does nothing, and <code>confirm</code> resolves <code>false</code>.
      </p>
      <CodeBlock
        code={`import { modals } from '@solid-slopkit/components';

export async function leaveWithUnsavedChanges() {
  return modals.confirm({ title: 'Leave this page?', children: 'Your changes will be lost.', labels: { confirm: 'Leave' } });
}`}
      />

      <H2 id="methods">Methods</H2>
      <PropsTable
        rows={[
          { name: 'open', type: '(settings: ModalSettings) => string', description: 'Opens a modal; returns its id.' },
          { name: 'openConfirm', type: '(settings: ConfirmModalSettings) => string', description: 'Opens a confirm modal.' },
          {
            name: 'confirm',
            type: '(settings: ConfirmModalSettings) => Promise<boolean>',
            description: 'Asks, and resolves the answer.',
          },
          { name: 'update', type: '(id: string, settings) => void', description: 'Changes an open modal.' },
          { name: 'close', type: '(id: string) => void', description: 'Closes one; an unanswered confirm counts as cancelled.' },
          { name: 'closeAll', type: '() => void', description: 'Closes every one, the newest first.' },
          { name: 'modals', type: 'Accessor<readonly ModalEntry[]>', description: 'The open modals (hook only).' },
        ]}
      />

      <H2 id="settings">Settings</H2>
      <p>
        <a href={withBase('/components/modal')}>Modal</a>'s props (except <code>opened</code>, <code>onClose</code> and{' '}
        <code>onExited</code>
        ), and:
      </p>
      <PropsTable
        rows={[
          { name: 'children', type: 'JSX.Element | (() => JSX.Element)', description: 'The content; a function renders inside.' },
          { name: 'id', type: 'string', description: 'Its id; opening one with an id already open replaces it.' },
          { name: 'class', type: 'string', description: 'A class on the dialog.' },
          { name: 'onClose', type: '() => void', description: "Called once it's gone." },
          {
            name: 'labels',
            type: '{ confirm?: string; cancel?: string }',
            default: "'Confirm', 'Cancel'",
            description: "Confirm: the buttons' text.",
          },
          { name: 'confirmProps', type: 'ButtonRootProps', description: 'Confirm: props for the confirm button.' },
          { name: 'cancelProps', type: 'ButtonRootProps', description: 'Confirm: props for the cancel button.' },
          { name: 'onConfirm', type: '() => void', description: 'Confirm: called when confirmed.' },
          { name: 'onCancel', type: '() => void', description: 'Confirm: called when closed any other way.' },
          { name: 'closeOnConfirm', type: 'boolean', default: 'true', description: 'Confirm: whether confirming closes it.' },
          {
            name: 'closeOnCancel',
            type: 'boolean',
            default: 'true',
            description: 'Confirm: whether the cancel button closes it.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        Each is a <a href={withBase('/components/modal')}>Modal</a> (<code>.slp-modal</code>). A confirm modal's buttons are in{' '}
        <code>[data-slot="modals-confirm-actions"]</code>, after the content. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
