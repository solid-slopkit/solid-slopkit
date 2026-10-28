import { Box } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)' };

export default function Size() {
  return (
    <>
      <Box w={24} h={16} p={2} style={surface}>
        {'w={24} h={16}'}
      </Box>
      <Box w="50%" p={2} style={surface}>
        {'w="50%"'}
      </Box>
      <Box w={{ base: '100%', sm: 64 }} p={2} style={surface}>
        {"w={{ base: '100%', sm: 64 }}"}
      </Box>
      <Box w="100%" maw={80} p={2} style={surface}>
        {'w="100%" maw={80}'}
      </Box>
      <Box miw={48} mih={12} p={2} style={{ ...surface, 'align-self': 'flex-start' }}>
        {'miw={48} mih={12}'}
      </Box>
      <Box mah={12} p={2} style={{ ...surface, overflow: 'auto' }}>
        {'mah={12}: '}
        Long content scrolls once the box reaches its maximum height. Long content scrolls once the box reaches its maximum
        height. Long content scrolls once the box reaches its maximum height.
      </Box>
    </>
  );
}
