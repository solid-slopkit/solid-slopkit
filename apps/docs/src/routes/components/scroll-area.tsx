import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/scroll-area/basic';
import basicCode from '../../examples/components/scroll-area/basic.tsx?raw';
import MaxHeight from '../../examples/components/scroll-area/max-height';
import maxHeightCode from '../../examples/components/scroll-area/max-height.tsx?raw';
import Directions from '../../examples/components/scroll-area/directions';
import directionsCode from '../../examples/components/scroll-area/directions.tsx?raw';
import Types from '../../examples/components/scroll-area/types';
import typesCode from '../../examples/components/scroll-area/types.tsx?raw';
import ScrollTo from '../../examples/components/scroll-area/scroll-to';
import scrollToCode from '../../examples/components/scroll-area/scroll-to.tsx?raw';

export default function ScrollAreaPage() {
  return (
    <article class="docs-page">
      <Title>ScrollArea · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>ScrollArea</h1>
      <p class="docs-lead">
        A box that scrolls its content, with thin scrollbars drawn over it that look the same in every browser and color scheme.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { ScrollArea } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Give it a <code>height</code> with <code>style</code> or <code>class</code>. The scrolling is the browser's own, so the
        wheel, touch, the keyboard and find in page all work as usual; only the scrollbars are replaced. Drag a thumb to scroll,
        or press the track to page toward the pointer. While there's something to scroll, the content takes a tab stop, so the
        arrow keys and Page Up and Page Down scroll it.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="max-height">Growing with its content</H2>
      <p>
        With <code>max-height</code> instead of <code>height</code>, it's as tall as its content up to that height, and scrolls
        past it.
      </p>
      <Example component={MaxHeight} code={maxHeightCode} />

      <H2 id="directions">Directions</H2>
      <p>
        It scrolls down and across by default, and draws a scrollbar only along a direction whose content overflows: text wraps at
        its width, and something that can't wrap, like these lines, scrolls across. <code>scrollbars="y"</code> scrolls only down
        and clips the rest, <code>scrollbars="x"</code> only across. Inside a flex or grid item, give that item{' '}
        <code>min-width: 0</code>: otherwise the item grows to the width of the content instead of letting it scroll.
      </p>
      <Example component={Directions} code={directionsCode} />

      <H2 id="types">When the scrollbars show</H2>
      <p>
        <code>type</code> is <code>hover</code> (the default: while the pointer is over it or it scrolls), <code>scroll</code>{' '}
        (only while it scrolls), <code>always</code> or <code>never</code> (it still scrolls). They fade out{' '}
        <code>scrollHideDelay</code> ms after the pointer leaves or scrolling stops, 800 by default. The scrollbars sit over the
        content's edges; <code>offsetScrollbars</code>, used here, pads the content on the side of a shown scrollbar so it isn't
        covered.
      </p>
      <Example component={Types} code={typesCode} />

      <H2 id="scroll-to">Scrolling from code</H2>
      <p>
        <code>viewportRef</code> gives the element that scrolls, for <code>scrollTo</code> and <code>scrollTop</code>, and{' '}
        <code>onScrollPositionChange</code> is called on each scroll with <code>{'{ x, y }'}</code> in px.
      </p>
      <Example component={ScrollTo} code={scrollToCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'type',
            type: "'hover' | 'scroll' | 'always' | 'never'",
            default: "'hover'",
            description: 'When the scrollbars show.',
          },
          { name: 'scrollbars', type: "'x' | 'y' | 'xy'", default: "'xy'", description: 'The directions it scrolls in.' },
          { name: 'scrollbarSize', type: 'number', default: '10', description: 'Thickness of a scrollbar, in px.' },
          {
            name: 'scrollHideDelay',
            type: 'number',
            default: '800',
            description: 'How long the scrollbars stay after the pointer leaves or scrolling stops, in ms.',
          },
          {
            name: 'offsetScrollbars',
            type: 'boolean',
            default: 'false',
            description: 'Pads the content on the side of a shown scrollbar.',
          },
          { name: 'viewportRef', type: 'Ref<HTMLDivElement>', description: 'The element that scrolls.' },
          {
            name: 'onScrollPositionChange',
            type: '(position: { x: number; y: number }) => void',
            description: 'Called as it scrolls, with the scroll offsets in px.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-scroll-area</code>, with <code>data-type</code>, <code>data-scrollbars</code> and{' '}
        <code>data-offset-scrollbars</code>, and <code>data-overflow-x</code>, <code>data-overflow-y</code> and{' '}
        <code>data-scrolling</code> while those hold. Inside it are <code>[data-slot="scroll-area-viewport"]</code> (the
        scroller), <code>[data-slot="scroll-area-content"]</code>, and a <code>[data-slot="scroll-area-scrollbar"]</code> per
        direction, with <code>data-orientation</code> and, while its thumb is dragged, <code>data-dragging</code>, holding a{' '}
        <code>[data-slot="scroll-area-thumb"]</code>. The thumb's idle, hover and pressed tints mix from{' '}
        <code>--slp-scroll-area-thumb-color</code>. The rules live in <code>@layer slopkit.components</code>, so unlayered CSS
        wins.
      </p>
    </article>
  );
}
