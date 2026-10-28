import { For } from 'solid-js';
import { Button, Group, Input, Stack } from '@solid-slopkit/components';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function Sizes() {
  return (
    <Stack gap={3}>
      <For each={sizes}>
        {(size) => (
          <Group gap={2} wrap="nowrap">
            <Input aria-label={`Email (${size})`} placeholder={`Size ${size}`} size={size} />
            <Button size={size} color="primary">
              Subscribe
            </Button>
          </Group>
        )}
      </For>
    </Stack>
  );
}
