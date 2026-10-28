import { createSignal, For } from 'solid-js';
import { Button, Group, Paper, ScrollArea, Stack, Text } from '@solid-slopkit/components';

const messages = Array.from({ length: 30 }, (_, index) => `Message ${index + 1}`);

export default function ScrollTo() {
  let viewport: HTMLDivElement | undefined;
  const [top, setTop] = createSignal(0);

  return (
    <Stack style={{ width: '100%' }}>
      <Group>
        <Button variant="outline" onClick={() => viewport?.scrollTo({ top: 0, behavior: 'smooth' })}>
          To the top
        </Button>
        <Button variant="outline" onClick={() => viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })}>
          To the bottom
        </Button>
        <Text>Scrolled {Math.round(top())}px</Text>
      </Group>
      <Paper withBorder padding="none">
        <ScrollArea
          viewportRef={(el) => (viewport = el)}
          onScrollPositionChange={(position) => setTop(position.y)}
          style={{ height: '160px' }}
        >
          <div style={{ padding: '0.75rem 1rem' }}>
            <For each={messages}>{(message) => <Text>{message}</Text>}</For>
          </div>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}
