import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/drawer/basic';
import basicCode from '../../examples/components/drawer/basic.tsx?raw';
import Position from '../../examples/components/drawer/position';
import positionCode from '../../examples/components/drawer/position.tsx?raw';

export default function DrawerPage() {
  return (
    <article class="docs-page">
      <Title>Drawer · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Drawer</h1>
      <p class="docs-lead">
        A panel that slides in from an edge of the viewport, such as navigation or filters: a modal <code>&lt;dialog&gt;</code> in
        the browser's top layer, which makes the rest of the page inert and keeps focus inside.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Drawer } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        It works like Modal, against an edge. It's controlled: pass <code>opened</code>, and set it to <code>false</code> in{' '}
        <code>onClose</code>, which the close button, Escape and a press on the backdrop call. <code>title</code> renders an{' '}
        <code>h2</code> that names the dialog; without one, give it <code>aria-label</code>. Opening focuses the element marked{' '}
        <code>data-autofocus</code>, else the first focusable one, and closing moves focus back to where it was.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="position">Position and size</H2>
      <p>
        <code>position</code> is the edge it comes from, <code>left</code> by default, and it slides in from there.{' '}
        <code>size</code> is its width from the left or right, and its height from the top or bottom: <code>xs</code> to{' '}
        <code>xl</code>, 16 to 40rem, <code>md</code> by default, never past the viewport. Content taller than the panel scrolls
        inside it, and the page behind doesn't scroll while it's open, unless <code>lockScroll</code> is off.
      </p>
      <Example component={Position} code={positionCode} />

      <H2 id="closing">Closing and animation</H2>
      <p>
        Escape and a press on the backdrop ask it to close, unless <code>closeOnEscape</code> or <code>closeOnClickOutside</code>{' '}
        is off; with a popover or menu open inside it, that one closes first. <code>withCloseButton</code> and{' '}
        <code>closeButtonLabel</code> set the close button. <code>transition</code> replaces the slide with one of Transition's
        presets, and the backdrop fades with it over <code>transitionDuration</code>, 200ms by default.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props, <code>class</code>, <code>style</code> and <code>ref</code> go to the <code>&lt;dialog&gt;</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether it is open.' },
          { name: 'onClose', type: '() => void', description: 'Called when it asks to close.' },
          { name: 'onExited', type: '() => void', description: 'Called once it has closed and its exit animation finished.' },
          { name: 'position', type: 'DrawerPosition', default: "'left'", description: 'The edge it comes from.' },
          { name: 'size', type: 'SlopSize', default: "'md'", description: 'Width or height, from 16 to 40rem.' },
          { name: 'title', type: 'JSX.Element', description: 'The heading, which names the dialog.' },
          { name: 'withCloseButton', type: 'boolean', default: 'true', description: 'Shows a close button in the header.' },
          { name: 'closeButtonLabel', type: 'string', default: "'Close'", description: 'Accessible name of the close button.' },
          {
            name: 'closeOnClickOutside',
            type: 'boolean',
            default: 'true',
            description: 'Whether a press on the backdrop closes it.',
          },
          { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether Escape closes it.' },
          { name: 'returnFocus', type: 'boolean', default: 'true', description: 'Moves focus back when it closes.' },
          { name: 'lockScroll', type: 'boolean', default: 'true', description: "Stops the page scrolling while it's open." },
          { name: 'transition', type: 'TransitionName', default: 'the slide', description: "The panel's animation." },
          { name: 'transitionDuration', type: 'number', default: '200', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The <code>&lt;dialog&gt;</code> has the class <code>.slp-drawer</code>, with <code>data-position</code>,{' '}
        <code>data-size</code> and <code>data-status</code>; its backdrop is <code>.slp-drawer::backdrop</code>. Inside it are the
        slots <code>drawer-content</code> (the panel), <code>drawer-header</code>, <code>drawer-title</code>,{' '}
        <code>drawer-close</code> and <code>drawer-body</code>. Its rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
    </article>
  );
}
