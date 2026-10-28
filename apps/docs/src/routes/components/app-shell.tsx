import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/app-shell/basic';
import basicCode from '../../examples/components/app-shell/basic.tsx?raw';
import Variants from '../../examples/components/app-shell/variants';
import variantsCode from '../../examples/components/app-shell/variants.tsx?raw';

const persistCode = `const [opened, setOpened] = createSignal(readCookie('sidebar') !== 'collapsed');

<AppShell
  opened={opened()}
  onChange={(next) => {
    setOpened(next);
    document.cookie = \`sidebar=\${next ? 'expanded' : 'collapsed'}; path=/; max-age=31536000\`;
  }}
>
  …
</AppShell>;`;

const hookCode = `function CloseOnNavigate() {
  const shell = useAppShell();
  const location = useLocation();
  createEffect(
    () => location.pathname,
    () => shell.setMobileOpened(false),
  );
  return null;
}`;

export default function AppShellPage() {
  return (
    <article class="docs-page">
      <Title>AppShell · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>AppShell</h1>
      <p class="docs-lead">
        The frame of an app: a sidebar of navigation next to the main area. On a wide screen the sidebar collapses, off the canvas
        or down to its icons; on a narrow one it opens as a drawer over the page.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { AppShell, useAppShell } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Put one <code>AppShell.Sidebar</code> and one <code>AppShell.Main</code> in an <code>AppShell</code>. The sidebar holds a
        header and a footer that stay put and content that scrolls between them. The content holds groups, each with an optional{' '}
        <code>label</code> that names it, and a group holds a menu of rows. The shell is at least as tall as the viewport, and the
        sidebar sticks to the top as the page scrolls; this example frames it with <code>--slp-app-shell-height</code>.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="collapsing">Collapsing</H2>
      <p>
        <code>AppShell.Trigger</code>, <code>AppShell.Rail</code> (a strip along the sidebar's inner edge, for the pointer) and
        the shortcut, <code>mod+B</code> (⌘B or Ctrl+B), toggle it. <code>collapsible</code> says what collapsing does:{' '}
        <code>offcanvas</code>, the default, slides the sidebar out of the layout and out of the tab order; <code>icon</code>{' '}
        shrinks it to a column of icons; <code>none</code> keeps it expanded. Collapsed to icons, a row is a square around its
        icon, its label hidden from sight but still its accessible name, and its <code>tooltip</code> shows beside it on hover and
        keyboard focus. Group labels fade out, and actions, badges and sub menus hide.
      </p>
      <p>
        <code>variant</code> is <code>sidebar</code> (a panel with a border), <code>floating</code> (a card with a gap around it)
        or <code>inset</code> (part of the background, with the main area as a raised card). <code>position</code> puts it on the{' '}
        <code>left</code> or the <code>right</code>.
      </p>
      <Example component={Variants} code={variantsCode} />

      <H2 id="narrow-screens">Narrow screens</H2>
      <p>
        Below 48em the sidebar leaves the layout, and the trigger opens it as a modal drawer from its edge, in the browser's top
        layer: focus moves in and stays inside, the rest of the shell is inert and the page doesn't scroll. Escape, a press on the
        backdrop and a press on a link inside close it, and focus goes back to the trigger. Narrow this window to try it on the
        examples above. Its accessible name is <code>label</code>, <code>'Sidebar'</code> by default.
      </p>

      <H2 id="rows">Rows</H2>
      <p>
        <code>AppShell.MenuButton</code> is a link with <code>href</code> and a button without; <code>as</code> renders another
        link component. <code>icon</code> goes before the label, and the label can hold more than text, such as two lines and a
        chevron. The router marks the current page: <code>@solidjs/router</code> sets <code>data-active</code>, drawn highlighted,
        on a row that links to the current page or to a parent of it, and <code>aria-current="page"</code> on one that links to
        exactly the current page, so give each row its own path. A button row has no address, so without the router, or for a
        button, set <code>data-active</code> yourself. Next to it in its <code>AppShell.MenuItem</code> go an{' '}
        <code>AppShell.MenuAction</code> (an icon button; <code>showOnHover</code> shows it only while the row is hovered or has
        focus inside), an <code>AppShell.MenuBadge</code>, or an <code>AppShell.MenuSub</code>, an indented list of{' '}
        <code>AppShell.MenuSubButton</code>s. To open a sub menu from its row, give the row's button <code>aria-expanded</code>{' '}
        and render the sub menu while it's open.
      </p>

      <H2 id="state">State</H2>
      <p>
        <code>defaultOpened</code> (<code>true</code> by default) or <code>opened</code> with <code>onChange</code> set whether
        the sidebar is expanded on a wide screen. To keep it across page loads, store it in a cookie that the server reads, so the
        first render is already right:
      </p>
      <CodeBlock code={persistCode} />
      <p>
        The drawer has its own state, which starts closed. <code>useAppShell()</code>, anywhere inside the shell, reads and
        changes both: <code>opened</code>, <code>setOpened</code>, <code>mobile</code> (whether the screen is narrow,{' '}
        <code>false</code> on the server), <code>mobileOpened</code>, <code>setMobileOpened</code> and <code>toggle()</code>. For
        example, to close the drawer whenever the route changes:
      </p>
      <CodeBlock code={hookCode} />

      <H2 id="props">Props</H2>
      <h3>AppShell</h3>
      <PropsTable
        rows={[
          { name: 'opened', type: 'boolean', description: 'Whether the sidebar is expanded on a wide screen.' },
          { name: 'defaultOpened', type: 'boolean', default: 'true', description: 'Whether it starts expanded.' },
          { name: 'onChange', type: '(opened: boolean) => void', description: 'Called when it asks to expand or collapse.' },
          {
            name: 'shortcut',
            type: 'string | readonly string[] | null',
            default: "'mod+B'",
            description: 'The keys that toggle it from anywhere; null for none.',
          },
        ]}
      />
      <h3>AppShell.Sidebar</h3>
      <PropsTable
        rows={[
          { name: 'position', type: "'left' | 'right'", default: "'left'", description: 'The edge it sits against.' },
          { name: 'variant', type: "'sidebar' | 'floating' | 'inset'", default: "'sidebar'", description: 'How it looks.' },
          {
            name: 'collapsible',
            type: "'offcanvas' | 'icon' | 'none'",
            default: "'offcanvas'",
            description: 'What collapsing does on a wide screen.',
          },
          { name: 'label', type: 'string', default: "'Sidebar'", description: 'Accessible name of the drawer.' },
          {
            name: 'closeOnLinkClick',
            type: 'boolean',
            default: 'true',
            description: 'Whether a press on a link inside closes the drawer.',
          },
        ]}
      />
      <h3>AppShell.MenuButton and AppShell.MenuSubButton</h3>
      <PropsTable
        rows={[
          { name: 'href', type: 'string', description: "Makes it a link; without it, it's a button." },
          { name: 'as', type: 'ValidComponent', description: 'Renders another link component.' },
          { name: 'icon', type: 'JSX.Element', description: 'An icon before the label.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Keeps it from being followed or pressed.' },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Row height; a sub button takes sm or md.',
          },
          { name: 'tooltip', type: 'JSX.Element', description: 'MenuButton only: shown beside it while only icons show.' },
        ]}
      />
      <p>
        <code>AppShell.Group</code> takes <code>label</code>. <code>AppShell.GroupAction</code> and{' '}
        <code>AppShell.MenuAction</code> require a <code>label</code>, their accessible name; MenuAction also takes{' '}
        <code>showOnHover</code>. <code>AppShell.Trigger</code> takes <code>label</code> (<code>'Toggle sidebar'</code>),{' '}
        <code>variant</code>, <code>color</code>, <code>size</code> and <code>disabled</code>, and its children replace the icon.{' '}
        <code>AppShell.Main</code> is a <code>main</code>, or another element through <code>as</code>. Other props go to each
        part's element.
      </p>

      <H2 id="styling">Styling</H2>
      <p>
        Each part has its own class: <code>.slp-app-shell</code>, <code>.slp-app-shell-sidebar</code>,{' '}
        <code>-sidebar-header</code>, <code>-sidebar-content</code>, <code>-sidebar-footer</code>, <code>-group</code>,{' '}
        <code>-group-action</code>, <code>-menu</code>, <code>-menu-item</code>, <code>-menu-button</code>,{' '}
        <code>-menu-action</code>, <code>-menu-badge</code>, <code>-menu-sub</code>, <code>-menu-sub-item</code>,{' '}
        <code>-menu-sub-button</code>, <code>-trigger</code>, <code>-rail</code> and <code>-main</code>. The sidebar has{' '}
        <code>data-state</code>, <code>data-position</code>, <code>data-variant</code>, <code>data-collapsible</code> and{' '}
        <code>data-status</code>, and on a narrow screen a <code>::backdrop</code>; its visible panel is the slot{' '}
        <code>app-shell-sidebar-panel</code>. Rows have <code>data-size</code>, <code>data-active</code> (set by the router) and{' '}
        <code>data-disabled</code>, and the slots <code>app-shell-menu-button-icon</code> and{' '}
        <code>app-shell-menu-button-label</code> (<code>menu-sub-button</code> for sub rows). The custom properties{' '}
        <code>--slp-app-shell-height</code>, <code>--slp-app-shell-sidebar-width</code>,{' '}
        <code>--slp-app-shell-sidebar-width-icon</code> and <code>--slp-app-shell-drawer-width</code> set its sizes. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
