import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/mark/basic';
import basicCode from '../../examples/components/mark/basic.tsx?raw';
import Colors from '../../examples/components/mark/colors';
import colorsCode from '../../examples/components/mark/colors.tsx?raw';
import CustomColor from '../../examples/components/mark/custom-color';
import customColorCode from '../../examples/components/mark/custom-color.tsx?raw';

export default function MarkPage() {
  return (
    <article class="docs-page">
      <Title>Mark · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Mark</h1>
      <p class="docs-lead">
        Highlighted text: a <code>mark</code>, tinted with a color role.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Mark } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        A <code>mark</code> is for text that's highlighted because it's relevant here, such as a search match. Most screen readers
        don't announce it, so when the highlight carries meaning, say it in the text too.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> takes a color role and defaults to <code>warning</code>. The background is a translucent tint and the
        text keeps the color around it, so a mark reads on any surface and in both color schemes.
      </p>
      <Example component={Colors} code={colorsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>mark</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'warning'",
            description: 'Color role of the tint.',
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-mark</code> and <code>data-color</code>, and no slots. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-mark-color',
            default: 'var(--slp-color-<color>)',
            description: "The color the tint is made from, at 30%. For a color that isn't a role.",
          },
        ]}
      />
      <Example component={CustomColor} code={customColorCode} />
    </article>
  );
}
