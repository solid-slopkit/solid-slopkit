import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/carousel/basic';
import basicCode from '../../examples/components/carousel/basic.tsx?raw';
import Sizes from '../../examples/components/carousel/sizes';
import sizesCode from '../../examples/components/carousel/sizes.tsx?raw';
import Vertical from '../../examples/components/carousel/vertical';
import verticalCode from '../../examples/components/carousel/vertical.tsx?raw';
import Api from '../../examples/components/carousel/api';
import apiCode from '../../examples/components/carousel/api.tsx?raw';

export default function CarouselPage() {
  return (
    <article class="docs-page">
      <Title>Carousel · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Carousel</h1>
      <p class="docs-lead">
        Slides in a row or a column, moved through by dragging, with the buttons, the arrow keys or the indicators. The slides lay
        out with CSS on the server; the engine starts in the browser.
      </p>

      <H2 id="import">Import</H2>
      <p>
        Carousel has its own entry, because its engine, <code>embla-carousel</code>, is an optional peer dependency. Install it
        next to the package; apps that don't use Carousel never need it.
      </p>
      <CodeBlock code={`pnpm add embla-carousel`} />
      <CodeBlock code={`import { Carousel } from '@solid-slopkit/components/carousel';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Put <code>Carousel.Slide</code> children in it and name it with <code>aria-label</code>. The previous and next buttons are
        on by default; <code>withIndicators</code> adds a button per step. With the focus inside it, the arrow keys step too.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="sizes">Slide size and gap</H2>
      <p>
        <code>slideSize</code> is each slide's size along the carousel, as a length or a percentage; <code>slideGap</code> is the
        space between slides, in spacing units. For a size per breakpoint, override the <code>flex-basis</code> of{' '}
        <code>.slp-carousel-slide</code> in your CSS.
      </p>
      <Example component={Sizes} code={sizesCode} />

      <H2 id="vertical">Vertical</H2>
      <p>
        With <code>orientation="vertical"</code> the slides stack, and Up and Down step. Give the carousel a height.{' '}
        <code>loop</code> goes on from the last slide to the first.
      </p>
      <Example component={Vertical} code={verticalCode} />

      <H2 id="api">Your own controls</H2>
      <p>
        <code>apiRef</code> gets the engine's API once it runs, and <code>onSlideChange</code> the selected step. Engine plugins,
        such as autoplay, go in <code>plugins</code>; other engine options in <code>emblaOptions</code>.
      </p>
      <Example component={Api} code={apiCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        The root is a <code>section</code> that screen readers call a carousel, and each slide a group called a slide, named{' '}
        <code>2 of 5</code>. The slides are a polite live region. At an end, the previous or next button hides and turns{' '}
        <code>aria-disabled</code>, keeping the focus. Every built-in string is a prop, listed below.
      </p>

      <H2 id="props">Props</H2>
      <p>Other props are passed to the root section.</p>
      <PropsTable
        rows={[
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: 'Which way the slides run. Vertical needs a height.',
          },
          { name: 'slideSize', type: 'string', default: "'100%'", description: "Each slide's size along the carousel." },
          { name: 'slideGap', type: 'number', default: '0', description: 'Space between slides, in spacing units.' },
          {
            name: 'align',
            type: "'start' | 'center' | 'end'",
            default: "'start'",
            description: 'Where the selected slide rests.',
          },
          { name: 'loop', type: 'boolean', default: 'false', description: 'From the last slide on to the first.' },
          { name: 'slidesToScroll', type: "number | 'auto'", default: '1', description: 'Slides per step.' },
          { name: 'dragFree', type: 'boolean', default: 'false', description: 'A drag glides and stops anywhere.' },
          { name: 'draggable', type: 'boolean', default: 'true', description: 'Slides can be dragged.' },
          { name: 'initialSlide', type: 'number', default: '0', description: 'The slide shown first. Read once.' },
          { name: 'emblaOptions', type: 'EmblaOptionsType', description: 'More engine options; they win.' },
          { name: 'plugins', type: 'EmblaPluginType[]', description: 'Engine plugins. Read once.' },
          { name: 'apiRef', type: '(api: EmblaCarouselType) => void', description: "Gets the engine's API in the browser." },
          { name: 'onSlideChange', type: '(index: number) => void', description: 'Called with the selected step.' },
          { name: 'withControls', type: 'boolean', default: 'true', description: 'Previous and next buttons.' },
          { name: 'withIndicators', type: 'boolean', default: 'false', description: 'A button per step.' },
          { name: 'previousLabel', type: 'string', default: "'Previous slide'", description: "The previous button's name." },
          { name: 'nextLabel', type: 'string', default: "'Next slide'", description: "The next button's name." },
          {
            name: 'indicatorLabel',
            type: '(index: number, count: number) => string',
            default: 'Go to slide 2',
            description: "An indicator's name.",
          },
          {
            name: 'slideLabel',
            type: '(index: number, count: number) => string',
            default: '2 of 5',
            description: "A slide's name.",
          },
          {
            name: 'roleDescription',
            type: 'string',
            default: "'carousel'",
            description: 'What assistive tech calls the carousel.',
          },
          {
            name: 'slideRoleDescription',
            type: 'string',
            default: "'slide'",
            description: 'What assistive tech calls a slide.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The roots have the classes <code>.slp-carousel</code> (with <code>data-orientation</code>) and{' '}
        <code>.slp-carousel-slide</code>. The parts are <code>carousel-viewport</code>, <code>carousel-container</code>,{' '}
        <code>carousel-slide</code>, <code>carousel-controls</code>, <code>carousel-previous</code> and <code>carousel-next</code>{' '}
        (with <code>data-disabled</code>), <code>carousel-indicators</code> and <code>carousel-indicator</code> (with{' '}
        <code>data-active</code>). Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
