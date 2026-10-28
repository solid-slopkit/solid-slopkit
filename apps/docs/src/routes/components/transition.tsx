import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/transition/basic';
import basicCode from '../../examples/components/transition/basic.tsx?raw';
import Presets from '../../examples/components/transition/presets';
import presetsCode from '../../examples/components/transition/presets.tsx?raw';
import Timing from '../../examples/components/transition/timing';
import timingCode from '../../examples/components/transition/timing.tsx?raw';

const customCss = `.panel {
  transition: opacity 200ms, filter 200ms;

  &:is([data-status='starting'], [data-status='ending']) {
    opacity: 0;
    filter: blur(4px);
  }
}`;

const customTsx = `<Transition mounted={opened()} transition="none">
  {(transition) => <div {...transition} class={[transition.class, 'panel']}>…</div>}
</Transition>`;

export default function TransitionPage() {
  return (
    <article class="docs-page">
      <Title>Transition · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Transition</h1>
      <p class="docs-lead">
        Animates content in and out as <code>mounted</code> changes. The content stays rendered until its exit animation has
        finished.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Transition } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The child is a function that gets the transition's attributes. Spread them on the root element of the content: they carry
        a ref, a class, the timing as inline custom properties, and <code>data-transition</code> and <code>data-status</code>. The
        element has to take a ref, so a component used as the root must pass its ref on.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="presets">Presets</H2>
      <p>
        <code>transition</code> names a ready-made animation, <code>fade</code> by default. The direction in the name is the way
        it moves while entering: <code>fade-up</code> rises into place. The <code>slide</code> presets move by the element's own
        size, so put them in a box with <code>overflow: hidden</code>.
      </p>
      <Example component={Presets} code={presetsCode} />

      <H2 id="timing">Timing and keeping it mounted</H2>
      <p>
        <code>duration</code> sets the enter animation in milliseconds, 200 by default, <code>exitDuration</code> the exit one
        (the same unless set), and <code>timingFunction</code> the easing of both. With <code>keepMounted</code>, the hidden
        content stays in the DOM with <code>display: none</code> instead of unmounting, so its state survives.
      </p>
      <Example component={Timing} code={timingCode} />

      <H2 id="reduced-motion">Reduced motion</H2>
      <p>
        Under <code>prefers-reduced-motion: reduce</code>, the presets don't animate: the content shows and hides at once.{' '}
        <code>onEntered</code> and <code>onExited</code> are still called.
      </p>

      <H2 id="combining">Your own ref, class and style</H2>
      <p>
        Attributes after the spread replace the transition's, so combine them instead: <code>ref</code> and <code>class</code>{' '}
        take arrays, and <code>style</code> is an object to spread.
      </p>
      <CodeBlock
        code={`{(transition) => (
  <div
    {...transition}
    ref={[transition.ref, (el) => (panel = el)]}
    class={[transition.class, 'panel']}
    style={{ ...transition.style, 'max-width': '20rem' }}
  />
)}`}
      />

      <H2 id="custom">Your own animation</H2>
      <p>
        <code>transition="none"</code> leaves the animation to your CSS. Write it against <code>data-status</code>:{' '}
        <code>starting</code> for the one frame after mounting, which the enter transition starts from, <code>open</code> while
        shown, <code>ending</code> while the exit runs, and <code>closed</code>. Keyframe animations work too: on{' '}
        <code>open</code> to enter, on <code>ending</code> to exit. Transition waits for the element's own transitions and
        animations, not its children's.
      </p>
      <CodeBlock code={customTsx} />
      <CodeBlock code={customCss} lang="css" />

      <H2 id="props">Props</H2>
      <PropsTable
        rows={[
          { name: 'mounted', type: 'boolean', description: 'Whether the content is shown.' },
          {
            name: 'transition',
            type: "'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'scale-x' | 'scale-y' | 'pop' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'rotate-left' | 'rotate-right' | 'none'",
            default: "'fade'",
            description: 'The animation.',
          },
          { name: 'duration', type: 'number', default: '200', description: 'Enter duration, in milliseconds.' },
          { name: 'exitDuration', type: 'number', default: 'duration', description: 'Exit duration, in milliseconds.' },
          { name: 'timingFunction', type: 'string', default: "'ease'", description: 'CSS timing function of both.' },
          {
            name: 'keepMounted',
            type: 'boolean',
            default: 'false',
            description: 'Keep the content in the DOM, with display: none, while hidden. Read once.',
          },
          { name: 'onEntered', type: '() => void', description: 'Called when the enter animation has finished.' },
          { name: 'onExited', type: '() => void', description: 'Called when the exit animation has finished.' },
          {
            name: 'children',
            type: '(transition: TransitionAttributes) => JSX.Element',
            description: 'Renders the content; spread the attributes on its root element.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The content's root gets the class <code>.slp-transition</code>, with <code>data-transition</code> and{' '}
        <code>data-status</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
