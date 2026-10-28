import { For } from 'solid-js';
import { Stack, Text } from '@solid-slopkit/components';

const colors = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

export default function Colors() {
  return (
    <Stack gap={1}>
      <Text>No color: inherits the parent's</Text>
      <Text dimmed>dimmed</Text>
      <For each={colors}>{(color) => <Text color={color}>{`color="${color}"`}</Text>}</For>
      <Text color="primary" dimmed>
        {'color="primary" dimmed'}
      </Text>
    </Stack>
  );
}
