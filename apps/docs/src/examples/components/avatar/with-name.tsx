import { Avatar, Group, Stack, Text } from '@solid-slopkit/components';

export default function WithName() {
  return (
    <Group gap={3}>
      <Avatar name="Grace Hopper" alt="" color="primary" />
      <Stack gap={0}>
        <Text weight="semibold">Grace Hopper</Text>
        <Text size="sm" dimmed>
          Rear admiral
        </Text>
      </Stack>
    </Group>
  );
}
