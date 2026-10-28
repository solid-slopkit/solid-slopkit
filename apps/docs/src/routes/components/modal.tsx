import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/modal/basic';
import basicCode from '../../examples/components/modal/basic.tsx?raw';
import Confirm from '../../examples/components/modal/confirm';
import confirmCode from '../../examples/components/modal/confirm.tsx?raw';
import FullScreen from '../../examples/components/modal/full-screen';
import fullScreenCode from '../../examples/components/modal/full-screen.tsx?raw';

export default function ModalPage() {
  return (
    <article class="docs-page">
      <Title>Modal · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Modal</h1>
      <p class="docs-lead">
        A dialog over the page: a modal <code>&lt;dialog&gt;</code> in the browser's top layer, which makes the rest of the page
        inert and keeps focus inside.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Modal } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        It's controlled: pass <code>opened</code>, and set it to <code>false</code> in <code>onClose</code>, which the close
        button, Escape and a press on the backdrop call. <code>title</code> renders an <code>h2</code> that names the dialog;
        without one, give it <code>aria-label</code>. Opening focuses the element marked <code>data-autofocus</code>, else the
        first focusable one, and closing moves focus back to where it was.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="confirm">Size and centering</H2>
      <p>
        <code>size</code> goes from <code>xs</code> to <code>xl</code> (20 to 48rem), <code>md</code> by default, and never past
        the viewport. <code>centered</code> centers it vertically. Here a press on the backdrop doesn't close it (
        <code>closeOnClickOutside</code>), and the safe choice has focus.
      </p>
      <Example component={Confirm} code={confirmCode} />

      <H2 id="full-screen">Full screen and long content</H2>
      <p>
        <code>fullScreen</code> fills the viewport. Content taller than the viewport scrolls inside the modal; the page behind
        doesn't scroll while it's open, unless <code>lockScroll</code> is off, and a classic scrollbar's room is kept, so it
        doesn't shift sideways.
      </p>
      <Example component={FullScreen} code={fullScreenCode} />

      <H2 id="closing">Closing and animation</H2>
      <p>
        Escape and a press on the backdrop ask it to close, unless <code>closeOnEscape</code> or <code>closeOnClickOutside</code>{' '}
        is off; with a popover or menu open inside it, that one closes first. <code>withCloseButton</code> and{' '}
        <code>closeButtonLabel</code> set the close button. <code>transition</code> takes Transition's presets for the content,{' '}
        <code>pop</code> by default, and the backdrop fades with it over <code>transitionDuration</code>, 200ms by default.
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
          { name: 'title', type: 'JSX.Element', description: 'The heading, which names the dialog.' },
          { name: 'withCloseButton', type: 'boolean', default: 'true', description: 'Shows a close button in the header.' },
          { name: 'closeButtonLabel', type: 'string', default: "'Close'", description: 'Accessible name of the close button.' },
          { name: 'size', type: 'SlopSize', default: "'md'", description: 'Width, from 20 to 48rem.' },
          { name: 'centered', type: 'boolean', default: 'false', description: 'Centers it vertically.' },
          { name: 'fullScreen', type: 'boolean', default: 'false', description: 'Fills the viewport.' },
          {
            name: 'closeOnClickOutside',
            type: 'boolean',
            default: 'true',
            description: 'Whether a press on the backdrop closes it.',
          },
          { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether Escape closes it.' },
          { name: 'returnFocus', type: 'boolean', default: 'true', description: 'Moves focus back when it closes.' },
          { name: 'lockScroll', type: 'boolean', default: 'true', description: "Stops the page scrolling while it's open." },
          { name: 'transition', type: 'TransitionName', default: "'pop'", description: "The content's animation." },
          { name: 'transitionDuration', type: 'number', default: '200', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The <code>&lt;dialog&gt;</code> has the class <code>.slp-modal</code>, with <code>data-size</code>,{' '}
        <code>data-centered</code>, <code>data-full-screen</code> and <code>data-status</code>; its backdrop is{' '}
        <code>.slp-modal::backdrop</code>. Inside it are the slots <code>modal-content</code> (the box), <code>modal-header</code>
        , <code>modal-title</code>, <code>modal-close</code> and <code>modal-body</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
