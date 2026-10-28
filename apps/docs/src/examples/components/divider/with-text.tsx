import { Divider, Group, Text } from '@solid-slopkit/components';

export default function WithText() {
  return (
    <Group gap={3} wrap="nowrap" style={{ width: '100%' }}>
      <Divider />
      <Text as="span" size="sm" dimmed style={{ 'flex-shrink': '0' }}>
        or continue with
      </Text>
      <Divider />
    </Group>
  );
}
