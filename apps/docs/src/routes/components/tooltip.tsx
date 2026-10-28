import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/tooltip/basic';
import basicCode from '../../examples/components/tooltip/basic.tsx?raw';
import Position from '../../examples/components/tooltip/position';
import positionCode from '../../examples/components/tooltip/position.tsx?raw';
import Colors from '../../examples/components/tooltip/colors';
import colorsCode from '../../examples/components/tooltip/colors.tsx?raw';
import Controlled from '../../examples/components/tooltip/controlled';
import controlledCode from '../../examples/components/tooltip/controlled.tsx?raw';

export default function TooltipPage() {
  return (
    <article class="docs-page">
      <Title>Tooltip · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Tooltip</h1>
      <p class="docs-lead">
        A short description of its target, shown in the browser's top layer while the target is hovered or has keyboard focus.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Tooltip } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The child is a function that gets the target's attributes: spread them on one focusable element, usually a button or a
        link. They carry a ref, the pointer and focus handlers, and <code>aria-describedby</code>, which points at the tooltip.
        The tooltip describes its target rather than naming it, so an icon-only button still needs its own name, such as an
        ActionIcon's <code>label</code>.
      </p>
      <Example component={Basic} code={basicCode} />
      <p>
        Hovering with a mouse or pen shows it, after <code>openDelay</code> (0 by default), and so does keyboard focus; a click or
        a tap doesn't. Once the pointer leaves, it hides after <code>closeDelay</code> (100ms by default), the time the pointer
        has to move onto the tooltip: hovering the tooltip keeps it shown, so it can be read under a magnifier. Blurring the
        target hides it, and so does Escape, which goes to the innermost overlay first.
      </p>

      <H2 id="position">Position</H2>
      <p>
        <code>position</code> is a side of the target, optionally followed by <code>-start</code> or <code>-end</code>,{' '}
        <code>top</code> by default. It flips when there's no room, slides to stay in the viewport, and follows the target while
        the page scrolls. <code>offset</code> sets the gap, 6px by default, and <code>withArrow</code> adds an arrow.
      </p>
      <Example component={Position} code={positionCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role for the background, <code>neutral</code> by default, and the text uses its content
        color. For a color outside the roles, set <code>--slp-tooltip-color</code> and <code>--slp-tooltip-content</code>.
      </p>
      <Example component={Colors} code={colorsCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        Pass <code>opened</code> and <code>onChange</code> to hold the state yourself, for example to show a confirmation after a
        click. <code>onChange</code> is called whenever the tooltip would show or hide itself. <code>disabled</code> never shows
        it.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="disabled-targets">Disabled targets</H2>
      <p>
        A disabled button gets no pointer events and can't be focused, so it can't show a tooltip. Spread the target's attributes
        on a <code>span</code> around it with <code>tabindex="0"</code> instead.
      </p>

      <H2 id="animation">Animation</H2>
      <p>
        <code>transition</code> takes Transition's presets, <code>fade</code> by default, and <code>transitionDuration</code> its
        length, 100ms by default. Under <code>prefers-reduced-motion: reduce</code>, it shows and hides at once.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props go to the tooltip's <code>span</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'JSX.Element', description: "The tooltip's content." },
          {
            name: 'children',
            type: '(target) => JSX.Element',
            description: 'Renders the target with the attributes spread on it.',
          },
          { name: 'opened', type: 'boolean', description: 'Whether it is shown, for a controlled tooltip.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when it would show or hide itself.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Never shows it.' },
          { name: 'position', type: 'TooltipPosition', default: "'top'", description: 'Where it goes against the target.' },
          { name: 'offset', type: 'number', default: '6', description: 'Gap between the target and the tooltip, in px.' },
          { name: 'withArrow', type: 'boolean', default: 'false', description: 'Shows an arrow pointing at the target.' },
          { name: 'color', type: 'SlopColor', default: "'neutral'", description: 'Color role of its background.' },
          { name: 'openDelay', type: 'number', default: '0', description: 'Delay before showing it on hover, in ms.' },
          {
            name: 'closeDelay',
            type: 'number',
            default: '100',
            description: 'Delay before hiding it once the pointer has left, in ms.',
          },
          { name: 'transition', type: 'TransitionName', default: "'fade'", description: 'Its animation.' },
          { name: 'transitionDuration', type: 'number', default: '100', description: 'Duration of the animation, in ms.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The tooltip has the class <code>.slp-tooltip</code>, with <code>data-color</code>, <code>data-placement</code> (the side
        it took, after flipping), <code>data-status</code> and <code>data-transition</code>. The arrow is{' '}
        <code>[data-slot="tooltip-arrow"]</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
