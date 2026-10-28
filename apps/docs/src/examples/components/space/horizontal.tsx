import { Box, Flex, Space } from '@solid-slopkit/components';

const item = { background: 'var(--slp-color-base-300)' };

export default function Horizontal() {
  return (
    <Flex>
      <Box p={2} style={item}>
        First
      </Box>
      <Space w={{ base: 2, md: 12 }} />
      <Box p={2} style={item}>
        {'<Space w={{ base: 2, md: 12 }} /> before'}
      </Box>
    </Flex>
  );
}
