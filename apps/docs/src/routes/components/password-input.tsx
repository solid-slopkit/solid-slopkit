import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/password-input/basic';
import basicCode from '../../examples/components/password-input/basic.tsx?raw';
import Together from '../../examples/components/password-input/together';
import togetherCode from '../../examples/components/password-input/together.tsx?raw';
import { withBase } from '../../base';

export default function PasswordInputPage() {
  return (
    <article class="docs-page">
      <Title>PasswordInput · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>PasswordInput</h1>
      <p class="docs-lead">
        A labelled password field: a <a href={withBase('/components/text-input')}>TextInput</a> with a toggle that shows the
        password as text.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { PasswordInput } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The toggle is named “Show password”, and its state is <code>aria-pressed</code>. Pass{' '}
        <code>autocomplete="current-password"</code> on a sign-in form and <code>"new-password"</code> on a sign-up form, so
        password managers do the right thing.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="controlled">Controlled</H2>
      <p>
        With <code>visible</code>, you decide, and <code>onVisibilityChange</code> gets the new state on each press: here both
        fields show and hide together.
      </p>
      <Example component={Together} code={togetherCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>input</code>; the wrapper's are TextInput's. There's no <code>type</code> and no{' '}
        <code>rightSection</code>.
      </p>
      <PropsTable
        rows={[
          { name: 'visible', type: 'boolean', description: 'Whether it shows as text, controlled.' },
          { name: 'defaultVisible', type: 'boolean', default: 'false', description: 'Whether it starts shown, uncontrolled.' },
          {
            name: 'onVisibilityChange',
            type: '(visible: boolean) => void',
            description: 'Called with the new state when toggled.',
          },
          { name: 'toggleLabel', type: 'string', default: "'Show password'", description: 'Accessible name of the toggle.' },
          {
            name: 'variant',
            type: "'outline' | 'soft' | 'ghost'",
            default: "'outline'",
            description: 'Visual style of the box.',
          },
          { name: 'leftSection', type: 'JSX.Element', description: 'Content before the input.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and the toggle.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the input read-only.' },
          { name: 'ref', type: 'Ref<HTMLElement>', description: 'The input.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-password-input</code> and <code>.slp-input-wrapper</code>. The toggle has the slot{' '}
        <code>password-input-toggle</code>, and the input has <code>data-visible</code> while the password is shown. Its rules
        live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
