// SSR scenarios for breadcrumbs.test.tsx.
import { For } from 'solid-js';
import { Anchor } from '../../typography/anchor';
import { Breadcrumbs } from '.';

export const breadcrumbs = () => (
  <div>
    <Breadcrumbs class="mine">
      <Anchor href="/">Home</Anchor>
      <Anchor href="/docs">Docs</Anchor>
      <span aria-current="page">Here</span>
    </Breadcrumbs>
    <Breadcrumbs separator={<span>›</span>}>
      <For each={['One', 'Two', 'Three']}>{(part) => <Anchor href={`#${part}`}>{part}</Anchor>}</For>
    </Breadcrumbs>
  </div>
);
