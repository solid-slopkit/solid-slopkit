import { For } from 'solid-js';
import { Group, Paper } from '@solid-slopkit/components';

export default function Shadows() {
  return (
    <Group gap={6}>
      <For each={['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const}>
        {(shadow) => <Paper shadow={shadow} withBorder>{`shadow="${shadow}"`}</Paper>}
      </For>
    </Group>
  );
}
