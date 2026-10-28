import { For } from 'solid-js';
import { Stack, Switch } from '@solid-slopkit/components';

export default function Sizes() {
  return (
    <Stack gap={3}>
      <For each={['xs', 'sm', 'md', 'lg', 'xl'] as const}>
        {(size) => <Switch label={`Size ${size}`} size={size} defaultChecked />}
      </For>
    </Stack>
  );
}
