import { For } from 'solid-js';
import { Pill, Stack } from '@solid-slopkit/components';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function Sizes() {
  return (
    <Stack align="start">
      <For each={sizes}>
        {(size) => (
          <Pill.Group size={size}>
            <Pill>{size}</Pill>
            <Pill withRemoveButton>Removable</Pill>
          </Pill.Group>
        )}
      </For>
      <Pill.Group disabled>
        <Pill withRemoveButton>Disabled</Pill>
        <Pill withRemoveButton>Group</Pill>
      </Pill.Group>
    </Stack>
  );
}
