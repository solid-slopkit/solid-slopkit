import { For } from 'solid-js';
import { Box, SimpleGrid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Basic() {
  return (
    <SimpleGrid cols={3} style={surface}>
      <For each={['cols={3}', 'b', 'c', 'd', 'e']}>
        {(label) => (
          <Box p={2} style={item}>
            {label}
          </Box>
        )}
      </For>
    </SimpleGrid>
  );
}
