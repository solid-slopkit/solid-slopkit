import { For } from 'solid-js';
import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { H2 } from '../../components/Heading';
import { components as nav } from '../../nav/components';
import { withBase } from '../../base';

// The same groups as the sidebar, so the two never drift apart.
const componentGroups = nav.find((section) => section.title === 'Components')?.groups ?? [];

export default function ComponentsOverview() {
  return (
    <article class="docs-page">
      <Title>Components · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Overview</h1>
      <p class="docs-lead">
        <code>@solid-slopkit/components</code> is a component library for SolidJS 2, styled with plain CSS and CSS variables. No
        CSS-in-JS and no utility framework.
      </p>

      <H2 id="installation">Installation</H2>
      <p>
        Install <code>@solid-slopkit/components</code> from npm.
      </p>
      <CodeBlock lang="bash" code="pnpm add @solid-slopkit/components" />
      <p>
        It needs <code>solid-js</code> and <code>@solidjs/web</code> 2.x. The package ships uncompiled JSX, so the app must
        compile it with <code>@solidjs/vite-plugin</code>, the same way it compiles its own components.
      </p>

      <H2 id="styles">Styles</H2>
      <p>
        Import the base styles and a theme once, at the root of your app. The base file declares the cascade layers and color
        palettes. The theme sets the <code>--slp-color-*</code> tokens components read.
      </p>
      <CodeBlock
        code={`import '@solid-slopkit/components/styles/slopkit.css';
import '@solid-slopkit/components/styles/default-theme.css';`}
      />
      <p>
        Everything lives in <code>@layer slopkit.*</code> cascade layers, so your own unlayered CSS always wins without
        specificity fights.
      </p>

      <H2 id="usage">Usage</H2>
      <p>
        Wrap the app in <code>&lt;SlopkitUi&gt;</code> once. Components that generate CSS at runtime, such as Box, add it there.
      </p>
      <CodeBlock
        code={`import { SlopkitUi } from '@solid-slopkit/components';

export function Root() {
  return <SlopkitUi>{/* your app */}</SlopkitUi>;
}`}
      />
      <CodeBlock
        code={`import { Button } from '@solid-slopkit/components';

export function Toolbar() {
  return <Button color="primary">Save</Button>;
}`}
      />

      <H2 id="server-rendering">Server rendering in development</H2>
      <p>
        If the app renders on the server with the Vite dev server, through <code>@solidjs/vite-plugin</code> in start mode (
        <code>solid(&#123; start: true, ssr: true &#125;)</code>), every component is unstyled for about a second after each
        reload in dev. In dev, the plugin inlines the CSS it finds in the server module graph into <code>&lt;head&gt;</code>, but
        it skips <code>node_modules</code> by default. The two stylesheets above are inlined because the app imports them itself.
        Each component's own CSS module is imported from inside the package, so it only arrives once the client JS has loaded.
      </p>
      <p>
        Add the package to the crawl in <code>vite.config.ts</code>. Everything else in <code>node_modules</code> stays excluded.
        The object enables start mode too, so it replaces <code>start: true</code>.
      </p>
      <CodeBlock
        code={`solid({
  start: { css: { filter: { include: /@solid-slopkit\\/components/ } } },
  ssr: true,
  // …the app's other options
}),`}
      />
      <p>
        Production builds link the component CSS in the page's head, and client-only apps don't inline CSS at all, so neither
        needs this.
      </p>

      <H2 id="components">Components</H2>
      <For each={componentGroups}>
        {(group) => (
          <>
            <h3>{group.title}</h3>
            <ul>
              <For each={group.items}>
                {(item) => (
                  <li>
                    <a href={withBase(item.href)}>{item.title}</a>
                  </li>
                )}
              </For>
            </ul>
          </>
        )}
      </For>
    </article>
  );
}
