import { createSignal } from 'solid-js';
import { Button, Group, SemiCircleProgress, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [value, setValue] = createSignal(62);

  return (
    <Group gap={4}>
      <SemiCircleProgress value={value()} size="lg" color="warning" aria-labelledby="cpu-label">
        <Stack gap={0} align="center">
          <Text size="xl" weight="semibold">
            {value()}%
          </Text>
          <Text id="cpu-label" size="xs" dimmed>
            CPU
          </Text>
        </Stack>
      </SemiCircleProgress>
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
