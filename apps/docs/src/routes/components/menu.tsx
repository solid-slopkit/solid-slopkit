import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/menu/basic';
import basicCode from '../../examples/components/menu/basic.tsx?raw';
import Links from '../../examples/components/menu/links';
import linksCode from '../../examples/components/menu/links.tsx?raw';

export default function MenuPage() {
  return (
    <article class="docs-page">
      <Title>Menu · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Menu</h1>
      <p class="docs-lead">A list of actions behind a button, in the browser's top layer.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Menu } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Build it from <code>Menu.Target</code> and <code>Menu.Dropdown</code>, with <code>Menu.Item</code>,{' '}
        <code>Menu.Label</code> and <code>Menu.Divider</code> inside. The target's child is a function that gets the target's
        attributes: spread them on the button that opens it. They carry a ref, an <code>id</code> that labels the menu, the click
        and keys that open it, and <code>aria-haspopup</code>, <code>aria-expanded</code> and <code>aria-controls</code>.
      </p>
      <Example component={Basic} code={basicCode} />
      <p>
        Items take a <code>leftSection</code>, such as an icon, and a <code>rightSection</code>, such as a shortcut;{' '}
        <code>color</code> sets their text to a color role, and <code>disabled</code> takes them out of the way. Choosing one runs
        its <code>onClick</code> and closes the menu, unless the handler calls <code>event.preventDefault()</code>, or{' '}
        <code>closeMenuOnClick</code> (or the menu's <code>closeOnItemClick</code>) is off.
      </p>

      <H2 id="keyboard">Keyboard</H2>
      <p>
        Enter, Space or ArrowDown on the target open it on the first item, and ArrowUp on the last; a click opens it with focus on
        the menu. ArrowUp and ArrowDown move between items, skipping disabled ones and wrapping around unless <code>loop</code> is
        off. Home and End go to the first and last, and typing jumps to the item whose label starts with it. The pointer moves
        focus too, so the keyboard picks up where it is. Choosing an item, Escape, or a press outside close it and move focus back
        to the target; Tab closes it and moves on.
      </p>

      <H2 id="links">Links</H2>
      <p>
        <code>as="a"</code> renders an item as a link, or pass a router's link component. Here the target is an ActionIcon, and
        the menu lines up with its end.
      </p>
      <Example component={Links} code={linksCode} />

      <H2 id="position">Position and animation</H2>
      <p>
        <code>position</code> is a side of the target, optionally followed by <code>-start</code> or <code>-end</code>,{' '}
        <code>bottom-start</code> by default. The dropdown flips when there's no room, slides to stay in the viewport, and follows
        the target while the page scrolls. <code>offset</code> sets the gap, 4px by default, and <code>withArrow</code> adds an
        arrow. <code>transition</code> takes Transition's presets, <code>fade</code> by default, and{' '}
        <code>transitionDuration</code> its length, 150ms by default.
      </p>

      <H2 id="props">Props</H2>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether it is open, for a controlled menu.' },
          { name: 'defaultOpened', type: 'boolean', default: 'false', description: 'Whether it starts open. Read once.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when it opens or closes itself.' },
          { name: 'position', type: 'MenuPosition', default: "'bottom-start'", description: 'Where the dropdown goes.' },
          { name: 'offset', type: 'number', default: '4', description: 'Gap between the target and the dropdown, in px.' },
          { name: 'withArrow', type: 'boolean', default: 'false', description: 'Shows an arrow pointing at the target.' },
          { name: 'closeOnItemClick', type: 'boolean', default: 'true', description: 'Whether choosing an item closes it.' },
          { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether Escape closes it.' },
          { name: 'closeOnClickOutside', type: 'boolean', default: 'true', description: 'Whether a press outside closes it.' },
          { name: 'loop', type: 'boolean', default: 'true', description: 'Whether the arrow keys wrap around.' },
          { name: 'transition', type: 'TransitionName', default: "'fade'", description: "The dropdown's animation." },
          { name: 'transitionDuration', type: 'number', default: '150', description: 'Duration of the animation, in ms.' },
        ]}
      />
      <h3>Menu.Item</h3>
      <PropsTable
        rows={[
          { name: 'as', type: 'ValidComponent', default: "'button'", description: 'The element or component it renders.' },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the label, such as an icon.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the label, such as a shortcut.' },
          { name: 'color', type: 'SlopColor', description: 'Color role of its text.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: "Whether it can't be chosen." },
          { name: 'closeMenuOnClick', type: 'boolean', description: 'Whether choosing it closes the menu, for this one.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The dropdown has the class <code>.slp-menu</code> and <code>[data-slot="menu-dropdown"]</code>, with{' '}
        <code>data-placement</code>, <code>data-status</code> and <code>data-transition</code>; the arrow is{' '}
        <code>[data-slot="menu-arrow"]</code>. Items are <code>.slp-menu-item</code>, with <code>data-color</code> and{' '}
        <code>data-disabled</code>, and match <code>:focus</code> while focused; inside them are{' '}
        <code>[data-slot="menu-item-label"]</code> and <code>[data-slot="menu-item-section"]</code> with{' '}
        <code>data-position</code>. Labels and dividers are <code>.slp-menu-label</code> and <code>.slp-menu-divider</code>. Their
        rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
