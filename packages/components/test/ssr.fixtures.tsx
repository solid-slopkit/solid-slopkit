// Scenarios for the helper's own test (ssr.test.tsx). `mismatch` and `serverWrite` are broken on
// purpose, to prove the helper catches them.
import { createSignal } from 'solid-js';
import { isServer } from '@solidjs/web';
import { Box, Button, SegmentedControl, Stack } from '../src';

export const components = () => (
  <Stack gap={2}>
    <Box p={{ base: 2, md: 4 }}>Box</Box>
    <Button variant="soft" color="primary">
      Button
    </Button>
    <SegmentedControl aria-label="View" data={['List', 'Grid']} />
  </Stack>
);

export const mismatch = () => (isServer ? <span>server</span> : <div>client</div>);

export const serverWrite = () => {
  const [value, setValue] = createSignal(0);
  setValue(1);
  return <p>{value()}</p>;
};
