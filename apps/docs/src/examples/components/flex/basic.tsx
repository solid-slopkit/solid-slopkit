import { For } from 'solid-js';
import { Box, Flex } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Basic() {
  return (
    <>
      <Flex gap={2} style={surface}>
        <Box p={2} style={item}>
          {'<Flex gap={2}>'}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
        <Box p={2} style={item}>
          c
        </Box>
      </Flex>
      <Flex justify="space-between" align="center" style={{ ...surface, height: '5rem' }}>
        <Box p={2} style={item}>
          {'justify="space-between" align="center"'}
        </Box>
        <Box p={4} style={item}>
          taller
        </Box>
      </Flex>
      <Flex direction={{ base: 'column', sm: 'row' }} gap={2} style={surface}>
        <Box p={2} style={item}>
          {"direction={{ base: 'column', sm: 'row' }}"}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
      </Flex>
      <Flex wrap="wrap" gap={2} rowGap={4} style={{ ...surface, width: '20rem' }}>
        <For each={['wrap="wrap"', 'gap={2}', 'rowGap={4}', 'd', 'e', 'f']}>
          {(label) => (
            <Box p={2} w={24} style={item}>
              {label}
            </Box>
          )}
        </For>
      </Flex>
    </>
  );
}
