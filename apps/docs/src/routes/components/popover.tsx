import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/popover/basic';
import basicCode from '../../examples/components/popover/basic.tsx?raw';
import Position from '../../examples/components/popover/position';
import positionCode from '../../examples/components/popover/position.tsx?raw';
import Controlled from '../../examples/components/popover/controlled';
import controlledCode from '../../examples/components/popover/controlled.tsx?raw';
import { withBase } from '../../base';

export default function PopoverPage() {
  return (
    <article class="docs-page">
      <Title>Popover · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Popover</h1>
      <p class="docs-lead">
        Floating content anchored to a target, such as a small form or details: a non-modal dialog in the browser's top layer.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Popover } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Build it from <code>Popover.Target</code> and <code>Popover.Dropdown</code>. The target's child is a function that gets
        the target's attributes: spread them on the element that opens it, usually a Button. They carry a ref, the click that
        toggles it, and <code>aria-haspopup</code>, <code>aria-expanded</code> and <code>aria-controls</code>. Name the dropdown
        with <code>aria-label</code> or <code>aria-labelledby</code>.
      </p>
      <Example component={Basic} code={basicCode} />
      <p>
        Opening moves focus into the dropdown: to an element marked <code>data-autofocus</code>, else its first focusable element,
        else the dropdown itself. Escape or a press outside closes it and moves focus back to the target; with nested popovers,
        the innermost closes first. The dropdown renders in place, so it keeps the theme and context around it, and the top layer
        puts it above everything without a z-index.
      </p>

      <H2 id="position">Position</H2>
      <p>
        <code>position</code> is a side of the target, optionally followed by <code>-start</code> or <code>-end</code> to line up
        an edge, <code>bottom</code> by default. The dropdown flips to the other side when there's no room, slides to stay in the
        viewport, and follows the target while the page scrolls. <code>offset</code> sets the gap, 8px by default,{' '}
        <code>withArrow</code> adds an arrow pointing at the target, and <code>matchTargetWidth</code> makes the dropdown as wide
        as the target.
      </p>
      <Example component={Position} code={positionCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        Pass <code>opened</code> and <code>onChange</code> to hold the state yourself, for example to close it from a button
        inside. <code>onChange</code> is called whenever the popover would open or close itself. <code>trapFocus</code> keeps Tab
        inside the dropdown; <code>closeOnEscape</code> and <code>closeOnClickOutside</code> can be turned off.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="animation">Animation</H2>
      <p>
        The dropdown fades in and out. <code>transition</code> takes any of{' '}
        <a href={withBase('/components/transition')}>Transition</a>'s presets, or <code>none</code>, and{' '}
        <code>transitionDuration</code> sets it in milliseconds, 150 by default. Under <code>prefers-reduced-motion: reduce</code>
        , it doesn't animate.
      </p>

      <H2 id="props">Props</H2>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether it is open, for a controlled popover.' },
          { name: 'defaultOpened', type: 'boolean', default: 'false', description: 'Whether it starts open. Read once.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when it opens or closes itself.' },
          {
            name: 'position',
            type: "'top' | 'right' | 'bottom' | 'left', optionally with '-start' or '-end'",
            default: "'bottom'",
            description: 'Where the dropdown goes against the target.',
          },
          { name: 'offset', type: 'number', default: '8', description: 'Gap between the target and the dropdown, in px.' },
          { name: 'withArrow', type: 'boolean', default: 'false', description: 'Shows an arrow pointing at the target.' },
          {
            name: 'matchTargetWidth',
            type: 'boolean',
            default: 'false',
            description: 'Makes the dropdown as wide as the target.',
          },
          { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether Escape closes it.' },
          { name: 'closeOnClickOutside', type: 'boolean', default: 'true', description: 'Whether a press outside closes it.' },
          { name: 'trapFocus', type: 'boolean', default: 'false', description: 'Keeps Tab inside the dropdown.' },
          { name: 'returnFocus', type: 'boolean', default: 'true', description: 'Moves focus back to the target on close.' },
          { name: 'transition', type: 'TransitionName', default: "'fade'", description: "The dropdown's animation." },
          { name: 'transitionDuration', type: 'number', default: '150', description: 'Duration of the animation, in ms.' },
        ]}
      />
      <p>
        <code>Popover.Target</code> takes a function child, <code>(target) =&gt; JSX.Element</code>. <code>Popover.Dropdown</code>{' '}
        passes its other props to its <code>div</code>.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        The dropdown has the class <code>.slp-popover</code> and the slot <code>popover-dropdown</code>, with{' '}
        <code>data-placement</code> (the side it actually took), <code>data-status</code> and <code>data-transition</code>. The
        arrow is the slot <code>popover-arrow</code>. Rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
