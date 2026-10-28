import { Stack, Text, Title } from '@solid-slopkit/components';

export default function Size() {
  return (
    <Stack gap={1}>
      <Title order={2} size="h4">
        An h2 that looks like an h4
      </Title>
      <Text size="sm" dimmed>
        The outline still has a level-2 heading here.
      </Text>
    </Stack>
  );
}
