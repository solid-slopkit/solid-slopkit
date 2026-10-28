import { Group, Skeleton, Stack } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Group gap={3} align="flex-start" wrap="nowrap" style={{ width: '100%' }} aria-busy="true">
      <Skeleton circle style={{ width: '2.5rem', height: '2.5rem', 'flex-shrink': '0' }} />
      <Stack gap={2} style={{ flex: '1' }}>
        <Skeleton style={{ height: '0.75rem', width: '40%' }} />
        <Skeleton style={{ height: '0.75rem' }} />
        <Skeleton style={{ height: '0.75rem', width: '85%' }} />
      </Stack>
    </Group>
  );
}
