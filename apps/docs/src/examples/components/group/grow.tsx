import { Box, Group } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Grow() {
  return (
    <>
      <Group grow style={surface}>
        <Box p={2} style={item}>
          grow
        </Box>
        <Box p={2} style={item}>
          equal shares, however long the content of the second child is
        </Box>
        <Box p={2} style={item}>
          c
        </Box>
      </Group>
      <Group grow preventGrowOverflow={false} style={surface}>
        <Box p={2} style={item}>
          {'preventGrowOverflow={false}'}
        </Box>
        <Box p={2} style={item}>
          content widens this child
        </Box>
        <Box p={2} style={item}>
          c
        </Box>
      </Group>
    </>
  );
}
