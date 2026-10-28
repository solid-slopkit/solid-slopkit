import { For } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';

export default function Weights() {
  return (
    <Stack gap={1}>
      <For each={['normal', 'medium', 'semibold', 'bold'] as const}>
        {(weight) => <Text weight={weight}>{`weight="${weight}"`}</Text>}
      </For>
    </Stack>
  );
}
