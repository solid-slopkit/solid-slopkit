import { For } from 'solid-js';
import { Paper, ScrollArea, Text } from '@solid-slopkit/components';

const changes = Array.from({ length: 20 }, (_, index) => `Version 1.${20 - index}: fixes and small improvements.`);

export default function Basic() {
  return (
    <Paper withBorder padding="none" style={{ width: '100%' }}>
      <ScrollArea style={{ height: '200px' }}>
        <div style={{ padding: '0.75rem 1rem' }}>
          <For each={changes}>{(change) => <Text>{change}</Text>}</For>
        </div>
      </ScrollArea>
    </Paper>
  );
}
