import { Box, Flex } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Display() {
  return (
    <>
      <Flex display={{ base: 'none', sm: 'flex' }} gap={2} style={surface}>
        <Box p={2} style={item}>
          {"display={{ base: 'none', sm: 'flex' }}: hidden below sm"}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
      </Flex>
      {/* In a plain block: as a child of the flex preview, inline-flex would be blockified to flex. */}
      <div>
        <Flex display="inline-flex" gap={2} style={surface}>
          <Box p={2} style={item}>
            {'display="inline-flex"'}
          </Box>
          <Box p={2} style={item}>
            b
          </Box>
        </Flex>
        <span> next to inline text</span>
      </div>
    </>
  );
}
