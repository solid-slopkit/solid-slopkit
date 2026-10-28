// SSR scenarios for box.test.tsx.
import { Box } from '.';

export const styleProps = () => (
  <Box p={{ base: 2, md: 4 }} mx="auto" maw={80} display={{ base: 'none', sm: 'block' }} class="mine">
    <Box w="100%">Nested</Box>
    <Box>Plain</Box>
  </Box>
);
