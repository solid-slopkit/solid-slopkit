import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/close-button/basic';
import basicCode from '../../examples/components/close-button/basic.tsx?raw';
import Sizes from '../../examples/components/close-button/sizes';
import sizesCode from '../../examples/components/close-button/sizes.tsx?raw';
import Icon from '../../examples/components/close-button/icon';
import iconCode from '../../examples/components/close-button/icon.tsx?raw';
import { withBase } from '../../base';

export default function CloseButtonPage() {
  return (
    <article class="docs-page">
      <Title>CloseButton · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>CloseButton</h1>
      <p class="docs-lead">
        A square ghost <a href={withBase('/components/button')}>Button</a> with an X icon, for closing or dismissing what it sits
        in.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { CloseButton } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        It has no background until it's hovered or focused. Without <code>color</code>, the icon takes the color of the text
        around it, so it fits on any surface. Screen readers call it “Close”; pass <code>label</code> for a name that says what
        goes away, such as “Remove filter”. Alert and Notification render one for you when you pass <code>onClose</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="sizes">Sizes</H2>
      <p>The same heights as Button, so it lines up with buttons and inputs of the same size. Defaults to md.</p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="icon">Icon</H2>
      <p>
        Children replace the X, for an icon from your own set. Mark it <code>aria-hidden="true"</code>: the label names the
        button.
      </p>
      <Example component={Icon} code={iconCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>onClick</code>, are passed to the <code>button</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'string', default: "'Close'", description: 'Accessible name.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role of the icon and the tint. The text color when omitted.',
          },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
          { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'Native type.' },
          { name: 'children', type: 'JSX.Element', default: 'an X', description: 'Replaces the icon.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-close-button</code> and <code>.slp-button</code>, and Button's attributes and CSS
        variables: <code>data-variant="ghost"</code>, <code>data-shape="square"</code>, <code>data-size</code>,{' '}
        <code>data-color</code>, <code>data-disabled</code>, <code>--slp-button-color</code>. The built-in X has the slot{' '}
        <code>close-button-icon</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
