import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { CssVarsTable, PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/rating/basic';
import basicCode from '../../examples/components/rating/basic.tsx?raw';
import Options from '../../examples/components/rating/options';
import optionsCode from '../../examples/components/rating/options.tsx?raw';

export default function RatingPage() {
  return (
    <article class="docs-page">
      <Title>Rating · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Rating</h1>
      <p class="docs-lead">
        A star rating. Choosing, it's a <code>radiogroup</code> of hidden native radios, so the arrow keys move it; read-only,
        it's the stars as one image.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Rating } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        The value is a number from 0 to <code>count</code>. Hovering previews a rating; <code>allowClear</code> lets a click on
        the current star set it back to 0. Each star is named “3 stars”.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="options">Parts, counts and read-only</H2>
      <p>
        <code>fractions={'{2}'}</code> lets the halves of a star be chosen. <code>readOnly</code> draws any value, such as an
        average, as one image named “Rated 4.3 out of 5”.
      </p>
      <Example component={Options} code={optionsCode} />

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the InputWrapper root. Plus InputWrapper's <code>label</code>, <code>labelSection</code>,{' '}
        <code>description</code>, <code>error</code>, <code>withAsterisk</code>, <code>size</code> and <code>id</code>;{' '}
        <code>aria-label</code> names the stars.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'number', description: 'The rating, controlled; 0 is none.' },
          { name: 'defaultValue', type: 'number', default: '0', description: 'The starting rating, uncontrolled.' },
          { name: 'onChange', type: '(value: number) => void', description: 'Called with the new rating.' },
          { name: 'count', type: 'number', default: '5', description: 'How many stars.' },
          { name: 'fractions', type: 'number', default: '1', description: 'Parts of a star that can be chosen.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Shows the rating as an image. Read once.' },
          { name: 'allowClear', type: 'boolean', default: 'false', description: 'Choosing the current rating clears it.' },
          {
            name: 'color',
            type: "'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
            default: "'warning'",
            description: 'Color of the filled stars.',
          },
          { name: 'name', type: 'string', default: 'generated', description: "The radios' name." },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables it.' },
          {
            name: 'itemLabel',
            type: '(value: number) => string',
            default: '1 star, 2.5 stars',
            description: "Each radio's accessible name.",
          },
          {
            name: 'readOnlyLabel',
            type: '(value: number, count: number) => string',
            default: 'Rated 4.3 out of 5',
            description: "The read-only image's accessible name.",
          },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the classes <code>.slp-rating</code> and <code>.slp-input-wrapper</code>. Its slots are{' '}
        <code>rating-stars</code>, <code>rating-item</code>, <code>rating-star</code> (with <code>data-filled</code>) and{' '}
        <code>rating-input</code>. Its rules live in <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
      <CssVarsTable
        rows={[{ name: '--slp-rating-color', default: 'var(--slp-color-<color>)', description: 'The filled stars.' }]}
      />
    </article>
  );
}
