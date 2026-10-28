import { Box, Center } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Center style={{ width: '100%', height: '8rem', background: 'var(--slp-color-base-200)' }}>
      <Box p={2} style={{ background: 'var(--slp-color-base-300)' }}>
        Centered both ways
      </Box>
    </Center>
  );
}
