import { createSignal, For } from 'solid-js';
import { Button, Paper, ScrollArea, Stack, Text } from '@solid-slopkit/components';

export default function MaxHeight() {
  const [items, setItems] = createSignal(['Milk', 'Bread']);

  return (
    <Stack align="start" style={{ width: '100%' }}>
      <Button variant="outline" onClick={() => setItems((list) => [...list, `Item ${list.length + 1}`])}>
        Add an item
      </Button>
      <Paper withBorder padding="none" style={{ width: '100%' }}>
        <ScrollArea style={{ 'max-height': '160px' }}>
          <div style={{ padding: '0.75rem 1rem' }}>
            <For each={items()}>{(item) => <Text>{item}</Text>}</For>
          </div>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}
