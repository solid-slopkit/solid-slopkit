import { For } from 'solid-js';
import { Box, SimpleGrid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Responsive() {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 4 }}
      spacing={{ base: 2, sm: 4 }}
      verticalSpacing={{ base: 4, sm: 8 }}
      style={surface}
    >
      <For each={['1 → 2 → 4 columns', 'b', 'c', 'd', 'e', 'f', 'g', 'h']}>
        {(label) => (
          <Box p={2} style={item}>
            {label}
          </Box>
        )}
      </For>
    </SimpleGrid>
  );
}
