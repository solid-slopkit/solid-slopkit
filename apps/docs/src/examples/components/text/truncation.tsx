import { Stack, Text } from '@solid-slopkit/components';

const long =
  'A long description that keeps going well past the width of its column, so it has to be cut somewhere to keep the layout tidy and the card the same height as its neighbours.';

export default function Truncation() {
  return (
    <Stack gap={3} style={{ width: '18rem' }}>
      <Text truncate>{long}</Text>
      <Text lineClamp={2}>{long}</Text>
    </Stack>
  );
}
