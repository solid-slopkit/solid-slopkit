import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/notification/basic';
import basicCode from '../../examples/components/notification/basic.tsx?raw';
import Loading from '../../examples/components/notification/loading';
import loadingCode from '../../examples/components/notification/loading.tsx?raw';
import Corner from '../../examples/components/notification/corner';
import cornerCode from '../../examples/components/notification/corner.tsx?raw';
import { withBase } from '../../base';

export default function NotificationPage() {
  return (
    <article class="docs-page">
      <Title>Notification · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Notification</h1>
      <p class="docs-lead">
        A short message about something that happened: a card with <code>role="status"</code>, a title, and an icon or a colored
        bar.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Notification } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>color</code> takes a color role. Without an icon, a bar of the color runs down the start edge; with one, the icon
        sits in a circle of the color. A notification is announced politely; pass <code>role="alert"</code> for an error the
        reader must hear at once.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="loading">Loading</H2>
      <p>
        <code>loading</code> shows a Loader in place of the icon and sets <code>aria-busy</code>. When it ends, the icon comes
        back.
      </p>
      <Example component={Loading} code={loadingCode} />

      <H2 id="showing">Showing and dismissing</H2>
      <p>
        Notification is only the card. To show notifications from anywhere, stacked in a corner and closing on their own, use{' '}
        <a href={withBase('/components/notifications')}>Notifications</a>. To place one yourself, put it where it should appear
        and remove it when it's done. Passing <code>onClose</code> shows a close button at the end edge, and pressing it calls{' '}
        <code>onClose</code>. <code>closeButtonLabel</code> names it for screen readers, <code>'Close'</code> by default.
      </p>
      <Example component={Corner} code={cornerCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>role</code>, are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'title', type: 'JSX.Element', description: 'A short heading above the message.' },
          { name: 'icon', type: 'JSX.Element', description: 'An icon in a circle of the color. A bar if the prop is left out.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'primary'",
            description: 'Color role of the circle or the bar.',
          },
          {
            name: 'loading',
            type: 'boolean',
            default: 'false',
            description: 'Shows a Loader in place of the icon; sets aria-busy.',
          },
          { name: 'onClose', type: '() => void', description: "Shows a close button, and is called when it's pressed." },
          { name: 'closeButtonLabel', type: 'string', default: "'Close'", description: 'Accessible name of the close button.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-notification</code>, with <code>data-color</code> and <code>data-loading</code>. Its
        slots are <code>notification-icon</code>, <code>notification-content</code>, <code>notification-title</code>,{' '}
        <code>notification-message</code> and <code>notification-close-button</code>. The bar is the root's <code>::before</code>.
        Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-notification-color',
            default: 'var(--slp-color-<color>)',
            description: "Bar and circle color. For a color that isn't a role.",
          },
          {
            name: '--slp-notification-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Icon color in the circle.',
          },
        ]}
      />
    </article>
  );
}
