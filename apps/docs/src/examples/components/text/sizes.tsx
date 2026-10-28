import { For } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <Stack gap={1}>
      <For each={['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const}>
        {(size) => <Text size={size}>{`size="${size}"`}</Text>}
      </For>
    </Stack>
  );
}
