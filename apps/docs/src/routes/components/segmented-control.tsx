import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/segmented-control/basic';
import basicCode from '../../examples/components/segmented-control/basic.tsx?raw';
import Controlled from '../../examples/components/segmented-control/controlled';
import controlledCode from '../../examples/components/segmented-control/controlled.tsx?raw';
import Colors from '../../examples/components/segmented-control/colors';
import colorsCode from '../../examples/components/segmented-control/colors.tsx?raw';
import Sizes from '../../examples/components/segmented-control/sizes';
import sizesCode from '../../examples/components/segmented-control/sizes.tsx?raw';
import Layout from '../../examples/components/segmented-control/layout';
import layoutCode from '../../examples/components/segmented-control/layout.tsx?raw';
import States from '../../examples/components/segmented-control/states';
import statesCode from '../../examples/components/segmented-control/states.tsx?raw';

export default function SegmentedControlPage() {
  return (
    <article class="docs-page">
      <Title>SegmentedControl · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>SegmentedControl</h1>
      <p class="docs-lead">
        A row of options of which one is selected, with an indicator that slides to the selection. Use it for a few options that
        are all worth showing, like a view switcher.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { SegmentedControl } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        <code>data</code> lists the options. A string is both the value and the label. Without <code>value</code> or{' '}
        <code>defaultValue</code>, the first enabled option is selected.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        Pass <code>value</code> and <code>onChange</code> to own the state. An option can be an object with a <code>label</code>{' '}
        (any JSX) and <code>disabled</code>. The value type is inferred from <code>data</code>.
      </p>
      <Example component={Controlled} code={controlledCode} />

      <H2 id="colors">Colors</H2>
      <p>
        <code>color</code> fills the indicator with a color role. <code>withItemsBorders={'{false}'}</code> removes the
        separators.
      </p>
      <Example component={Colors} code={colorsCode} column />

      <H2 id="sizes">Sizes</H2>
      <p>Heights match Button's sizes, so the two line up in a toolbar.</p>
      <Example component={Sizes} code={sizesCode} column />

      <H2 id="layout">Full width and vertical</H2>
      <Example component={Layout} code={layoutCode} column />

      <H2 id="states">Disabled and read-only</H2>
      <Example component={States} code={statesCode} column />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        The control is a <code>radiogroup</code> of native radio inputs. Tab focuses the selection; the arrow keys move it, in
        either axis, wrapping around the ends, and Home and End move it to the first and last option. Disabled options are
        skipped. Label the group with <code>aria-label</code> or <code>aria-labelledby</code>. With a <code>name</code>, the
        selected value is submitted with its form.
      </p>

      <H2 id="css-variables">CSS variables</H2>
      <p>Set these on the control or any ancestor.</p>
      <CssVarsTable
        rows={[
          {
            name: '--slp-segmented-control-radius',
            default: '10px',
            description: 'Corner radius. The indicator and labels follow, inset by the padding.',
          },
          {
            name: '--slp-segmented-control-color',
            default: 'var(--slp-color-<color>)',
            description: 'Indicator color. Base surface color when omitted.',
          },
          {
            name: '--slp-segmented-control-content',
            default: 'var(--slp-color-<color>-content)',
            description: 'Text color of the selected option on a colored indicator.',
          },
        ]}
      />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the root <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'data',
            type: 'readonly (T | { value: T; label: JSX.Element; disabled?: boolean })[]',
            description: (
              <>
                The options. Required. <code>T extends string</code>; a string is both value and label.
              </>
            ),
          },
          { name: 'value', type: 'T', description: 'Selected value, for a controlled control.' },
          { name: 'defaultValue', type: 'T', description: 'Initial value. Defaults to the first enabled option.' },
          { name: 'onChange', type: '(value: T) => void', description: 'Called with the newly selected value.' },
          { name: 'name', type: 'string', description: 'Name of the radio inputs, for forms. A unique id by default.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every option.' },
          {
            name: 'readOnly',
            type: 'boolean',
            default: 'false',
            description: (
              <>
                Shows the value but does not let the user change it. <code>onChange</code> is not called.
              </>
            ),
          },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Fills the container width.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            description: 'Indicator color. Base surface color when omitted.',
          },
          { name: 'withItemsBorders', type: 'boolean', default: 'true', description: 'Separators between options.' },
          { name: 'transitionDuration', type: 'number', default: '200', description: 'Indicator animation, in ms.' },
          { name: 'transitionTimingFunction', type: 'string', default: "'ease'", description: 'Indicator easing.' },
          { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'The root element.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-segmented-control</code>. State and variant are attributes on it:{' '}
        <code>data-orientation</code>, <code>data-size</code>, <code>data-color</code>, <code>data-full-width</code>,{' '}
        <code>data-disabled</code>, <code>data-read-only</code> and <code>data-with-items-borders</code>. Its parts are slots, as{' '}
        <code>[data-slot="…"]</code>: <code>segmented-control-indicator</code>, and per option <code>segmented-control-item</code>{' '}
        (with <code>data-active</code> and <code>data-disabled</code>) holding <code>segmented-control-input</code> and{' '}
        <code>segmented-control-label</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
