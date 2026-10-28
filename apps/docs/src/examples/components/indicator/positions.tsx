import { For } from 'solid-js';
import { Indicator, Stack, Text } from '@solid-slopkit/components';

const positions = [
  'top-start',
  'top-center',
  'top-end',
  'middle-start',
  'middle-end',
  'bottom-start',
  'bottom-center',
  'bottom-end',
] as const;

export default function Positions() {
  return (
    <For each={positions}>
      {(position) => (
        <Stack gap={2} align="center">
          <Indicator position={position} color="secondary">
            <div style={{ width: '4.5rem', height: '3rem', 'border-radius': '6px', background: 'var(--slp-color-base-200)' }} />
          </Indicator>
          <Text as="span" size="xs">
            {position}
          </Text>
        </Stack>
      )}
    </For>
  );
}
