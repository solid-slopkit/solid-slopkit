import { createSignal } from 'solid-js';
import { Avatar, Button, Group, Skeleton, Stack, Text } from '@solid-slopkit/components';

export default function Content() {
  const [loading, setLoading] = createSignal(true);

  return (
    <Stack gap={4} style={{ width: '100%' }}>
      <Group gap={3} align="flex-start" wrap="nowrap" aria-busy={loading() ? 'true' : 'false'}>
        <Skeleton visible={loading()} circle>
          <Avatar name="Grace Hopper" color="primary" />
        </Skeleton>
        <Stack gap={1}>
          <Skeleton visible={loading()}>
            <Text weight="semibold">Grace Hopper</Text>
          </Skeleton>
          <Skeleton visible={loading()}>
            <Text size="sm" dimmed>
              Wrote the first compiler, and found the first actual bug.
            </Text>
          </Skeleton>
        </Stack>
      </Group>
      <Button variant="outline" size="sm" style={{ 'align-self': 'flex-start' }} onClick={() => setLoading((value) => !value)}>
        {loading() ? 'Finish loading' : 'Load again'}
      </Button>
    </Stack>
  );
}
