import { For } from 'solid-js';
import { Stack, Title } from '@solid-slopkit/components';

export default function Levels() {
  return (
    <Stack gap={2}>
      <For each={[1, 2, 3, 4, 5, 6] as const}>{(order) => <Title order={order}>{`order={${order}}`}</Title>}</For>
    </Stack>
  );
}
