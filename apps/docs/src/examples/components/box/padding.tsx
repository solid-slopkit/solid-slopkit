import { Box } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)' };

export default function Padding() {
  return (
    <>
      <Box p={4} style={surface}>
        {'p={4}'}
      </Box>
      <Box px={8} py={2} style={surface}>
        {'px={8} py={2}'}
      </Box>
      <Box p={2} pl={10} style={surface}>
        {'p={2} pl={10}'}
      </Box>
      <Box pt={6} style={surface}>
        {'pt={6}'}
      </Box>
      <Box p={4} style={surface}>
        {'p={4}, shares its <style> with the first box'}
      </Box>
    </>
  );
}
