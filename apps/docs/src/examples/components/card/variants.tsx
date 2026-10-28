import { For } from 'solid-js';
import { Card, SimpleGrid, Text } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={4} style={{ width: '100%' }}>
      <For each={['outline', 'soft', 'elevated'] as const}>
        {(variant) => (
          <Card variant={variant}>
            <Card.Header>
              <Card.Title size="h6">{`variant="${variant}"`}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text size="sm" dimmed>
                The same content on each surface.
              </Text>
            </Card.Body>
          </Card>
        )}
      </For>
    </SimpleGrid>
  );
}
