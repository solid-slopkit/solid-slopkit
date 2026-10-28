import { createSignal } from 'solid-js';
import { Button, Group, RingProgress, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [value, setValue] = createSignal(65);

  return (
    <Group gap={4}>
      <RingProgress value={value()} size="lg" label="Course progress">
        <Text size="lg" weight="semibold">
          {value()}%
        </Text>
      </RingProgress>
      <Group gap={2}>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(v - 15, 0))}>
          −15
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.min(v + 15, 100))}>
          +15
        </Button>
      </Group>
    </Group>
  );
}
