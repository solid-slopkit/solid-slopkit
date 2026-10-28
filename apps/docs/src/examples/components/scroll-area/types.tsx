import { createSignal, For } from 'solid-js';
import { Paper, ScrollArea, SegmentedControl, Stack, Text, type ScrollAreaType } from '@solid-slopkit/components';

const lines = Array.from({ length: 15 }, (_, index) => `Line ${index + 1} of the content.`);

export default function Types() {
  const [type, setType] = createSignal<ScrollAreaType>('hover');

  return (
    <Stack style={{ width: '100%' }}>
      <SegmentedControl
        aria-label="When the scrollbars show"
        value={type()}
        onChange={setType}
        data={['hover', 'scroll', 'always', 'never']}
      />
      <Paper withBorder padding="none">
        <ScrollArea type={type()} offsetScrollbars style={{ height: '160px' }}>
          <div style={{ padding: '0.75rem 1rem' }}>
            <For each={lines}>{(line) => <Text>{line}</Text>}</For>
          </div>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}
