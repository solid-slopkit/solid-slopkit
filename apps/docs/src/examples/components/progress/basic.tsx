import { createSignal } from 'solid-js';
import { Button, Group, Progress, Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [value, setValue] = createSignal(40);

  return (
    <Stack gap={3} style={{ width: '100%' }}>
      <Group justify="space-between">
        <Text id="upload-label" size="sm">
          Uploading photos
        </Text>
        <Text size="sm" dimmed>
          {value()}%
        </Text>
      </Group>
      <Progress value={value()} aria-labelledby="upload-label" />
      <Group gap={2}>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(v - 10, 0))}>
          −10
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.min(v + 10, 100))}>
          +10
        </Button>
      </Group>
    </Stack>
  );
}
