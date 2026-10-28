import { For } from 'solid-js';
import { RingProgress, Text } from '@solid-slopkit/components';

const rings = [
  { color: 'primary', value: 25 },
  { color: 'secondary', value: 50 },
  { color: 'success', value: 75 },
  { color: 'error', value: 100 },
] as const;

export default function Colors() {
  return (
    <For each={rings}>
      {(ring) => (
        <RingProgress value={ring.value} color={ring.color} label={ring.color}>
          <Text size="xs">{ring.value}%</Text>
        </RingProgress>
      )}
    </For>
  );
}
