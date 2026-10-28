import { For } from 'solid-js';
import { Progress, Stack } from '@solid-slopkit/components';

const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

export default function Colors() {
  return (
    <Stack gap={3} style={{ width: '100%' }}>
      <For each={colors}>{(color, index) => <Progress value={30 + index() * 12} color={color} label={color} />}</For>
    </Stack>
  );
}
