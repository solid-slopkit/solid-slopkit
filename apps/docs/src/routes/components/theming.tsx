import { For } from 'solid-js';
import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { H2 } from '../../components/Heading';
import { CssVarsTable } from '../../components/PropsTable';

const surfaces = ['base-100', 'base-200', 'base-300', 'muted'];
const roles = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'];

export default function Theming() {
  return (
    <article class="docs-page">
      <Title>Theming · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Theming</h1>
      <p class="docs-lead">
        A theme is CSS that sets the <code>--slp-*</code> tokens. Components only read tokens, so changing them restyles
        everything, on the whole page or in any part of it.
      </p>

      <H2 id="setup">Setup</H2>
      <p>
        Import the base styles, then the default theme, then your own CSS. The base file declares the cascade layers, from{' '}
        <code>slopkit.reset</code> to <code>slopkit.utilities</code>, so unlayered CSS of yours wins over every library rule
        without <code>!important</code>.
      </p>
      <CodeBlock
        code={`import '@solid-slopkit/components/styles/slopkit.css';
import '@solid-slopkit/components/styles/default-theme.css';
import './theme.css';`}
      />

      <H2 id="colors">Colors</H2>
      <p>
        The base colors are the surfaces and the text on them. <code>muted</code> is a quiet surface for parts that step back,
        such as a card footer, and <code>muted-content</code> is de-emphasized text, readable on it and on every base surface. The
        eight color roles are what the <code>color</code> prop takes; each comes with a <code>-content</code> color, the text that
        stays readable on it. A theme sets solid colors only: components derive their soft, outline and hover tints with{' '}
        <code>color-mix()</code>.
      </p>
      <div class="docs-swatches">
        <For each={[...surfaces, ...roles]}>
          {(name) => (
            <div class="docs-swatch">
              <div
                class="docs-swatch-color"
                style={{
                  background: `var(--slp-color-${name})`,
                  color: `var(--slp-color-${name.startsWith('base') ? 'base' : name}-content)`,
                }}
              >
                Aa
              </div>
              <code>--slp-color-{name}</code>
            </div>
          )}
        </For>
      </div>
      <p>
        In the default theme, every role reaches 4.5:1 (WCAG AA) against its content color, and as text on <code>base-100</code>,
        in both color schemes; warning as text on a light surface is the one exception. In light the roles are deep shades with
        white content, in dark they are bright shades with dark content; warning, a yellow, has dark content in both. Check the
        same pairs when you write a theme.
      </p>

      <H2 id="tokens">Other tokens</H2>
      <CssVarsTable
        rows={[
          {
            name: '--slp-size-field',
            default: '0.25rem',
            description: 'Unit of control heights: buttons, inputs, tabs, pagination. A medium Button is 8 units tall.',
          },
          {
            name: '--slp-size-selector',
            default: '0.25rem',
            description: 'Unit of small marks, such as Badge heights.',
          },
          {
            name: '--slp-spacing',
            default: '0.25rem',
            description: (
              <>
                Unit of the layout components' spacing props: <code>p={'{4}'}</code> is 4 units.
              </>
            ),
          },
          {
            name: '--slp-depth',
            default: '0',
            description: 'Set to 1 for a subtle gradient and text shadow on solid buttons.',
          },
          {
            name: '--slp-font-family',
            default: 'system-ui, …, emoji fonts',
            description: 'Font of the page body. Also --slp-font-family-monospace for keys and code.',
          },
          {
            name: '--slp-shadow-xs … xl',
            default: 'black at low alpha',
            description: 'Shadows for surfaces and overlays.',
          },
        ]}
      />
      <p>
        The fonts, the type and heading scales, the shadows and the container widths are set in <code>slopkit.css</code>, not in
        the theme, but a theme can override them. Corner radii and border widths belong to each component: change them with a
        selector on the component.
      </p>

      <H2 id="customizing">Change the default look</H2>
      <p>
        Override tokens in unlayered CSS. Set only what you change; the rest keeps the default theme's values. Use{' '}
        <code>light-dark()</code> for a color that differs between schemes, and set a role together with its content color.
      </p>
      <CodeBlock
        lang="css"
        code={`:root {
  --slp-color-primary: light-dark(#6741d9, #9775fa);
  --slp-color-primary-content: light-dark(#ffffff, #141414);
  --slp-depth: 1;
}

.compact {
  --slp-size-field: 0.2rem;
}`}
      />

      <H2 id="named-themes">Named themes</H2>
      <p>
        A theme is a rule on <code>[data-slp-theme="&lt;name&gt;"]</code> in the <code>slopkit.themes</code> layer, imported after
        the default theme. Set <code>data-slp-theme</code> on <code>&lt;html&gt;</code> for the page or on any element for its
        subtree; themes nest, and tokens a theme leaves out come from the enclosing one.
      </p>
      <CodeBlock
        lang="css"
        code={`@layer slopkit.themes {
  [data-slp-theme='ocean'] {
    --slp-color-base-100: light-dark(#f8fbff, #0f1a24);
    --slp-color-base-content: light-dark(#0f1a24, #d6e6f5);
    --slp-color-primary: light-dark(#1864ab, #4dabf7);
    --slp-color-primary-content: light-dark(#ffffff, #0f1a24);
  }
}`}
      />
      <p>
        A theme for both schemes writes its colors with <code>light-dark()</code> and doesn't set <code>color-scheme</code>, so
        the user's choice applies. A theme for one scheme writes plain colors and sets <code>color-scheme: light</code> or{' '}
        <code>dark</code> itself, which pins the scheme under it.
      </p>

      <H2 id="color-scheme">Color scheme</H2>
      <p>
        The page follows the OS with no script: <code>slopkit.css</code> sets <code>color-scheme: light dark</code>, and{' '}
        <code>light-dark()</code> resolves against it. <code>data-slp-color-scheme="light"</code> or <code>"dark"</code> forces a
        scheme on any subtree.
      </p>
      <p>
        <code>useColorScheme()</code> gives the user a choice that persists: <code>colorScheme()</code> is the preference,{' '}
        <code>light</code>, <code>dark</code> or <code>auto</code>; <code>resolvedColorScheme()</code> is the scheme showing, and{' '}
        <code>setColorScheme</code>, <code>toggleColorScheme</code> and <code>clearColorScheme</code> change it. A script in the
        head applies a stored choice before the first paint. The server can't read it, so pick anything that must be right on the
        first paint, like a toggle's icon, in CSS rather than from the accessors.
      </p>
      <CodeBlock
        code={`import { Button, useColorScheme } from '@solid-slopkit/components';

function SchemeToggle() {
  const scheme = useColorScheme();
  return (
    <Button variant="ghost" aria-label="Toggle color scheme" onClick={() => scheme.toggleColorScheme()}>
      Toggle
    </Button>
  );
}`}
      />

      <H2 id="one-component">Customize one component</H2>
      <p>
        Don't write a theme to restyle one component. Use its public selectors: the root class (<code>.slp-button</code>), its{' '}
        <code>data-*</code> state and variant attributes, and its public CSS variables, listed on each component's page.
      </p>
      <CodeBlock
        lang="css"
        code={`.slp-button[data-variant='solid'] {
  font-weight: 600;
}

.checkout .slp-button {
  --slp-button-color: var(--slp-teal-9);
  --slp-button-content: #ffffff;
}`}
      />

      <H2 id="palettes">Palettes</H2>
      <p>
        <code>slopkit.css</code> also defines 14 palettes of 10 shades, from <code>--slp-gray-0</code> to{' '}
        <code>--slp-orange-9</code>, for your own styles and themes. Components never read them.
      </p>
    </article>
  );
}
