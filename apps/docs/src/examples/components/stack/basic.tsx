import { Box, Stack } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Basic() {
  return (
    <>
      <Stack style={surface}>
        <Box p={2} style={item}>
          {'<Stack>'}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
        <Box p={2} style={item}>
          c
        </Box>
      </Stack>
      <Stack gap={2} align="center" style={surface}>
        <Box p={2} style={item}>
          {'gap={2} align="center"'}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
      </Stack>
      <Stack justify="space-between" style={{ ...surface, height: '10rem' }}>
        <Box p={2} style={item}>
          {'justify="space-between"'}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
      </Stack>
    </>
  );
}
