import { Box } from '@solid-slopkit/components';

export default function ResponsivePadding() {
  return (
    <Box p={{ base: 2, sm: 4, lg: 8 }} style={{ background: 'var(--slp-color-base-200)' }}>
      2 below sm, 4 from sm, 8 from lg. Resize the window.
    </Box>
  );
}
