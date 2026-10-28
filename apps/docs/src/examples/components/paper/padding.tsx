import { For } from 'solid-js';
import { Group, Paper } from '@solid-slopkit/components';

export default function Padding() {
  return (
    <Group gap={3} align="start">
      <For each={['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const}>
        {(padding) => (
          <Paper padding={padding} withBorder>
            {padding}
          </Paper>
        )}
      </For>
    </Group>
  );
}
