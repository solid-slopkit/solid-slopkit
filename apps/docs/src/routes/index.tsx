import { For } from 'solid-js';
import { Title } from '@solidjs/meta';
import { Card, SimpleGrid } from '@solid-slopkit/components';
import { packages } from '../nav';
import { withBase } from '../base';

export default function Home() {
  return (
    <article class="docs-page">
      <Title>slopkit</Title>
      <h1>slopkit</h1>
      <p class="docs-lead">Packages for SolidJS 2 apps: components, forms, translations, node editors and 3D scenes.</p>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={4}>
        <For each={packages}>
          {(pkg) => (
            <a class="docs-package-card" href={withBase(pkg.href)}>
              <Card>
                <Card.Body>
                  <Card.Title>{pkg.title}</Card.Title>
                  <Card.Description>
                    <code>{pkg.name}</code>
                  </Card.Description>
                  <Card.Description>{pkg.description}</Card.Description>
                </Card.Body>
              </Card>
            </a>
          )}
        </For>
      </SimpleGrid>
    </article>
  );
}
