import { For } from 'solid-js';
import { Stack, TextInput } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '20rem' }}>
      <For each={['outline', 'soft', 'ghost'] as const}>
        {(variant) => <TextInput label={`Variant ${variant}`} variant={variant} placeholder="Type here" />}
      </For>
      <TextInput label="Disabled" disabled value="Can't change this" />
    </Stack>
  );
}
