import { Box, Space } from '@solid-slopkit/components';

const item = { background: 'var(--slp-color-base-300)' };

export default function Vertical() {
  return (
    <div style={{ width: '100%' }}>
      <Box p={2} style={item}>
        First block
      </Box>
      <Space h={8} />
      <Box p={2} style={item}>
        {'<Space h={8} /> above'}
      </Box>
    </div>
  );
}
