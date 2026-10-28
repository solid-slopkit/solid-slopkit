import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/nav-link/basic';
import basicCode from '../../examples/components/nav-link/basic.tsx?raw';
import Nested from '../../examples/components/nav-link/nested';
import nestedCode from '../../examples/components/nav-link/nested.tsx?raw';
import Variants from '../../examples/components/nav-link/variants';
import variantsCode from '../../examples/components/nav-link/variants.tsx?raw';

export default function NavLinkPage() {
  return (
    <article class="docs-page">
      <Title>NavLink · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>NavLink</h1>
      <p class="docs-lead">A link in a navigation list, such as a sidebar, with the current page's link drawn in its color.</p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { NavLink } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A row as wide as its container: <code>label</code>, a smaller <code>description</code> under it, and a section on each
        side. The router marks the current page: <code>@solidjs/router</code> sets <code>data-active</code> on a link to the
        current page or to a parent of it, drawn in <code>color</code>, and <code>aria-current="page"</code> on a link to exactly
        the current page. Since a link to a parent path is drawn as current on its child pages too, give each link its own path.
        Without the router, set <code>data-active</code> and <code>aria-current="page"</code> on the current link yourself. A{' '}
        <code>disabled</code> link has no address, so the router never marks it. <code>as</code> renders another link component
        instead of an <code>a</code>. Put the links in a <code>nav</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="nested">Nested links</H2>
      <p>
        Given children, a NavLink is a <code>button</code> that shows and hides them, indented under it, with a chevron that turns
        as it opens. It doesn't navigate itself. Use <code>defaultOpened</code> to start open, or <code>opened</code> and{' '}
        <code>onChange</code> to control it.
      </p>
      <Example component={Nested} code={nestedCode} />

      <H2 id="variants">Variants and colors</H2>
      <p>
        The current page's link is tinted with its color (<code>soft</code>) or filled with it (<code>solid</code>).
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props go to the link, or to a parent's <code>button</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'label', type: 'JSX.Element', description: "The link's text." },
          { name: 'description', type: 'JSX.Element', description: 'A second, smaller line under the label.' },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the label, usually an icon.' },
          { name: 'rightSection', type: 'JSX.Element', description: 'Content after the label, such as a count.' },
          { name: 'variant', type: "'soft' | 'solid'", default: "'soft'", description: "How the current page's link is drawn." },
          { name: 'color', type: 'SlopColor', default: "'primary'", description: "The current page's link's color role." },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Keeps it from being followed or opened.' },
          { name: 'noWrap', type: 'boolean', default: 'false', description: 'Cuts long text with an ellipsis.' },
          { name: 'as', type: 'ValidComponent', default: "'a'", description: 'Renders another link component.' },
          { name: 'children', type: 'JSX.Element', description: 'Nested NavLinks, which make it a parent.' },
          { name: 'opened', type: 'boolean', description: "Whether a parent's children show, when controlled." },
          { name: 'defaultOpened', type: 'boolean', default: 'false', description: 'Whether they show at first.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when a parent is pressed.' },
          { name: 'chevron', type: 'JSX.Element', description: "Replaces a parent's chevron." },
          { name: 'disableChevronRotation', type: 'boolean', default: 'false', description: 'Keeps the chevron still.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root is <code>.slp-nav-link</code> (the link, or a parent's button), with <code>data-active</code> (set by the
        router), <code>data-variant</code>, <code>data-color</code>, <code>data-disabled</code>, <code>data-no-wrap</code> and, on
        a parent, <code>data-opened</code> and <code>data-rotate</code> (unless <code>disableChevronRotation</code>). Inside are{' '}
        <code>[data-slot="nav-link-left-section"]</code>, <code>nav-link-body</code> holding <code>nav-link-label</code> and{' '}
        <code>nav-link-description</code>, <code>nav-link-right-section</code> and a parent's <code>nav-link-chevron</code>. A
        parent's children follow it in <code>.slp-nav-link-children</code>, whose <code>nav-link-children-body</code> sets the
        indent. <code>--slp-nav-link-color</code> and <code>--slp-nav-link-content</code> set the current link's colors. The rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
