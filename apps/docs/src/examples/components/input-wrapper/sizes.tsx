import { For } from 'solid-js';
import { Input, InputWrapper, Stack } from '@solid-slopkit/components';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function Sizes() {
  return (
    <Stack gap={4} style={{ width: '100%', 'max-width': '20rem' }}>
      <For each={sizes}>
        {(size) => (
          <InputWrapper label={`Size ${size}`} description="The texts and the field follow the size." size={size}>
            <Input />
          </InputWrapper>
        )}
      </For>
    </Stack>
  );
}
