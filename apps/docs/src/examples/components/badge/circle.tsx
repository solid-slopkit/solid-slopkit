import { Badge, Group, Text } from '@solid-slopkit/components';

export default function Circle() {
  return (
    <>
      <Group gap={2}>
        <Text as="span">Inbox</Text>
        <Badge color="error" circle>
          3
        </Badge>
      </Group>
      <Group gap={2}>
        <Text as="span">Mentions</Text>
        <Badge color="primary" variant="soft" circle>
          99+
        </Badge>
      </Group>
    </>
  );
}
