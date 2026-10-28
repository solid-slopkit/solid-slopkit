import { Box } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)' };
const item = { background: 'var(--slp-color-base-300)' };

export default function Display() {
  return (
    <>
      <Box display={{ base: 'none', sm: 'block' }} p={2} style={surface}>
        {"display={{ base: 'none', sm: 'block' }}: hidden below sm"}
      </Box>
      <Box display={{ base: 'block', sm: 'none' }} p={2} style={surface}>
        {"display={{ base: 'block', sm: 'none' }}: only below sm"}
      </Box>
      <Box display="grid" p={2} style={{ ...surface, 'grid-template-columns': 'repeat(3, 1fr)', gap: '0.5rem' }}>
        <Box p={2} style={item}>
          {'display="grid"'}
        </Box>
        <Box p={2} style={item}>
          b
        </Box>
        <Box p={2} style={item}>
          c
        </Box>
      </Box>
    </>
  );
}
