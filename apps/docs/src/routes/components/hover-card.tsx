import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/hover-card/basic';
import basicCode from '../../examples/components/hover-card/basic.tsx?raw';
import Position from '../../examples/components/hover-card/position';
import positionCode from '../../examples/components/hover-card/position.tsx?raw';

export default function HoverCardPage() {
  return (
    <article class="docs-page">
      <Title>HoverCard · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>HoverCard</h1>
      <p class="docs-lead">
        Rich content about a target, such as a profile behind a username, shown in the browser's top layer while the target is
        hovered or has keyboard focus.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { HoverCard } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Build it from <code>HoverCard.Target</code> and <code>HoverCard.Dropdown</code>, with the dropdown right after the target.
        The target's child is a function that gets the target's attributes: spread them on one focusable element, usually a link.
        The dropdown has no role of its own; name it with <code>aria-label</code> when its content needs it. It's a{' '}
        <code>div</code>, which a paragraph can't hold, so for a target inside running text, render the text as a <code>div</code>
        : <code>&lt;Text as="div"&gt;</code>.
      </p>
      <Example component={Basic} code={basicCode} />
      <p>
        Hovering the target with a mouse or pen shows it after <code>openDelay</code>, 0 by default, and keyboard focus shows it
        at once; a tap doesn't, so a link still navigates on touch. The pointer can move onto the dropdown: leaving either hides
        it after <code>closeDelay</code>, 150ms by default. Tab moves from the target into the dropdown, and it stays shown while
        focus is inside either. Escape and a press outside close it, and Escape moves focus from inside back to the target.
      </p>
      <p>A hover card is supplementary: keep what's in it reachable elsewhere too, such as the profile page the link goes to.</p>

      <H2 id="position">Position</H2>
      <p>
        <code>position</code> is a side of the target, optionally followed by <code>-start</code> or <code>-end</code>,{' '}
        <code>bottom</code> by default. The dropdown flips when there's no room, slides to stay in the viewport, and follows the
        target while the page scrolls. <code>offset</code> sets the gap, 8px by default, and <code>withArrow</code> adds an arrow.
      </p>
      <Example component={Position} code={positionCode} />

      <H2 id="state">State and animation</H2>
      <p>
        Pass <code>opened</code> and <code>onChange</code> to hold the state yourself; <code>onChange</code> is called whenever it
        would show or hide itself. <code>transition</code> takes Transition's presets, <code>fade</code> by default, and{' '}
        <code>transitionDuration</code> its length, 150ms by default. Under <code>prefers-reduced-motion: reduce</code>, it shows
        and hides at once.
      </p>

      <H2 id="props">Props</H2>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether it is shown, for a controlled hover card.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when it would show or hide itself.' },
          { name: 'position', type: 'HoverCardPosition', default: "'bottom'", description: 'Where the dropdown goes.' },
          { name: 'offset', type: 'number', default: '8', description: 'Gap between the target and the dropdown, in px.' },
          { name: 'withArrow', type: 'boolean', default: 'false', description: 'Shows an arrow pointing at the target.' },
          { name: 'openDelay', type: 'number', default: '0', description: 'Delay before showing it on hover, in ms.' },
          {
            name: 'closeDelay',
            type: 'number',
            default: '150',
            description: 'Delay before hiding it once the pointer has left, in ms.',
          },
          { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether Escape closes it.' },
          { name: 'transition', type: 'TransitionName', default: "'fade'", description: "The dropdown's animation." },
          { name: 'transitionDuration', type: 'number', default: '150', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The dropdown has the class <code>.slp-hover-card</code> and <code>[data-slot="hover-card-dropdown"]</code>, with{' '}
        <code>data-placement</code> (the side it took, after flipping), <code>data-status</code> and <code>data-transition</code>.
        The arrow is <code>[data-slot="hover-card-arrow"]</code>. Its rules live in <code>@layer slopkit.components</code>, so
        unlayered CSS wins.
      </p>
    </article>
  );
}
