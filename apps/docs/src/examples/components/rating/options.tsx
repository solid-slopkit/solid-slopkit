import { Group, Rating, Stack, Text } from '@solid-slopkit/components';

export default function Options() {
  return (
    <Stack gap={4}>
      <Rating label="Half stars" fractions={2} defaultValue={3.5} />
      <Rating label="Ten hearts' worth" count={10} size="sm" color="error" defaultValue={7} />
      <Group gap={2}>
        <Rating aria-label="Average rating" readOnly value={4.3} size="sm" />
        <Text size="sm" dimmed>
          4.3 from 128 reviews
        </Text>
      </Group>
    </Stack>
  );
}
