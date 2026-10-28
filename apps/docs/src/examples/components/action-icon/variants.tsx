import { For } from 'solid-js';
import { Heart } from '@lucide/solid';
import { ActionIcon, Group, type ActionIconVariant } from '@solid-slopkit/components';

const variants: ActionIconVariant[] = ['ghost', 'solid', 'soft', 'outline', 'dash'];

export default function Variants() {
  return (
    <Group>
      <For each={variants}>
        {(variant) => (
          <ActionIcon label={`Like (${variant})`} variant={variant} color="primary">
            <Heart aria-hidden="true" />
          </ActionIcon>
        )}
      </For>
    </Group>
  );
}
