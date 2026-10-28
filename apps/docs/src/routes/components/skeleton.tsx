import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { PropsTable } from '../../components/PropsTable';

import Basic from '../../examples/components/skeleton/basic';
import basicCode from '../../examples/components/skeleton/basic.tsx?raw';
import Content from '../../examples/components/skeleton/content';
import contentCode from '../../examples/components/skeleton/content.tsx?raw';

export default function SkeletonPage() {
  return (
    <article class="docs-page">
      <Title>Skeleton · slopkit</Title>
      <p class="docs-eyebrow">Components</p>
      <h1>Skeleton</h1>
      <p class="docs-lead">
        A placeholder for content that is loading: a <code>div</code>. Around children, it takes their size and hides them until{' '}
        <code>visible</code> is false; without children, size it with <code>style</code>.
      </p>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import { Skeleton } from '@solid-slopkit/components';`} />

      <H2 id="usage">Usage</H2>
      <p>
        Shape the placeholders like what will load. Without children a Skeleton has no height, so give it one with{' '}
        <code>style</code>. <code>circle</code> rounds it, for an avatar.
      </p>
      <Example component={Basic} code={basicCode} />

      <H2 id="content">Around content</H2>
      <p>
        Wrapped around the real content, a Skeleton takes its size and hides it, so nothing moves when it arrives. With{' '}
        <code>visible={'{false}'}</code>, the content shows.
      </p>
      <Example component={Content} code={contentCode} />

      <H2 id="accessibility">Accessibility</H2>
      <p>
        While visible, a Skeleton is hidden from assistive technology, and the content inside it can't be focused. Mark the region
        that's loading with <code>aria-busy="true"</code>. A shimmer sweeps across the placeholder;{' '}
        <code>animate={'{false}'}</code> and the user's reduced-motion setting keep it still.
      </p>

      <H2 id="props">Props</H2>
      <p>
        Other props are passed to the <code>div</code>.
      </p>
      <PropsTable
        rows={[
          {
            name: 'visible',
            type: 'boolean',
            default: 'true',
            description: 'Shows the placeholder. With false, the children show.',
          },
          { name: 'animate', type: 'boolean', default: 'true', description: 'Sweeps a shimmer across the placeholder.' },
          { name: 'circle', type: 'boolean', default: 'false', description: 'Rounds the placeholder into a circle.' },
        ]}
      />

      <H2 id="styling">Styling</H2>
      <p>
        The root has the class <code>.slp-skeleton</code>, with <code>data-visible</code>, <code>data-animate</code> and{' '}
        <code>data-circle</code>, and no slots. The shimmer is its <code>::after</code>. Its rules live in{' '}
        <code>@layer slopkit.components</code>, so unlayered CSS wins.
      </p>
    </article>
  );
}
