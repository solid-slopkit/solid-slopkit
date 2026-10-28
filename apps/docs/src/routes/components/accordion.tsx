import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/accordion/basic';
import basicCode from '../../examples/components/accordion/basic.tsx?raw';
import Multiple from '../../examples/components/accordion/multiple';
import multipleCode from '../../examples/components/accordion/multiple.tsx?raw';
import Variants from '../../examples/components/accordion/variants';
import variantsCode from '../../examples/components/accordion/variants.tsx?raw';

export default function AccordionPage() {
  return (
    <article class="docs-page">
      <Title>Accordion · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Accordion</h1>
      <p class="docs-lead">Sections whose content shows and hides under their headings: one open at a time, or several.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Accordion } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Each <code>Accordion.Item</code> has a <code>value</code>, an <code>Accordion.Control</code> and an{' '}
        <code>Accordion.Panel</code>. The control is a button in a heading; a click opens its panel and closes the one that was
        open. The panel grows to its height in CSS, and stays in the page while closed, hidden from the keyboard and screen
        readers, so its content keeps its state. Up and Down move between the controls, Home and End to the ends. A control takes
        an <code>icon</code>, and a disabled one stays as it is.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="multiple">Several open at once</H2>
      <p>
        With <code>multiple</code>, any number of items can be open, and the value is an array. Controlled here with{' '}
        <code>value</code> and <code>onChange</code>. <code>variant="separated"</code> draws each item as a card, and{' '}
        <code>chevronPosition="left"</code> puts the chevron first.
      </p>
      <Example component={Multiple} code={multipleCode} />

      <H2 id="variants">Variants and chevron</H2>
      <p>
        <code>divided</code> (the default) draws a line under each item, <code>bordered</code> one rounded box, and{' '}
        <code>separated</code> a card for each. <code>chevron</code> replaces the chevron with your own icon, which turns as the
        item opens unless <code>disableChevronRotation</code>. <code>order</code> sets the headings' level, 3 by default, to fit
        the page's outline.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        Accordion passes other props to its <code>div</code>. <code>Accordion.Item</code> takes <code>value</code>;{' '}
        <code>Accordion.Control</code> takes <code>icon</code> and <code>disabled</code> and passes the rest to its button;{' '}
        <code>Accordion.Panel</code> passes its props to its <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Lets several items be open. Read once.' },
          {
            name: 'value',
            type: 'string | null, or string[] with multiple',
            description: 'The open item or items, when controlled.',
          },
          {
            name: 'defaultValue',
            type: 'string | null, or string[] with multiple',
            default: 'none',
            description: 'The open item or items at first.',
          },
          {
            name: 'onChange',
            type: '(value: string | null) => void, or (value: string[]) => void',
            description: 'Called when an item opens or closes.',
          },
          {
            name: 'variant',
            type: "'divided' | 'bordered' | 'separated'",
            default: "'divided'",
            description: 'How the items are drawn.',
          },
          { name: 'order', type: '2 | 3 | 4 | 5 | 6', default: '3', description: 'The heading level of the controls.' },
          {
            name: 'chevronPosition',
            type: "'left' | 'right'",
            default: "'right'",
            description: 'Which side of the control the chevron is on.',
          },
          { name: 'chevron', type: 'JSX.Element', default: 'a chevron', description: 'Replaces the chevron.' },
          { name: 'disableChevronRotation', type: 'boolean', default: 'false', description: 'Keeps the chevron still.' },
          { name: 'loop', type: 'boolean', default: 'true', description: 'Whether the arrows wrap around.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-accordion</code> with <code>data-variant</code>; inside are <code>.slp-accordion-item</code>,{' '}
        <code>.slp-accordion-control</code> and <code>.slp-accordion-panel</code>, each with <code>data-opened</code> while open.
        The control sits in a <code>[data-slot="accordion-heading"]</code> and holds <code>[data-slot="accordion-chevron"]</code>,{' '}
        <code>[data-slot="accordion-icon"]</code> and <code>[data-slot="accordion-label"]</code>; the panel holds{' '}
        <code>[data-slot="accordion-panel-body"]</code>, which has the padding. <code>--slp-accordion-radius</code> sets the
        corners and <code>--slp-accordion-transition-duration</code> the animation. The rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
