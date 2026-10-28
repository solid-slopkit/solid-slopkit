import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/notifications/basic';
import basicCode from '../../examples/components/notifications/basic.tsx?raw';
import Update from '../../examples/components/notifications/update';
import updateCode from '../../examples/components/notifications/update.tsx?raw';
import Facade from '../../examples/components/notifications/facade';
import facadeCode from '../../examples/components/notifications/facade.tsx?raw';
import { withBase } from '../../base';

export default function NotificationsPage() {
  return (
    <article class="docs-page">
      <Title>Notifications · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Notifications</h1>
      <p class="docs-lead">
        Show notifications from anywhere in the app. They stack in a corner of the screen and close on their own.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Notifications, useNotifications, notifications } from '@solid-slopkit/components';`} />

      <H2 id="setup">Setup</H2>
      <p>
        Render <code>{'<Notifications />'}</code> once, inside <code>{'<SlopkitUi>'}</code>. It's the region they appear in: fixed
        to a corner of the viewport, above everything else in the top layer, and letting presses through except on the
        notifications themselves.
      </p>
      <CodeBlock
        code={`<SlopkitUi>
  <App />
  <Notifications position="bottom-end" />
</SlopkitUi>`}
      />

      <H2 id="usage">Usage</H2>
      <p>
        <code>useNotifications()</code> returns <code>show</code>, <code>update</code>, <code>hide</code>, <code>clean</code> and{' '}
        <code>notifications</code>, an accessor of the list. <code>show</code> takes a <code>message</code> and the look of a{' '}
        <a href={withBase('/components/notification')}>Notification</a> (<code>title</code>, <code>icon</code>, <code>color</code>
        , <code>loading</code>), and returns the notification's id. Each closes after <code>autoClose</code> milliseconds, which
        pauses while the pointer or focus is in the region, or when its close button is pressed. New ones are announced politely;{' '}
        <code>role: 'alert'</code> interrupts, for errors.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="update">Updating</H2>
      <p>
        <code>update(id, data)</code> changes a notification that's showing, such as one that was loading. A loading notification
        doesn't close on its own; it starts counting once it's done.
      </p>
      <Example component={Update} code={updateCode} />

      <H2 id="facade">Outside components</H2>
      <p>
        The <code>notifications</code> object does the same from code outside the component tree, such as a fetch helper, through
        the most recently mounted <code>{'<SlopkitUi>'}</code>. On the server it does nothing, since notifications are shown in
        the browser only. Inside components, prefer the hook.
      </p>
      <Example component={Facade} code={facadeCode} />

      <H2 id="props">Props</H2>
      <p>
        <code>{'<Notifications>'}</code>'s own props. Others go to the region's <code>section</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'position',
            type: "'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'",
            default: "'bottom-end'",
            description: 'Where they appear.',
          },
          { name: 'limit', type: 'number', default: '5', description: 'How many show at once; the rest wait.' },
          { name: 'autoClose', type: 'number | false', default: '4000', description: 'How long each stays, in milliseconds.' },
          { name: 'label', type: 'string', default: "'Notifications'", description: "The region's accessible name." },
        ]}
      />

      <H2 id="data">What show() takes</H2>
      <PropsTable
        rows={[
          { name: 'message', type: 'JSX.Element', description: 'The message. Required.' },
          { name: 'title', type: 'JSX.Element', description: 'A short heading above it.' },
          { name: 'icon', type: 'JSX.Element', description: 'An icon in a circle of the color; a bar without one.' },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: 'The circle or bar color.' },
          { name: 'loading', type: 'boolean', default: 'false', description: "Shows a Loader; it doesn't close while loading." },
          { name: 'autoClose', type: 'number | false', default: "the region's", description: 'How long it stays.' },
          { name: 'withCloseButton', type: 'boolean', default: 'true', description: 'Shows the close button.' },
          { name: 'closeButtonLabel', type: 'string', default: "'Close'", description: "The close button's name." },
          { name: 'role', type: "'alert'", description: 'Announces it at once, for errors.' },
          { name: 'id', type: 'string', description: 'Its id; showing one with an id already shown updates it.' },
          { name: 'class', type: 'string', description: 'A class on the notification.' },
          { name: 'onOpen', type: '(id: string) => void', description: "Called once it's shown." },
          { name: 'onClose', type: '(id: string) => void', description: "Called once it's gone." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The region is <code>.slp-notifications</code>, with <code>data-position</code>, holding{' '}
        <code>[data-slot="notifications-list"]</code> and a <code>notifications-item</code> per notification, with{' '}
        <code>data-status</code> as it enters and leaves. Each holds a <code>.slp-notification</code>, styled as{' '}
        <a href={withBase('/components/notification')}>Notification</a>. The rules live in <code>@layer slopkit.components</code>,
        so unlayered CSS wins.
      </p>
    </article>
  );
}
