import { For } from 'solid-js';
import { Fieldset, Input, InputWrapper, SimpleGrid } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={4} style={{ width: '100%' }}>
      <For each={['outline', 'soft', 'ghost'] as const}>
        {(variant) => (
          <Fieldset legend={variant} variant={variant}>
            <InputWrapper label="Name">
              <Input />
            </InputWrapper>
          </Fieldset>
        )}
      </For>
    </SimpleGrid>
  );
}
