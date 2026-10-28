import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/action-icon/basic';
import basicCode from '../../examples/components/action-icon/basic.tsx?raw';
import Variants from '../../examples/components/action-icon/variants';
import variantsCode from '../../examples/components/action-icon/variants.tsx?raw';
import Sizes from '../../examples/components/action-icon/sizes';
import sizesCode from '../../examples/components/action-icon/sizes.tsx?raw';
import Toggle from '../../examples/components/action-icon/toggle';
import toggleCode from '../../examples/components/action-icon/toggle.tsx?raw';
import { withBase } from '../../base';

export default function ActionIconPage() {
  return (
    <article class="docs-page">
      <Title>ActionIcon · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>ActionIcon</h1>
      <p class="docs-lead">
        A button that shows only an icon: a fixed-size square or circle <a href={withBase('/components/button')}>Button</a>, named
        by <code>label</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { ActionIcon } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>label</code> is required and becomes the button's <code>aria-label</code>: an icon alone says nothing to a screen
        reader. Say what the button does, not what the icon shows, and mark the icon <code>aria-hidden="true"</code>. Without a
        color, a ghost ActionIcon takes the color of the text around it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="variants">Variants</H2>
      <p>
        The Button variants except <code>link</code>. <code>ghost</code> is the default: it suits toolbars, table rows and
        headers, where a row of filled squares would be heavy. Use <code>solid</code> or <code>soft</code> for a lone primary
        action.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="sizes">Sizes and shapes</H2>
      <p>
        <code>xs</code> to <code>xl</code>, the same heights as Button, so an ActionIcon lines up with a Button of the same size.{' '}
        <code>square</code> is the default; <code>circle</code> is round.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="toggle">Toggle</H2>
      <p>
        <code>active</code> forces the pressed look. Pair it with <code>aria-pressed</code>, so screen readers announce the state.
      </p>
      <Example component={Toggle} code={toggleCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props, such as <code>onClick</code> or <code>href</code>, are passed to the rendered element. For closing or
        dismissing, use <a href={withBase('/components/close-button')}>CloseButton</a>.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'string', default: 'required', description: 'Accessible name.' },
          {
            name: 'variant',
            type: "'ghost' | 'solid' | 'soft' | 'outline' | 'dash'",
            default: "'ghost'",
            description: 'Visual style.',
          },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Color role.',
          },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          { name: 'shape', type: "'square' | 'circle'", default: "'square'", description: 'Shape.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Forces the pressed look.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner and blocks interaction.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          { name: 'as', type: 'ValidComponent', default: "'button'", description: 'Element or component to render.' },
          { name: 'children', type: 'JSX.Element', description: 'The icon.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-action-icon</code> and <code>.slp-button</code>, and Button's attributes and CSS
        variables: <code>data-variant</code>, <code>data-color</code>, <code>data-size</code>, <code>data-shape</code>,{' '}
        <code>data-pressed</code>, <code>data-loading</code>, <code>data-disabled</code>, <code>--slp-button-color</code>,{' '}
        <code>--slp-button-content</code>. No slots: the icon is a direct child. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
