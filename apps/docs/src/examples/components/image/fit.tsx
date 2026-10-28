import { For } from 'solid-js';
import { Image, Stack, Text } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

const fits = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const;

export default function Fit() {
  return (
    <For each={fits}>
      {(fit) => (
        <Stack gap={1} align="center">
          <Image
            src={landscape}
            alt=""
            fit={fit}
            width={120}
            height={120}
            style={{ background: 'var(--slp-color-base-200)', 'border-radius': '8px' }}
          />
          <Text as="span" size="sm">
            {fit}
          </Text>
        </Stack>
      )}
    </For>
  );
}
