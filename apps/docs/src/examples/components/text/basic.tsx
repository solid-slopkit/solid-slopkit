import { Stack, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Stack gap={2}>
      <Text>Body text. Text is a paragraph by default, with no margin, so a Stack spaces it.</Text>
      <Text size="sm" dimmed>
        Secondary copy, smaller and muted.
      </Text>
    </Stack>
  );
}
