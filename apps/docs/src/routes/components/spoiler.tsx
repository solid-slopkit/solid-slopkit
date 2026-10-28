import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/spoiler/basic';
import basicCode from '../../examples/components/spoiler/basic.tsx?raw';
import Fits from '../../examples/components/spoiler/fits';
import fitsCode from '../../examples/components/spoiler/fits.tsx?raw';
import Controlled from '../../examples/components/spoiler/controlled';
import controlledCode from '../../examples/components/spoiler/controlled.tsx?raw';

export default function SpoilerPage() {
  return (
    <article class="docs-page">
      <Title>Spoiler · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Spoiler</h1>
      <p class="docs-lead">Content cut to a height, with a control under it that shows the rest and hides it again.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Spoiler } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Collapsed, the content is cut to <code>maxHeight</code> (100px by default) and fades out at the bottom; expanded, it's as
        tall as its content. The height animates in CSS. The control is a link-style button with <code>aria-expanded</code> and{' '}
        <code>aria-controls</code>. The cut content stays readable by screen readers and reachable with Tab: when focus goes below
        the fold, the Spoiler expands so the focused element is never hidden.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="fits">Content that fits</H2>
      <p>
        Content no taller than <code>maxHeight</code> isn't cut and has no control. It's measured whenever its size changes, so
        the control appears as it grows here. <code>showLabel</code> and <code>hideLabel</code> set the control's text.
      </p>
      <Example component={Fits} code={fitsCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        Pass <code>expanded</code> and update it from <code>onChange</code>, which is called with the state the control, or focus
        below the fold, asks for. <code>defaultExpanded</code> starts an uncontrolled one expanded.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>div</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'maxHeight', type: 'number', default: '100', description: 'Height of the content while collapsed, in px.' },
          { name: 'expanded', type: 'boolean', description: "Whether it's expanded, when controlled." },
          {
            name: 'defaultExpanded',
            type: 'boolean',
            default: 'false',
            description: 'Whether it starts expanded, when uncontrolled.',
          },
          {
            name: 'onChange',
            type: '(expanded: boolean) => void',
            description: 'Called with the state the control or focus asks for.',
          },
          { name: 'showLabel', type: 'string', default: "'Show more'", description: "The control's text while collapsed." },
          { name: 'hideLabel', type: 'string', default: "'Show less'", description: "The control's text while expanded." },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-spoiler</code>, with <code>data-expanded</code>, and <code>data-overflowing</code> while
        the content is taller than <code>maxHeight</code>. Inside it are <code>[data-slot="spoiler-content"]</code>, the box
        that's cut, holding <code>[data-slot="spoiler-body"]</code>, and <code>[data-slot="spoiler-control"]</code>, which is also
        an <code>.slp-anchor</code>. Retime the animation or drop the fade on the content slot:
      </p>
      <CodeBlock code={`.slp-spoiler [data-slot='spoiler-content'] {\n  transition-duration: 400ms;\n  mask-image: none;\n}`} />
      <p>
        The rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
