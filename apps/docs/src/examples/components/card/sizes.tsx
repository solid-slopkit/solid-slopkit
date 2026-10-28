import { For } from 'solid-js';
import { Button, Card, SimpleGrid, Text } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={4} style={{ width: '100%' }}>
      <For each={['md', 'sm'] as const}>
        {(size) => (
          <Card size={size}>
            <Card.Header>
              <Card.Title>{`size="${size}"`}</Card.Title>
              <Card.Description>Spacing and title follow the size.</Card.Description>
            </Card.Header>
            <Card.Body>
              <Text size="sm">The same content in each card.</Text>
            </Card.Body>
            <Card.Footer>
              <Button size="sm" fullWidth>
                Continue
              </Button>
            </Card.Footer>
          </Card>
        )}
      </For>
    </SimpleGrid>
  );
}
